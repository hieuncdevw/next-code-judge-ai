import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true })

const FALLBACK_CLERK_USER_ID = 'mock-clerk-user-12345'
const PROBLEM_SLUG = 'two-sum'

function getErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : null
  const message = error instanceof Error ? error.message.trim() : String(error).trim()

  if (code && message) {
    return `${code}: ${message}`
  }
  if (code) {
    return code
  }
  return message || 'Unknown error'
}

function printFail(message: string) {
  console.error(`DB persistence verification: FAIL`)
  console.error(message)
}

async function main() {
  console.log('DB persistence verification via local development fallback')
  console.log('This script changes auth env only inside this Node process.')
  console.log('')

  if (!process.env.DATABASE_URL) {
    printFail('DATABASE_URL is missing. Configure the local database connection, then rerun this script.')
    process.exitCode = 1
    return
  }

  const scriptEnv = process.env as Record<string, string | undefined>
  scriptEnv.NODE_ENV = 'development'
  scriptEnv.ALLOW_DEV_AUTH_FALLBACK = 'true'
  delete scriptEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  delete scriptEnv.CLERK_SECRET_KEY

  console.log('Process-local auth mode')
  console.log('- NODE_ENV: development')
  console.log('- ALLOW_DEV_AUTH_FALLBACK: true')
  console.log('- Clerk env keys: cleared in this process only')
  console.log('')

  const { prisma } = await import('../src/lib/prisma')

  try {
    await prisma.$connect()

    const problem = await prisma.problem.findUnique({
      where: { slug: PROBLEM_SLUG },
      include: { testCases: true },
    })

    if (!problem) {
      printFail(`Seed data is missing: problem "${PROBLEM_SLUG}" was not found.`)
      process.exitCode = 1
      return
    }

    if (problem.testCases.length === 0) {
      printFail(`Seed data is incomplete: problem "${PROBLEM_SLUG}" has no test cases.`)
      process.exitCode = 1
      return
    }

    const { runCode } = await import('../src/modules/workspace/actions/run-code')

    const code = `
var twoSum = function(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return [];
};
    `.trim()

    const startedAt = new Date()
    const result = await runCode({
      problemId: problem.id,
      problemSlug: problem.slug,
      language: 'javascript',
      code,
    })

    console.log('runCode result')
    console.log(`- status: ${result.status}`)
    console.log(`- passedTests: ${result.passedTests}`)
    console.log(`- totalTests: ${result.totalTests}`)
    console.log('')

    const accepted =
      result.status === 'ACCEPTED' &&
      result.totalTests > 0 &&
      result.passedTests === result.totalTests

    if (!accepted) {
      printFail(result.errorMessage ?? 'runCode did not return an accepted result.')
      process.exitCode = 1
      return
    }

    const [userProfileCount, submissionCount, testCaseResultCount, problemProgressCount] = await Promise.all([
      prisma.userProfile.count(),
      prisma.submission.count(),
      prisma.testCaseResult.count(),
      prisma.problemProgress.count(),
    ])

    const latestSubmission = await prisma.submission.findFirst({
      where: {
        problemId: problem.id,
        createdAt: {
          gte: startedAt,
        },
        user: {
          clerkUserId: FALLBACK_CLERK_USER_ID,
        },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        problemId: true,
        userId: true,
      },
    })

    if (!latestSubmission) {
      printFail('runCode returned ACCEPTED, but no matching Submission row was found.')
      process.exitCode = 1
      return
    }

    const relatedTestCaseResultRows = await prisma.testCaseResult.count({
      where: {
        submissionId: latestSubmission.id,
      },
    })

    const matchingProgress = await prisma.problemProgress.findUnique({
      where: {
        userId_problemId: {
          userId: latestSubmission.userId,
          problemId: latestSubmission.problemId,
        },
      },
      select: {
        isSolved: true,
      },
    })

    console.log('Database row counts')
    console.log(`- UserProfile count: ${userProfileCount}`)
    console.log(`- Submission count: ${submissionCount}`)
    console.log(`- TestCaseResult count: ${testCaseResultCount}`)
    console.log(`- ProblemProgress count: ${problemProgressCount}`)
    console.log('')

    console.log('Latest matching submission')
    console.log(`- status: ${latestSubmission.status}`)
    console.log(`- problemId: ${latestSubmission.problemId}`)
    console.log(`- userProfileId: ${latestSubmission.userId}`)
    console.log(`- related TestCaseResult rows count: ${relatedTestCaseResultRows}`)
    console.log(`- matching ProblemProgress solved status: ${matchingProgress?.isSolved ?? false}`)
    console.log('')

    const persisted =
      userProfileCount > 0 &&
      submissionCount > 0 &&
      testCaseResultCount > 0 &&
      problemProgressCount > 0 &&
      latestSubmission.status === 'ACCEPTED' &&
      relatedTestCaseResultRows === result.totalTests &&
      matchingProgress?.isSolved === true

    if (!persisted) {
      printFail('Accepted run completed, but one or more expected persistence rows are missing.')
      process.exitCode = 1
      return
    }

    console.log('DB persistence verification: PASS')
  } catch (error) {
    printFail(`Could not complete verification. The database may be offline, Judge0 may be unreachable, or seed data may be incomplete. Reason: ${getErrorMessage(error)}`)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect().catch(() => undefined)
  }
}

void main()
