'use server'

import { prisma } from '@/lib/prisma'

export type SubmissionStatus =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'COMPILE_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT_EXCEEDED'
  | 'UNAUTHORIZED'
  | 'DISPLAY_ONLY'

export type TestCaseRunResult = {
  testCaseId: string
  status: SubmissionStatus
  statusLabel: string
  passed: boolean
  isSample?: boolean
  input: string
  expectedOutput: string
  actualOutput?: string
  runtime?: number
  memory?: number
  errorMessage?: string
}

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
  testResults?: TestCaseRunResult[]
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

interface LocalTestCase {
  id: string
  input: string
  expectedOutput: string
  isSample: boolean
  orderIndex: number
}

function getStatusLabel(status: SubmissionStatus): string {
  return status
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function getSubmissionStatusFromJudge0(statusId: number): SubmissionStatus {
  if (statusId === 3) return 'ACCEPTED'
  if (statusId === 4) return 'WRONG_ANSWER'
  if (statusId === 5) return 'TIME_LIMIT_EXCEEDED'
  if (statusId === 6) return 'COMPILE_ERROR'
  return 'RUNTIME_ERROR'
}

function getSafeTestCaseInput(testCase: LocalTestCase, index: number): string {
  return testCase.isSample ? testCase.input : `Hidden test case ${index + 1}`
}

function getSafeExpectedOutput(testCase: LocalTestCase): string {
  return testCase.isSample ? testCase.expectedOutput : 'Hidden'
}

function getWrongAnswerMessage(testCase: LocalTestCase, stdout: string, index: number): string {
  if (!testCase.isSample) {
    return `Wrong Answer on hidden testcase ${index + 1}.`
  }

  return `Wrong Answer on testcase.\nInput: ${testCase.input}\nOutput: ${stdout}\nExpected: ${testCase.expectedOutput}`
}

function getRuntimeErrorMessage(testCase: LocalTestCase, stderr: string, index: number): string {
  if (!testCase.isSample) {
    return `Runtime Error on hidden testcase ${index + 1}.`
  }

  return stderr || 'Runtime Error'
}

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
const rawInput = fs.readFileSync(0, 'utf-8').trim();
let s = rawInput;
try {
  const parsed = JSON.parse(rawInput);
  if (typeof parsed === 'string') s = parsed;
} catch {}
const result = isValid(s);
console.log(result ? "true" : "false");
      `.trim()
    }
    if (language === 'python') {
      return `
${userCode}

import sys
import json
raw_input = sys.stdin.read().strip()
s = raw_input
try:
    parsed = json.loads(raw_input)
    if isinstance(parsed, str):
        s = parsed
except Exception:
    pass
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
      { id: 'vp-tc-1', input: "()", expectedOutput: "true", isSample: true, orderIndex: 0 },
      { id: 'vp-tc-2', input: "()[]{}", expectedOutput: "true", isSample: true, orderIndex: 1 },
      { id: 'vp-tc-3', input: "(]", expectedOutput: "false", isSample: true, orderIndex: 2 },
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
  },
  'merge-two-sorted-lists': {
    id: 'merge-two-sorted-lists-id',
    title: 'Merge Two Sorted Lists',
    slug: 'merge-two-sorted-lists',
    difficulty: 'Easy',
    testCases: [
      { id: 'mts-tc-1', input: "[1,2,4]\n[1,3,4]", expectedOutput: "[1,1,2,3,4,4]", isSample: true, orderIndex: 0 },
      { id: 'mts-tc-2', input: "[]\n[]", expectedOutput: "[]", isSample: true, orderIndex: 1 },
    ]
  },
  'best-time-to-buy-and-sell-stock': {
    id: 'best-time-to-buy-and-sell-stock-id',
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    difficulty: 'Easy',
    testCases: [
      { id: 'bt-tc-1', input: "[7,1,5,3,6,4]", expectedOutput: "5", isSample: true, orderIndex: 0 },
      { id: 'bt-tc-2', input: "[7,6,4,3,1]", expectedOutput: "0", isSample: true, orderIndex: 1 },
    ]
  },
  'binary-search': {
    id: 'binary-search-id',
    title: 'Binary Search',
    slug: 'binary-search',
    difficulty: 'Easy',
    testCases: [
      { id: 'bs-tc-1', input: "[-1,0,3,5,9,12]\n9", expectedOutput: "4", isSample: true, orderIndex: 0 },
      { id: 'bs-tc-2', input: "[-1,0,3,5,9,12]\n2", expectedOutput: "-1", isSample: true, orderIndex: 1 },
    ]
  },
  'maximum-subarray': {
    id: 'maximum-subarray-id',
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    difficulty: 'Medium',
    testCases: [
      { id: 'ms-tc-1', input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6", isSample: true, orderIndex: 0 },
      { id: 'ms-tc-2', input: "[1]", expectedOutput: "1", isSample: true, orderIndex: 1 },
    ]
  },
  'product-of-array-except-self': {
    id: 'product-of-array-except-self-id',
    title: 'Product of Array Except Self',
    slug: 'product-of-array-except-self',
    difficulty: 'Medium',
    testCases: [
      { id: 'pa-tc-1', input: "[1,2,3,4]", expectedOutput: "[24,12,8,6]", isSample: true, orderIndex: 0 },
      { id: 'pa-tc-2', input: "[-1,1,0,-3,3]", expectedOutput: "[0,0,9,0,0]", isSample: true, orderIndex: 1 },
    ]
  },
  'longest-substring-without-repeating-characters': {
    id: 'longest-substring-without-repeating-characters-id',
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    testCases: [
      { id: 'lswrc-tc-1', input: "abcabcbb", expectedOutput: "3", isSample: true, orderIndex: 0 },
      { id: 'lswrc-tc-2', input: "bbbbb", expectedOutput: "1", isSample: true, orderIndex: 1 },
    ]
  },
  '3sum': {
    id: '3sum-id',
    title: '3Sum',
    slug: '3sum',
    difficulty: 'Medium',
    testCases: [
      { id: '3s-tc-1', input: "[-1,0,1,2,-1,-4]", expectedOutput: "[[-1,-1,2],[-1,0,1]]", isSample: true, orderIndex: 0 },
      { id: '3s-tc-2', input: "[0,1,1]", expectedOutput: "[]", isSample: true, orderIndex: 1 },
    ]
  },
  'coin-change': {
    id: 'coin-change-id',
    title: 'Coin Change',
    slug: 'coin-change',
    difficulty: 'Medium',
    testCases: [
      { id: 'cc-tc-1', input: "[1,2,5]\n11", expectedOutput: "3", isSample: true, orderIndex: 0 },
      { id: 'cc-tc-2', input: "[2]\n3", expectedOutput: "-1", isSample: true, orderIndex: 1 },
    ]
  },
  'binary-tree-level-order-traversal': {
    id: 'binary-tree-level-order-traversal-id',
    title: 'Binary Tree Level Order Traversal',
    slug: 'binary-tree-level-order-traversal',
    difficulty: 'Medium',
    testCases: [
      { id: 'btlot-tc-1', input: "[3,9,20,null,null,15,7]", expectedOutput: "[[3],[9,20],[15,7]]", isSample: true, orderIndex: 0 },
      { id: 'btlot-tc-2', input: "[1]", expectedOutput: "[[1]]", isSample: true, orderIndex: 1 },
    ]
  },
  'median-of-two-sorted-arrays': {
    id: 'median-of-two-sorted-arrays-id',
    title: 'Median of Two Sorted Arrays',
    slug: 'median-of-two-sorted-arrays',
    difficulty: 'Hard',
    testCases: [
      { id: 'motsa-tc-1', input: "[1,3]\n[2]", expectedOutput: "2.0", isSample: true, orderIndex: 0 },
      { id: 'motsa-tc-2', input: "[1,2]\n[3,4]", expectedOutput: "2.5", isSample: true, orderIndex: 1 },
    ]
  },
  'merge-k-sorted-lists': {
    id: 'merge-k-sorted-lists-id',
    title: 'Merge k Sorted Lists',
    slug: 'merge-k-sorted-lists',
    difficulty: 'Hard',
    testCases: [
      { id: 'mksl-tc-1', input: "[[1,4,5],[1,3,4],[2,6]]", expectedOutput: "[1,1,2,3,4,4,5,6]", isSample: true, orderIndex: 0 },
      { id: 'mksl-tc-2', input: "[]", expectedOutput: "[]", isSample: true, orderIndex: 1 },
    ]
  },
  'edit-distance': {
    id: 'edit-distance-id',
    title: 'Edit Distance',
    slug: 'edit-distance',
    difficulty: 'Hard',
    testCases: [
      { id: 'ed-tc-1', input: "horse\nros", expectedOutput: "3", isSample: true, orderIndex: 0 },
      { id: 'ed-tc-2', input: "intention\nexecution", expectedOutput: "5", isSample: true, orderIndex: 1 },
    ]
  }
}

