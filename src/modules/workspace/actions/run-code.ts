'use server'

import { prisma } from '@/lib/prisma'

export type SubmissionStatus =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'COMPILE_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT_EXCEEDED'
  | 'UNAUTHORIZED'

export type SubmissionResult = {
  status: SubmissionStatus
  statusLabel: string
  /** Execution time in milliseconds, undefined on compile/internal errors */
  runtime?: number
  /** Peak memory in KB, undefined on compile/internal errors */
  memory?: number
  /** Error message for COMPILE_ERROR / RUNTIME_ERROR / WRONG_ANSWER */
  errorMessage?: string
  passedTests: number
  totalTests: number
  submittedAt: string
}

const languageIds: Record<string, number> = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  typescript: 74,
}

const RAPIDAPI_SUBMIT_DELAY_MS = 1200
const RAPIDAPI_POLL_DELAY_MS = 1000

/**
 * Returns wrapped code with driver wrapper script to execute LeetCode style functions via stdin/stdout.
 */
function getWrappedCode(slug: string, language: string, userCode: string): string {
  if (slug === 'two-sum') {
    if (language === 'javascript') {
      return `
${userCode}

const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (input.length >= 2) {
  const nums = JSON.parse(input[0]);
  const target = parseInt(input[1]);
  const result = twoSum(nums, target);
  console.log(JSON.stringify(result));
}
      `.trim()
    }
    if (language === 'python') {
      return `
${userCode}

import sys, json
lines = sys.stdin.read().strip().split('\\n')
if len(lines) >= 2:
    nums = json.loads(lines[0])
    target = int(lines[1])
    result = twoSum(nums, target)
    print(json.dumps(result))
      `.trim()
    }
  }

  if (slug === 'valid-parentheses') {
    if (language === 'javascript') {
      return `
${userCode}

const fs = require('fs');
const s = fs.readFileSync(0, 'utf-8').trim();
const result = isValid(s);
console.log(result ? "true" : "false");
      `.trim()
    }
    if (language === 'python') {
      return `
${userCode}

import sys
s = sys.stdin.read().strip()
result = isValid(s)
print("true" if result else "false")
      `.trim()
    }
  }

  if (slug === 'palindrome-number') {
    if (language === 'javascript') {
      return `
${userCode}

const fs = require('fs');
const x = parseInt(fs.readFileSync(0, 'utf-8').trim());
const result = isPalindrome(x);
console.log(result ? "true" : "false");
      `.trim()
    }
    if (language === 'python') {
      return `
${userCode}

import sys
val = sys.stdin.read().strip()
if val:
    x = int(val)
    result = isPalindrome(x)
    print("true" if result else "false")
      `.trim()
    }
  }

  return userCode
}

async function submitToJudge0(
  apiUrl: string,
  headers: Record<string, string>,
  wrappedCode: string,
  languageId: number,
  stdin: string,
  expectedOutput: string
): Promise<string> {
  const body = {
    source_code: Buffer.from(wrappedCode).toString('base64'),
    language_id: languageId,
    stdin: Buffer.from(stdin).toString('base64'),
    expected_output: Buffer.from(expectedOutput).toString('base64'),
  }

  const res = await fetch(`${apiUrl}/submissions?base64_encoded=true`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Rate Limited')
    }
    throw new Error(`Judge0 submit failed: HTTP ${res.status}`)
  }

  const data = (await res.json()) as { token: string }
  return data.token
}

