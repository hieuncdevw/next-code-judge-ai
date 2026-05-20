import { prisma } from '@/lib/prisma'
import { Difficulty } from '@/generated/prisma/enums'

const DIFFICULTY_LABEL: Record<Difficulty, 'Easy' | 'Medium' | 'Hard'> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
}

export type ProblemDetail = {
  id: string
  title: string
  slug: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  tags: string[]
  constraints: string | null
  timeLimitMs: number
  memoryLimitKb: number
  examples: unknown
  testCases: {
    id: string
    input: string
    expectedOutput: string
    isSample: boolean
    orderIndex: number
  }[]
}

const MOCK_PROBLEMS: Record<string, any> = {
  'two-sum': {
    id: 'two-sum-id',
    title: 'Two Sum',
    slug: 'two-sum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.\n\nYou may assume that each input would have ***exactly* one solution**, and you may not use the *same* element twice.\n\nYou can return the answer in any order.`,
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    constraints: `* \`2 <= nums.length <= 10^4\`\n* \`-10^9 <= nums[i] <= 10^9\`\n* \`-10^9 <= target <= 10^9\`\n* **Exactly one valid answer exists.**`,
    timeLimitMs: 2000,
    memoryLimitKb: 262144,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }
    ],
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
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.`,
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    constraints: `* \`1 <= s.length <= 10^4\`\n* \`s\` consists of parentheses only \`'()[]{}'\`.`,
    timeLimitMs: 2000,
    memoryLimitKb: 262144,
    examples: [],
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
    description: `Given an integer \`x\`, return \`true\` *if \`x\` is a palindrome, and \`false\` otherwise*.`,
    difficulty: 'Easy',
    tags: ['Math'],
    constraints: `* \`-2^31 <= x <= 2^31 - 1\``,
    timeLimitMs: 2000,
    memoryLimitKb: 262144,
    examples: [],
    testCases: [
      { id: 'pn-tc-1', input: "121", expectedOutput: "true", isSample: true, orderIndex: 0 },
      { id: 'pn-tc-2', input: "-121", expectedOutput: "false", isSample: true, orderIndex: 1 },
      { id: 'pn-tc-3', input: "10", expectedOutput: "false", isSample: true, orderIndex: 2 },
    ]
  }
}

export async function getProblemBySlug(
  slug: string
): Promise<ProblemDetail | null> {
  try {
    const problem = await prisma.problem.findUnique({
      where: { slug, isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        difficulty: true,
        tags: true,
        constraints: true,
        timeLimitMs: true,
        memoryLimitKb: true,
        examples: true,
        testCases: {
          where: { isSample: true },
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            input: true,
            expectedOutput: true,
            isSample: true,
            orderIndex: true,
          },
        },
      },
    })

    if (!problem) {
      return (MOCK_PROBLEMS[slug] as ProblemDetail) || null
    }

    return {
      ...problem,
      difficulty: DIFFICULTY_LABEL[problem.difficulty],
    }
  } catch (err) {
    console.warn(`[getProblemBySlug] Database error, falling back to mock problem list for "${slug}":`, err)
    return (MOCK_PROBLEMS[slug] as ProblemDetail) || null
  }
}
