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

const MOCK_PROBLEMS: Record<string, ProblemDetail> = {
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
  },
  'merge-two-sorted-lists': {
    id: 'merge-two-sorted-lists-id',
    title: 'Merge Two Sorted Lists',
    slug: 'merge-two-sorted-lists',
    description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn *the head of the merged linked list*.`,
    difficulty: 'Easy',
    tags: ['Linked List', 'Recursion'],
    constraints: `* The number of nodes in both lists is in the range \`[0, 50]\`.\n* \`-100 <= Node.val <= 100\`\n* Both \`list1\` and \`list2\` are sorted in non-decreasing order.`,
    timeLimitMs: 2000,
    memoryLimitKb: 262144,
    examples: [],
    testCases: [
      { id: 'mts-tc-1', input: "[1,2,4]\n[1,3,4]", expectedOutput: "[1,1,2,3,4,4]", isSample: true, orderIndex: 0 },
      { id: 'mts-tc-2', input: "[]\n[]", expectedOutput: "[]", isSample: true, orderIndex: 1 },
    ]
  },
  'best-time-to-buy-and-sell-stock': {
    id: 'best-time-to-buy-and-sell-stock-id',
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn *the maximum profit you can achieve from this transaction*. If you cannot achieve any profit, return \`0\`.`,
    difficulty: 'Easy',
    tags: ['Array', 'Dynamic Programming'],
    constraints: `* \`1 <= prices.length <= 10^5\`\n* \`0 <= prices[i] <= 10^4\``,
    timeLimitMs: 2000,
    memoryLimitKb: 262144,
    examples: [],
    testCases: [
      { id: 'bt-tc-1', input: "[7,1,5,3,6,4]", expectedOutput: "5", isSample: true, orderIndex: 0 },
      { id: 'bt-tc-2', input: "[7,6,4,3,1]", expectedOutput: "0", isSample: true, orderIndex: 1 },
    ]
  },
  'binary-search': {
    id: 'binary-search-id',
    title: 'Binary Search',
    slug: 'binary-search',
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.\n\nYou must write an algorithm with \`O(log n)\` runtime complexity.`,
    difficulty: 'Easy',
    tags: ['Array', 'Binary Search'],
    constraints: `* \`1 <= nums.length <= 10^4\`\n* \`-10^4 < nums[i], target < 10^4\`\n* All the integers in \`nums\` are unique.\n* \`nums\` is sorted in ascending order.`,
    timeLimitMs: 2000,
    memoryLimitKb: 262144,
    examples: [],
    testCases: [
      { id: 'bs-tc-1', input: "[-1,0,3,5,9,12]\n9", expectedOutput: "4", isSample: true, orderIndex: 0 },
      { id: 'bs-tc-2', input: "[-1,0,3,5,9,12]\n2", expectedOutput: "-1", isSample: true, orderIndex: 1 },
    ]
  },
  'maximum-subarray': {
    id: 'maximum-subarray-id',
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.`,
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    constraints: `* \`1 <= nums.length <= 10^5\`\n* \`-10^4 <= nums[i] <= 10^4\``,
    timeLimitMs: 2000,
    memoryLimitKb: 262144,
    examples: [],
    testCases: [
      { id: 'ms-tc-1', input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6", isSample: true, orderIndex: 0 },
      { id: 'ms-tc-2', input: "[1]", expectedOutput: "1", isSample: true, orderIndex: 1 },
    ]
  },
  'product-of-array-except-self': {
    id: 'product-of-array-except-self-id',
    title: 'Product of Array Except Self',
    slug: 'product-of-array-except-self',
    description: `Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`.\n\nThe product of any prefix or suffix of \`nums\` is guaranteed to fit in a 32-bit integer.\n\nYou must write an algorithm that runs in \`O(n)\` time and without using the division operation.`,
    difficulty: 'Medium',
    tags: ['Array'],
    constraints: `* \`2 <= nums.length <= 10^5\`\n* \`-30 <= nums[i] <= 30\`\n* The input is generated such that the product of any prefix or suffix of nums fits in a 32-bit integer.`,
    timeLimitMs: 2000,
    memoryLimitKb: 262144,
    examples: [],
    testCases: [
      { id: 'pa-tc-1', input: "[1,2,3,4]", expectedOutput: "[24,12,8,6]", isSample: true, orderIndex: 0 },
      { id: 'pa-tc-2', input: "[-1,1,0,-3,3]", expectedOutput: "[0,0,9,0,0]", isSample: true, orderIndex: 1 },
    ]
  },
  'longest-substring-without-repeating-characters': {
    id: 'longest-substring-without-repeating-characters-id',
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
    difficulty: 'Medium',
    tags: ['String', 'Hash Table'],
    constraints: `* \`0 <= s.length <= 5 * 10^4\`\n* \`s\` consists of English letters, digits, symbols and spaces.`,
    timeLimitMs: 2000,
    memoryLimitKb: 262144,
    examples: [],
    testCases: [
      { id: 'lswrc-tc-1', input: "abcabcbb", expectedOutput: "3", isSample: true, orderIndex: 0 },
      { id: 'lswrc-tc-2', input: "bbbbb", expectedOutput: "1", isSample: true, orderIndex: 1 },
    ]
  },
  '3sum': {
    id: '3sum-id',
    title: '3Sum',
    slug: '3sum',
    description: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.\n\nNotice that the solution set must not contain duplicate triplets.`,
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers'],
    constraints: `* \`3 <= nums.length <= 3000\`\n* \`-10^5 <= nums[i] <= 10^5\``,
    timeLimitMs: 2000,
    memoryLimitKb: 262144,
    examples: [],
    testCases: [
      { id: '3s-tc-1', input: "[-1,0,1,2,-1,-4]", expectedOutput: "[[-1,-1,2],[-1,0,1]]", isSample: true, orderIndex: 0 },
      { id: '3s-tc-2', input: "[0,1,1]", expectedOutput: "[]", isSample: true, orderIndex: 1 },
    ]
  },
  'coin-change': {
    id: 'coin-change-id',
    title: 'Coin Change',
    slug: 'coin-change',
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.\n\nYou may assume that you have an infinite number of each kind of coin.`,
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    constraints: `* \`1 <= coins.length <= 12\`\n* \`1 <= coins[i] <= 2^31 - 1\`\n* \`0 <= amount <= 10^4\``,
    timeLimitMs: 2000,
    memoryLimitKb: 262144,
    examples: [],
    testCases: [
      { id: 'cc-tc-1', input: "[1,2,5]\n11", expectedOutput: "3", isSample: true, orderIndex: 0 },
      { id: 'cc-tc-2', input: "[2]\n3", expectedOutput: "-1", isSample: true, orderIndex: 1 },
    ]
  },
  'binary-tree-level-order-traversal': {
    id: 'binary-tree-level-order-traversal-id',
    title: 'Binary Tree Level Order Traversal',
    slug: 'binary-tree-level-order-traversal',
    description: `Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).`,
    difficulty: 'Medium',
    tags: ['Tree'],
    constraints: `* The number of nodes in the tree is in the range \`[0, 2000]\`.\n* \`-1000 <= Node.val <= 1000\``,
    timeLimitMs: 2000,
    memoryLimitKb: 262144,
    examples: [],
    testCases: [
      { id: 'btlot-tc-1', input: "[3,9,20,null,null,15,7]", expectedOutput: "[[3],[9,20],[15,7]]", isSample: true, orderIndex: 0 },
      { id: 'btlot-tc-2', input: "[1]", expectedOutput: "[[1]]", isSample: true, orderIndex: 1 },
    ]
  },
  'median-of-two-sorted-arrays': {
    id: 'median-of-two-sorted-arrays-id',
    title: 'Median of Two Sorted Arrays',
    slug: 'median-of-two-sorted-arrays',
    description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be \`O(log (m+n))\`.`,
    difficulty: 'Hard',
    tags: ['Array', 'Binary Search'],
    constraints: `* \`nums1.length == m\`\n* \`nums2.length == n\`\n* \`0 <= m <= 1000\`\n* \`0 <= n <= 1000\`\n* \`1 <= m + n <= 2000\`\n* \`-10^6 <= nums1[i], nums2[i] <= 10^6\``,
    timeLimitMs: 2000,
    memoryLimitKb: 262144,
    examples: [],
    testCases: [
      { id: 'motsa-tc-1', input: "[1,3]\n[2]", expectedOutput: "2.0", isSample: true, orderIndex: 0 },
      { id: 'motsa-tc-2', input: "[1,2]\n[3,4]", expectedOutput: "2.5", isSample: true, orderIndex: 1 },
    ]
  },
  'merge-k-sorted-lists': {
    id: 'merge-k-sorted-lists-id',
    title: 'Merge k Sorted Lists',
    slug: 'merge-k-sorted-lists',
    description: `You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.`,
    difficulty: 'Hard',
    tags: ['Linked List', 'Divide and Conquer'],
    constraints: `* \`k == lists.length\`\n* \`0 <= k <= 10^4\`\n* \`0 <= lists[i].length <= 500\`\n* \`-10^4 <= lists[i][j] <= 10^4\`\n* \`lists[i]\` is sorted in non-decreasing order.\n* The sum of \`lists[i].length\` will not exceed \`10^4\`.`,
    timeLimitMs: 2000,
    memoryLimitKb: 262144,
    examples: [],
    testCases: [
      { id: 'mksl-tc-1', input: "[[1,4,5],[1,3,4],[2,6]]", expectedOutput: "[1,1,2,3,4,4,5,6]", isSample: true, orderIndex: 0 },
      { id: 'mksl-tc-2', input: "[]", expectedOutput: "[]", isSample: true, orderIndex: 1 },
    ]
  },
  'edit-distance': {
    id: 'edit-distance-id',
    title: 'Edit Distance',
    slug: 'edit-distance',
    description: `Given two strings \`word1\` and \`word2\`, return the minimum number of operations required to convert \`word1\` to \`word2\`.\n\nYou have the following three operations permitted on a word:\n* Insert a character\n* Delete a character\n* Replace a character`,
    difficulty: 'Hard',
    tags: ['String', 'Dynamic Programming'],
    constraints: `* \`0 <= word1.length, word2.length <= 500\`\n* \`word1\` and \`word2\` consist of lowercase English letters.`,
    timeLimitMs: 2000,
    memoryLimitKb: 262144,
    examples: [],
    testCases: [
      { id: 'ed-tc-1', input: "horse\nros", expectedOutput: "3", isSample: true, orderIndex: 0 },
      { id: 'ed-tc-2', input: "intention\nexecution", expectedOutput: "5", isSample: true, orderIndex: 1 },
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
      return null
    }

    return {
      ...problem,
      difficulty: DIFFICULTY_LABEL[problem.difficulty],
    }
  } catch (err) {
    const isDev = process.env.NODE_ENV === 'development'
    if (isDev) {
      console.warn(`[getProblemBySlug] Database error, falling back to mock problem list for "${slug}":`, err)
      return (MOCK_PROBLEMS[slug] as ProblemDetail) || null
    }
    console.error(`[getProblemBySlug] Database error in production:`, err)
    return null
  }
}