async function pollSubmission(
  apiUrl: string,
  headers: Record<string, string>,
  token: string
) {
  const maxAttempts = 15
  const isRapidAPI = apiUrl.includes('rapidapi.com')
  const pollDelay = isRapidAPI ? RAPIDAPI_POLL_DELAY_MS : 500

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (isRapidAPI) {
      await new Promise((resolve) => setTimeout(resolve, pollDelay))
    }
    const res = await fetch(`${apiUrl}/submissions/${token}?base64_encoded=true`, {
      headers,
    })

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error('Rate Limited')
      }
      throw new Error(`Judge0 poll failed: HTTP ${res.status}`)
    }

    const data = (await res.json()) as {
      status: { id: number; description: string }
      stdout?: string
      stderr?: string
      compile_output?: string
      time?: string
      memory?: number
    }

    if (data.status.id > 2) {
      const stdout = data.stdout ? Buffer.from(data.stdout, 'base64').toString('utf-8').trim() : ''
      const stderr = data.stderr ? Buffer.from(data.stderr, 'base64').toString('utf-8').trim() : ''
      const compile_output = data.compile_output ? Buffer.from(data.compile_output, 'base64').toString('utf-8').trim() : ''
      return {
        statusId: data.status.id,
        statusDescription: data.status.description,
        stdout,
        stderr,
        compile_output,
        time: data.time ? parseFloat(data.time) * 1000 : undefined,
        memory: data.memory,
      }
    }

    if (!isRapidAPI) {
      await new Promise((resolve) => setTimeout(resolve, pollDelay))
    }
  }

  throw new Error('Judge0 submission timed out after 15 attempts')
}

import { getCurrentUser } from '@/lib/auth'
import { SubmissionStatus as PrismaStatus } from '@/generated/prisma/client'

interface MockTestCase {
  id: string
  input: string
  expectedOutput: string
  isSample: boolean
  orderIndex: number
}

interface MockProblem {
  id: string
  title: string
  slug: string
  difficulty: string
  testCases: MockTestCase[]
}

const MOCK_PROBLEMS: Record<string, MockProblem> = {
  'two-sum': {
    id: 'two-sum-id',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    testCases: [
      { id: 'ts-tc-1', input: "[2,7,11,15]\n9", expectedOutput: "[0,1]", isSample: true, orderIndex: 0 },
      { id: 'ts-tc-2', input: "[3,2,4]\n6", expectedOutput: "[1,2]", isSample: true, orderIndex: 1 },
      { id: 'ts-tc-3', input: "[3,3]\n6", expectedOutput: "[0,1]", isSample: true, orderIndex: 2 },
    ]
  },
  'valid-parentheses': {
    id: 'valid-parentheses-id',
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    testCases: [
      { id: 'vp-tc-1', input: '"()"', expectedOutput: "true", isSample: true, orderIndex: 0 },
      { id: 'vp-tc-2', input: '"()[]{}"', expectedOutput: "true", isSample: true, orderIndex: 1 },
      { id: 'vp-tc-3', input: '"(]"', expectedOutput: "false", isSample: true, orderIndex: 2 },
    ]
  },
  'palindrome-number': {
    id: 'palindrome-number-id',
    title: 'Palindrome Number',
    slug: 'palindrome-number',
    difficulty: 'Easy',
    testCases: [
      { id: 'pn-tc-1', input: "121", expectedOutput: "true", isSample: true, orderIndex: 0 },
      { id: 'pn-tc-2', input: "-121", expectedOutput: "false", isSample: true, orderIndex: 1 },
      { id: 'pn-tc-3', input: "10", expectedOutput: "false", isSample: true, orderIndex: 2 },
    ]
  }
}