export async function runCode(payload: {
  problemId: string
  problemSlug?: string
  language: string
  code: string
}): Promise<SubmissionResult> {
  const { problemId, problemSlug, language, code } = payload
  const normalizedLanguage = language.toLowerCase()
  const submittedAt = new Date().toISOString()

  // 1. Auth check first
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
  let problemSource: 'database' | 'mock' | null = null

  // 2. Resolve by slug first if provided
  if (problemSlug) {
    try {
      problem = await prisma.problem.findFirst({
        where: { slug: problemSlug },
        include: { testCases: true },
      })
      if (problem) {
        problemSource = 'database'
      }
    } catch (err) {
      console.warn(`[runCode] Database lookup by slug "${problemSlug}" failed, checking fallback:`, err)
    }

    if (!problem && MOCK_PROBLEMS[problemSlug]) {
      problem = MOCK_PROBLEMS[problemSlug]
      problemSource = 'mock'
    }
  }

  // 3. Otherwise resolve by exact DB id
  if (!problem && problemId) {
    try {
      if (problemId.length > 20) { // UUID check
        problem = await prisma.problem.findUnique({
          where: { id: problemId },
          include: { testCases: true },
        })
        if (problem) {
          problemSource = 'database'
        }
      }
    } catch (err) {
      console.warn(`[runCode] Database lookup by id "${problemId}" failed:`, err)
    }

    // 4. Otherwise resolve by mock id/slug only if explicitly known
    if (!problem) {
      const foundMockKey = Object.keys(MOCK_PROBLEMS).find(
        (key) => MOCK_PROBLEMS[key].id === problemId || MOCK_PROBLEMS[key].slug === problemId
      )
      if (foundMockKey) {
        problem = MOCK_PROBLEMS[foundMockKey]
        problemSource = 'mock'
      }
    }
  }

  // If unknown, return "Problem Not Found" error
  if (!problem) {
    return {
      status: 'COMPILE_ERROR',
      statusLabel: 'Problem Not Found',
      passedTests: 0,
      totalTests: 0,
      submittedAt,
      errorMessage: 'Không tìm thấy bài tập được chọn. Vui lòng tải lại trang hoặc chọn lại bài.',
    }
  }

  // 5. Display-only check
  const SUPPORTED_SLUGS = ['two-sum', 'valid-parentheses', 'palindrome-number']
  const isExecutable = SUPPORTED_SLUGS.includes(problem.slug)

  if (!isExecutable) {
    const testCasesCount = problem.testCases?.length || 2
    return {
      status: 'DISPLAY_ONLY',
      statusLabel: 'Display Only',
      passedTests: 0,
      totalTests: testCasesCount,
      submittedAt,
      errorMessage: 'Bài này hiện chỉ hỗ trợ xem đề. Chạy code chỉ khả dụng cho Two Sum, Valid Parentheses và Palindrome Number.',
    }
  }

  // 6. Language support check
  const SUPPORTED_LANGUAGES = ['javascript', 'python']
  if (!SUPPORTED_LANGUAGES.includes(normalizedLanguage)) {
    const testCasesCount = problem.testCases?.length || 2
    return {
      status: 'COMPILE_ERROR',
      statusLabel: 'Unsupported Language',
      passedTests: 0,
      totalTests: testCasesCount,
      submittedAt,
      errorMessage: 'Ngôn ngữ này chưa được hỗ trợ chạy code. Hiện tại chỉ hỗ trợ JavaScript và Python.',
    }
  }

  const testCases: LocalTestCase[] = [...(((problem?.testCases as LocalTestCase[]) ?? []))]
    .sort((a, b) => a.orderIndex - b.orderIndex)

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

  const wrappedCode = getWrappedCode(problem.slug, normalizedLanguage, code)
  const languageId = languageIds[normalizedLanguage] || 63

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
    const testResults: TestCaseRunResult[] = []

    for (let i = 0; i < results.length; i++) {
      const res = results[i]
      const testStatus = getSubmissionStatusFromJudge0(res.statusId)
      const testErrorMessage = res.statusId !== 3
        ? (res.testCase.isSample ? (res.stderr || res.compile_output || undefined) : getStatusLabel(testStatus))
        : undefined

      testResults.push({
        testCaseId: res.testCase.id,
        status: testStatus,
        statusLabel: getStatusLabel(testStatus),
        passed: testStatus === 'ACCEPTED',
        isSample: res.testCase.isSample,
        input: getSafeTestCaseInput(res.testCase, i),
        expectedOutput: getSafeExpectedOutput(res.testCase),
        actualOutput: res.testCase.isSample ? (res.stdout || undefined) : undefined,
        runtime: res.time !== undefined ? Math.round(res.time) : undefined,
        memory: res.memory,
        errorMessage: testErrorMessage,
      })

      if (testStatus === 'ACCEPTED') {
        passedTests++
      } else {
        if (!failedStatus) {
          if (testStatus === 'WRONG_ANSWER') {
            failedStatus = testStatus
            errorMessage = getWrongAnswerMessage(res.testCase, res.stdout, i)
          } else if (testStatus === 'TIME_LIMIT_EXCEEDED') {
            failedStatus = testStatus
            errorMessage = res.testCase.isSample ? undefined : `Time Limit Exceeded on hidden testcase ${i + 1}.`
          } else if (testStatus === 'COMPILE_ERROR') {
            failedStatus = testStatus
            errorMessage = res.compile_output || 'Compilation Error'
          } else {
            failedStatus = testStatus
            errorMessage = getRuntimeErrorMessage(res.testCase, res.stderr, i)
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
    const statusLabel = getStatusLabel(overallStatus)

    // 4. Save Submission & TestCaseResults to database
    let finalSubmittedAt = submittedAt
    if (problemSource === 'database') {
      try {
        const dbStatus = overallStatus as PrismaStatus
        const submission = await prisma.submission.create({
          data: {
            userId: user.id,
            problemId: problem.id,
            sourceCode: code,
            language: normalizedLanguage,
            judge0LanguageId: languageId,
            status: dbStatus,
            runtimeMs: overallStatus !== 'COMPILE_ERROR' ? Math.round(maxRuntime) : null,
            memoryKb: overallStatus !== 'COMPILE_ERROR' ? maxMemory : null,
            errorMessage: errorMessage || null,
            results: {
              create: results.map((res) => {
                const tcStatus = getSubmissionStatusFromJudge0(res.statusId) as PrismaStatus

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

        // 5. Update User Progress for this problem atomically (race condition safe)
        if (overallStatus === 'ACCEPTED') {
          const roundedRuntime = Math.round(maxRuntime)
          let attempts = 0
          while (attempts < 2) {
            try {
              await prisma.$transaction(async (tx) => {
                const existingProgress = await tx.problemProgress.findUnique({
                  where: {
                    userId_problemId: {
                      userId: user.id,
                      problemId: problem.id,
                    },
                  },
                })

                if (existingProgress) {
                  const bestRuntime = existingProgress.bestRuntimeMs !== null
                    ? Math.min(existingProgress.bestRuntimeMs, roundedRuntime)
                    : roundedRuntime

                  const bestMemory = existingProgress.bestMemoryKb !== null
                    ? Math.min(existingProgress.bestMemoryKb, maxMemory)
                    : maxMemory

                  await tx.problemProgress.update({
                    where: {
                      id: existingProgress.id,
                    },
                    data: {
                      isSolved: true,
                      bestRuntimeMs: bestRuntime,
                      bestMemoryKb: bestMemory,
                    },
                  })
                } else {
                  await tx.problemProgress.create({
                    data: {
                      userId: user.id,
                      problemId: problem.id,
                      isSolved: true,
                      solvedAt: new Date(),
                      bestRuntimeMs: roundedRuntime,
                      bestMemoryKb: maxMemory,
                    },
                  })
                }
              })
              break // Success! Exit the loop.
            } catch (err) {
              attempts++
              // If it's a unique constraint error (P2002 in Prisma), concurrent creation occurred.
              // Retry the transaction so it performs an update instead.
              const prismaError = err as { code?: string }
              if (prismaError?.code === 'P2002' && attempts < 2) {
                console.warn('[runCode] ProblemProgress concurrent create conflict, retrying transaction as update...')
                continue
              }
              throw err // Re-throw if other error or out of attempts
            }
          }
        }
      } catch (dbErr) {
        console.error('[runCode] Database persistence failed, proceeding without saving:', dbErr)
      }
    } else {
      console.warn('[runCode] Skipping persistence for mock fallback problem:', problem.slug)
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
      testResults,
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
