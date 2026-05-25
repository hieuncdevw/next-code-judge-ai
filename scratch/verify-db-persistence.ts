import 'dotenv/config'

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const MAX_PREVIEW_LENGTH = 120

function preview(value: string | null): string {
  if (value === null) {
    return 'null'
  }

  const normalized = value.replace(/\s+/g, ' ').trim()
  if (normalized.length <= MAX_PREVIEW_LENGTH) {
    return normalized
  }

  return `${normalized.slice(0, MAX_PREVIEW_LENGTH)}...`
}

function formatDate(value: Date | null): string {
  return value ? value.toISOString() : 'null'
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

async function main() {
  console.log('DB persistence verification')
  console.log('1. Login in browser with Clerk.')
  console.log('2. Run an accepted solution in the workspace.')
  console.log('3. Then run this script to confirm UserProfile, Submission, TestCaseResult, and ProblemProgress rows exist.')
  console.log('')

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL is missing. Configure it locally, then rerun this script.')
    process.exitCode = 1
    return
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: ['error'],
  })

  try {
    await prisma.$connect()

    const [userProfiles, submissions, testCaseResults, problemProgress] = await Promise.all([
      prisma.userProfile.count(),
      prisma.submission.count(),
      prisma.testCaseResult.count(),
      prisma.problemProgress.count(),
    ])

    console.log('Row counts')
    console.log(`- UserProfile: ${userProfiles}`)
    console.log(`- Submission: ${submissions}`)
    console.log(`- TestCaseResult: ${testCaseResults}`)
    console.log(`- ProblemProgress: ${problemProgress}`)
    console.log('')

    const latestSubmission = await prisma.submission.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            clerkUserId: true,
            email: true,
          },
        },
        problem: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
        results: {
          orderBy: { createdAt: 'asc' },
          include: {
            testCase: {
              select: {
                isSample: true,
                orderIndex: true,
              },
            },
          },
        },
      },
    })

    if (!latestSubmission) {
      console.log('No submissions found yet.')
      console.log('Login in browser, run code in the workspace, then rerun this script.')
      return
    }

    console.log('Latest submission')
    console.log(`- id: ${latestSubmission.id}`)
    console.log(`- status: ${latestSubmission.status}`)
    console.log(`- createdAt: ${latestSubmission.createdAt.toISOString()}`)
    console.log(`- userId: ${latestSubmission.userId}`)
    console.log(`- clerkUserId: ${latestSubmission.user.clerkUserId}`)
    console.log(`- userEmail: ${latestSubmission.user.email}`)
    console.log(`- problem: ${latestSubmission.problem.title} (${latestSubmission.problem.slug})`)
    console.log(`- language: ${latestSubmission.language}`)
    console.log(`- runtimeMs: ${latestSubmission.runtimeMs ?? 'null'}`)
    console.log(`- memoryKb: ${latestSubmission.memoryKb ?? 'null'}`)
    console.log(`- resultRows: ${latestSubmission.results.length}`)
    console.log('')

    console.log('Latest submission TestCaseResult rows')
    for (const [index, result] of latestSubmission.results.entries()) {
      const testCaseLabel = result.testCase
        ? `${result.testCase.isSample ? 'sample' : 'hidden'}#${result.testCase.orderIndex}`
        : 'deleted-testcase'

      console.log(`- Row ${index + 1}:`)
      console.log(`  status: ${result.status}`)
      console.log(`  testCase: ${testCaseLabel}`)
      console.log(`  input: ${preview(result.input)}`)
      console.log(`  expectedOutput: ${preview(result.expectedOutput)}`)
      console.log(`  actualOutput: ${preview(result.actualOutput)}`)
      console.log(`  runtimeMs: ${result.runtimeMs ?? 'null'}`)
      console.log(`  memoryKb: ${result.memoryKb ?? 'null'}`)
    }
    console.log('')

    const progress = await prisma.problemProgress.findUnique({
      where: {
        userId_problemId: {
          userId: latestSubmission.userId,
          problemId: latestSubmission.problemId,
        },
      },
    })

    console.log('ProblemProgress for latest user/problem')
    if (!progress) {
      console.log('- No ProblemProgress row found.')
    } else {
      console.log(`- id: ${progress.id}`)
      console.log(`- isSolved: ${progress.isSolved}`)
      console.log(`- solvedAt: ${formatDate(progress.solvedAt)}`)
      console.log(`- bestRuntimeMs: ${progress.bestRuntimeMs ?? 'null'}`)
      console.log(`- bestMemoryKb: ${progress.bestMemoryKb ?? 'null'}`)
      console.log(`- updatedAt: ${progress.updatedAt.toISOString()}`)
    }
    console.log('')

    console.log('Persistence check complete.')
    console.log('Expected success signal: nonzero counts, a latest Submission with TestCaseResult rows, and an isSolved=true ProblemProgress row after an accepted run.')
  } catch (error) {
    console.error('Could not verify DB persistence. The database may be offline or unreachable.')
    console.error(`Reason: ${getErrorMessage(error)}`)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect().catch(() => undefined)
  }
}

void main()