export async function runCode(payload: {
  problemId: string
  language: string
  code: string
}): Promise<SubmissionResult> {
  const { problemId, language, code } = payload
  const submittedAt = new Date().toISOString()

  // 1. Fetch user details from DB resiliently
  const user = await getCurrentUser()

  if (!user) {
    return {
      status: 'UNAUTHORIZED',
      statusLabel: 'Login Required',
      passedTests: 0,
      totalTests: 0,
      submittedAt,
      errorMessage: 'Bạn cần đăng nhập để nộp bài và lưu kết quả.',
    }
  }

  let problem = null
  try {
    if (problemId && problemId.length > 20) { // UUID check
      problem = await prisma.problem.findUnique({
        where: { id: problemId },
        include: { testCases: true },
      })
    }
  } catch (err) {
    console.warn('[runCode] Database lookup by id failed, checking fallback:', err)
  }

  if (!problem) {
    const slug = MOCK_PROBLEMS[problemId] ? problemId : 'two-sum'
    try {
      problem = await prisma.problem.findFirst({
        where: { slug },
        include: { testCases: true },
      })
    } catch (err) {
      console.warn(`[runCode] Database lookup by slug "${slug}" failed, using mock data:`, err)
    }

    if (!problem) {
      problem = MOCK_PROBLEMS[slug]
    }
  }

interface LocalTestCase {
  id: string
  input: string
  expectedOutput: string
  isSample: boolean
  orderIndex: number
}

  const testCases: LocalTestCase[] = ((problem?.testCases as LocalTestCase[]) ?? []).filter((tc) => tc.isSample)
  if (testCases.length === 0 && problem?.testCases) {
    testCases.push(...(problem.testCases as LocalTestCase[]))
  }

  if (!problem || testCases.length === 0) {
    return {
      status: 'COMPILE_ERROR',
      statusLabel: 'Compile Error',
      passedTests: 0,
      totalTests: 0,
      submittedAt,
      errorMessage: 'No test cases found for this problem.',
    }
  }

  const wrappedCode = getWrappedCode(problem.slug, language, code)
  const languageId = languageIds[language] || 63

  const apiUrl = process.env.JUDGE0_API_URL || 'http://localhost:2358'
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (process.env.JUDGE0_API_KEY) {
    headers['x-rapidapi-key'] = process.env.JUDGE0_API_KEY
    headers['x-judge0-api-key'] = process.env.JUDGE0_API_KEY
  }
  if (process.env.JUDGE0_RAPIDAPI_HOST) {
    headers['x-rapidapi-host'] = process.env.JUDGE0_RAPIDAPI_HOST
  }

  try {
    let results: Array<Awaited<ReturnType<typeof pollSubmission>> & { testCase: LocalTestCase }> = []
    const isRapidAPI = apiUrl.includes('rapidapi.com')

    if (isRapidAPI) {
      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i]
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, RAPIDAPI_SUBMIT_DELAY_MS))
        }
        const token = await submitToJudge0(apiUrl, headers, wrappedCode, languageId, tc.input, tc.expectedOutput)
        const result = await pollSubmission(apiUrl, headers, token)
        results.push({ ...result, testCase: tc })
      }
    } else {
      const submissionPromises = testCases.map(async (tc) => {
        const token = await submitToJudge0(apiUrl, headers, wrappedCode, languageId, tc.input, tc.expectedOutput)
        return { token, testCase: tc }
      })

      const submissions = await Promise.all(submissionPromises)

      const pollPromises = submissions.map(async (sub) => {
        const result = await pollSubmission(apiUrl, headers, sub.token)
        return { ...result, testCase: sub.testCase }
      })

      results = await Promise.all(pollPromises)
    }

    let passedTests = 0
    let maxRuntime = 0
    let maxMemory = 0
    let failedStatus: SubmissionStatus | null = null
    let errorMessage: string | undefined = undefined

    for (const res of results) {
      if (res.statusId === 3) {
        passedTests++
      } else {
        if (!failedStatus) {
          if (res.statusId === 4) {
            failedStatus = 'WRONG_ANSWER'
            errorMessage = `Wrong Answer on testcase.\nInput: ${res.testCase.input}\nOutput: ${res.stdout}\nExpected: ${res.testCase.expectedOutput}`
          } else if (res.statusId === 5) {
            failedStatus = 'TIME_LIMIT_EXCEEDED'
          } else if (res.statusId === 6) {
            failedStatus = 'COMPILE_ERROR'
            errorMessage = res.compile_output || 'Compilation Error'
          } else {
            failedStatus = 'RUNTIME_ERROR'
            errorMessage = res.stderr || 'Runtime Error'
          }
        }
      }

      if (res.time !== undefined && res.time > maxRuntime) {
        maxRuntime = res.time
      }
      if (res.memory !== undefined && res.memory > maxMemory) {
        maxMemory = res.memory
      }
    }

    const overallStatus: SubmissionStatus = failedStatus || 'ACCEPTED'
    const statusLabel = overallStatus
      .toLowerCase()
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

    // 4. Save Submission & TestCaseResults to database
    let finalSubmittedAt = submittedAt
    try {
      const dbStatus = overallStatus as PrismaStatus
      const submission = await prisma.submission.create({
        data: {
          userId: user.id,
          problemId: problem.id,
          sourceCode: code,
          language,
          judge0LanguageId: languageId,
          status: dbStatus,
          runtimeMs: overallStatus !== 'COMPILE_ERROR' ? Math.round(maxRuntime) : null,
          memoryKb: overallStatus !== 'COMPILE_ERROR' ? maxMemory : null,
          errorMessage: errorMessage || null,
          results: {
            create: results.map((res) => {
              let tcStatus: PrismaStatus = 'RUNTIME_ERROR'
              if (res.statusId === 3) tcStatus = 'ACCEPTED'
              else if (res.statusId === 4) tcStatus = 'WRONG_ANSWER'
              else if (res.statusId === 5) tcStatus = 'TIME_LIMIT_EXCEEDED'
              else if (res.statusId === 6) tcStatus = 'COMPILE_ERROR'

              return {
                testCaseId: res.testCase.id,
                input: res.testCase.input,
                expectedOutput: res.testCase.expectedOutput,
                actualOutput: res.stdout || null,
                status: tcStatus,
                runtimeMs: res.time !== undefined ? Math.round(res.time) : null,
                memoryKb: res.memory || null,
                errorMessage: res.statusId !== 3 ? (res.stderr || res.compile_output || null) : null,
              }
            }),
          },
        },
      })
      finalSubmittedAt = submission.createdAt.toISOString()

      // 5. Update User Progress for this problem
      if (overallStatus === 'ACCEPTED') {
        const roundedRuntime = Math.round(maxRuntime)
        const existingProgress = await prisma.problemProgress.findUnique({
          where: {
            userId_problemId: {
              userId: user.id,
              problemId: problem.id,
            },
          },
        })

        const bestRuntime = existingProgress?.bestRuntimeMs
          ? Math.min(existingProgress.bestRuntimeMs, roundedRuntime)
          : roundedRuntime

        const bestMemory = existingProgress?.bestMemoryKb
          ? Math.min(existingProgress.bestMemoryKb, maxMemory)
          : maxMemory

        await prisma.problemProgress.upsert({
          where: {
            userId_problemId: {
              userId: user.id,
              problemId: problem.id,
            },
          },
          update: {
            isSolved: true,
            solvedAt: existingProgress?.solvedAt || new Date(),
            bestRuntimeMs: bestRuntime,
            bestMemoryKb: bestMemory,
          },
          create: {
            userId: user.id,
            problemId: problem.id,
            isSolved: true,
            solvedAt: new Date(),
            bestRuntimeMs: roundedRuntime,
            bestMemoryKb: maxMemory,
          },
        })
      }
    } catch (dbErr) {
      console.error('[runCode] Database persistence failed, proceeding without saving:', dbErr)
    }

    return {
      status: overallStatus,
      statusLabel,
      runtime: overallStatus !== 'COMPILE_ERROR' ? Math.round(maxRuntime) : undefined,
      memory: overallStatus !== 'COMPILE_ERROR' ? maxMemory : undefined,
      errorMessage,
      passedTests: passedTests,
      totalTests: testCases.length,
      submittedAt: finalSubmittedAt,
    }
  } catch (err: unknown) {
    console.error('[runCode] Judge0 execution failed:', err)
    const message = err instanceof Error ? err.message : String(err)
    if (message === 'Rate Limited') {
      return {
        status: 'RUNTIME_ERROR',
        statusLabel: 'Rate Limited',
        passedTests: 0,
        totalTests: testCases.length,
        submittedAt,
        errorMessage: 'RapidAPI rate limit hit. Wait a few minutes or upgrade plan.',
      }
    }
    return {
      status: 'COMPILE_ERROR',
      statusLabel: 'Connection Failed',
      passedTests: 0,
      totalTests: testCases.length,
      submittedAt,
      errorMessage: `Could not connect to Judge0 API at ${apiUrl}.\nDetails: ${message}\n\nPlease ensure your Judge0 instance is running or configure JUDGE0_API_URL in your environment.`,
    }
  }
}
