/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import { PrismaClient, Difficulty } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

interface TestCaseInput {
  input: string;
  expectedOutput: string;
  isSample: boolean;
  orderIndex: number;
}

interface ProblemInput {
  title: string;
  slug: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  examples: any[];
  constraints?: string;
  timeLimitMs?: number;
  memoryLimitKb?: number;
  testCases: TestCaseInput[];
}

async function upsertProblem(data: ProblemInput) {
  console.log(`Upserting problem: ${data.title} (${data.slug})`);
  
  const problem = await prisma.problem.upsert({
    where: { slug: data.slug },
    update: {
      title: data.title,
      difficulty: data.difficulty,
      tags: data.tags,
      description: data.description.trim(),
      examples: data.examples,
      constraints: data.constraints?.trim() || null,
      timeLimitMs: data.timeLimitMs ?? 1000,
      memoryLimitKb: data.memoryLimitKb ?? 262144,
      isPublished: true,
    },
    create: {
      title: data.title,
      slug: data.slug,
      difficulty: data.difficulty,
      tags: data.tags,
      description: data.description.trim(),
      examples: data.examples,
      constraints: data.constraints?.trim() || null,
      timeLimitMs: data.timeLimitMs ?? 1000,
      memoryLimitKb: data.memoryLimitKb ?? 262144,
      isPublished: true,
    },
  });

  // Re-create test cases for this problem to avoid duplicates
  await prisma.testCase.deleteMany({
    where: { problemId: problem.id },
  });

  await prisma.testCase.createMany({
    data: data.testCases.map((tc) => ({
      problemId: problem.id,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      isSample: tc.isSample,
      orderIndex: tc.orderIndex,
    })),
  });

  return problem;
}

async function main() {
  console.log("Start seeding...");

  // 1. Two Sum (EASY)
  await upsertProblem({
    title: "Two Sum",
    slug: "two-sum",
    difficulty: Difficulty.EASY,
    tags: ["Array", "Hash Table"],
    description: `
## Problem

Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

## Input

- First line: array of integers
- Second line: target number

## Output

- Array containing two indices
    `.trim(),
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9.",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
    ],
    constraints: `
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.
    `.trim(),
    timeLimitMs: 1000,
    memoryLimitKb: 262144,
    testCases: [
      {
        input: "[2,7,11,15]\n9",
        expectedOutput: "[0,1]",
        isSample: true,
        orderIndex: 1,
      },
      {
        input: "[3,2,4]\n6",
        expectedOutput: "[1,2]",
        isSample: true,
        orderIndex: 2,
      },
      {
        input: "[3,3]\n6",
        expectedOutput: "[0,1]",
        isSample: false,
        orderIndex: 3,
      },
    ],
  });

  // 2. Valid Parentheses (EASY)
  await upsertProblem({
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: Difficulty.EASY,
    tags: ["String", "Stack"],
    description: `
## Problem

Given a string \`s\` containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.

An input string is valid if:
- Open brackets must be closed by the same type of brackets.
- Open brackets must be closed in the correct order.
    `.trim(),
    examples: [
      {
        input: 's = "()"',
        output: "true",
      },
      {
        input: 's = "()[]{}"',
        output: "true",
      },
      {
        input: 's = "(]"',
        output: "false",
      },
    ],
    constraints: `
- 1 <= s.length <= 10^4
- s consists of parentheses only: ()[]{}
    `.trim(),
    timeLimitMs: 1000,
    memoryLimitKb: 262144,
    testCases: [
      {
        input: "()",
        expectedOutput: "true",
        isSample: true,
        orderIndex: 1,
      },
      {
        input: "()[]{}",
        expectedOutput: "true",
        isSample: true,
        orderIndex: 2,
      },
      {
        input: "(]",
        expectedOutput: "false",
        isSample: true,
        orderIndex: 3,
      },
      {
        input: "([)]",
        expectedOutput: "false",
        isSample: false,
        orderIndex: 4,
      },
      {
        input: "{[]}",
        expectedOutput: "true",
        isSample: false,
        orderIndex: 5,
      },
    ],
  });

  // 3. Palindrome Number (EASY)
  await upsertProblem({
    title: "Palindrome Number",
    slug: "palindrome-number",
    difficulty: Difficulty.EASY,
    tags: ["Math"],
    description: `
## Problem

Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

An integer is a palindrome when it reads the same forward and backward.
    `.trim(),
    examples: [
      {
        input: "x = 121",
        output: "true",
      },
      {
        input: "x = -121",
        output: "false",
      },
      {
        input: "x = 10",
        output: "false",
      },
    ],
    constraints: `
- -2^31 <= x <= 2^31 - 1
    `.trim(),
    timeLimitMs: 1000,
    memoryLimitKb: 262144,
    testCases: [
      {
        input: "121",
        expectedOutput: "true",
        isSample: true,
        orderIndex: 1,
      },
      {
        input: "-121",
        expectedOutput: "false",
        isSample: true,
        orderIndex: 2,
      },
      {
        input: "10",
        expectedOutput: "false",
        isSample: true,
        orderIndex: 3,
      },
      {
        input: "0",
        expectedOutput: "true",
        isSample: false,
        orderIndex: 4,
      },
    ],
  });

  // 4. Merge Two Sorted Lists (EASY)
  await upsertProblem({
    title: "Merge Two Sorted Lists",
    slug: "merge-two-sorted-lists",
    difficulty: Difficulty.EASY,
    tags: ["Linked List", "Recursion"],
    description: `
## Problem

You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.
    `.trim(),
    examples: [
      {
        input: "list1 = [1,2,4], list2 = [1,3,4]",
        output: "[1,1,2,3,4,4]",
      },
      {
        input: "list1 = [], list2 = []",
        output: "[]",
      },
    ],
    constraints: `
- The number of nodes in both lists is in the range [0, 50].
- -100 <= Node.val <= 100
- Both list1 and list2 are sorted in non-decreasing order.
    `.trim(),
    testCases: [
      {
        input: "[1,2,4]\n[1,3,4]",
        expectedOutput: "[1,1,2,3,4,4]",
        isSample: true,
        orderIndex: 1,
      },
      {
        input: "[]\n[]",
        expectedOutput: "[]",
        isSample: true,
        orderIndex: 2,
      },
      {
        input: "[]\n[0]",
        expectedOutput: "[0]",
        isSample: false,
        orderIndex: 3,
      },
    ],
  });

  // 5. Best Time to Buy and Sell Stock (EASY)
  await upsertProblem({
    title: "Best Time to Buy and Sell Stock",
    slug: "best-time-to-buy-and-sell-stock",
    difficulty: Difficulty.EASY,
    tags: ["Array", "Dynamic Programming"],
    description: `
## Problem

You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.
    `.trim(),
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."
      },
      {
        input: "prices = [7,6,4,3,1]",
        output: "0",
        explanation: "In this case, no transactions are done and the max profit = 0."
      }
    ],
    constraints: `
- 1 <= prices.length <= 10^5
- 0 <= prices[i] <= 10^4
    `.trim(),
    testCases: [
      {
        input: "[7,1,5,3,6,4]",
        expectedOutput: "5",
        isSample: true,
        orderIndex: 1,
      },
      {
        input: "[7,6,4,3,1]",
        expectedOutput: "0",
        isSample: true,
        orderIndex: 2,
      },
    ],
  });

  // 6. Binary Search (EASY)
  await upsertProblem({
    title: "Binary Search",
    slug: "binary-search",
    difficulty: Difficulty.EASY,
    tags: ["Array", "Binary Search"],
    description: `
## Problem

Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.
    `.trim(),
    examples: [
      {
        input: "nums = [-1,0,3,5,9,12], target = 9",
        output: "4",
        explanation: "9 exists in nums and its index is 4"
      },
      {
        input: "nums = [-1,0,3,5,9,12], target = 2",
        output: "-1",
        explanation: "2 does not exist in nums so return -1"
      }
    ],
    constraints: `
- 1 <= nums.length <= 10^4
- -10^4 < nums[i], target < 10^4
- All the integers in nums are unique.
- nums is sorted in ascending order.
    `.trim(),
    testCases: [
      {
        input: "[-1,0,3,5,9,12]\n9",
        expectedOutput: "4",
        isSample: true,
        orderIndex: 1,
      },
      {
        input: "[-1,0,3,5,9,12]\n2",
        expectedOutput: "-1",
        isSample: true,
        orderIndex: 2,
      },
    ],
  });

  // 7. Maximum Subarray (MEDIUM)
  await upsertProblem({
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    difficulty: Difficulty.MEDIUM,
    tags: ["Array", "Dynamic Programming"],
    description: `
## Problem

Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.
    `.trim(),
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum = 6."
      },
      {
        input: "nums = [1]",
        output: "1",
      }
    ],
    constraints: `
- 1 <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4
    `.trim(),
    testCases: [
      {
        input: "[-2,1,-3,4,-1,2,1,-5,4]",
        expectedOutput: "6",
        isSample: true,
        orderIndex: 1,
      },
      {
        input: "[1]",
        expectedOutput: "1",
        isSample: true,
        orderIndex: 2,
      },
      {
        input: "[5,4,-1,7,8]",
        expectedOutput: "23",
        isSample: false,
        orderIndex: 3,
      },
    ],
  });

  // 8. Product of Array Except Self (MEDIUM)
  await upsertProblem({
    title: "Product of Array Except Self",
    slug: "product-of-array-except-self",
    difficulty: Difficulty.MEDIUM,
    tags: ["Array"],
    description: `
## Problem

Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`.

The product of any prefix or suffix of \`nums\` is guaranteed to fit in a 32-bit integer.

You must write an algorithm that runs in \`O(n)\` time and without using the division operation.
    `.trim(),
    examples: [
      {
        input: "nums = [1,2,3,4]",
        output: "[24,12,8,6]",
      },
      {
        input: "nums = [-1,1,0,-3,3]",
        output: "[0,0,9,0,0]",
      }
    ],
    constraints: `
- 2 <= nums.length <= 10^5
- -30 <= nums[i] <= 30
- The input is generated such that the product of any prefix or suffix of nums fits in a 32-bit integer.
    `.trim(),
    testCases: [
      {
        input: "[1,2,3,4]",
        expectedOutput: "[24,12,8,6]",
        isSample: true,
        orderIndex: 1,
      },
      {
        input: "[-1,1,0,-3,3]",
        expectedOutput: "[0,0,9,0,0]",
        isSample: true,
        orderIndex: 2,
      },
    ],
  });

  // 9. Longest Substring Without Repeating Characters (MEDIUM)
  await upsertProblem({
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: Difficulty.MEDIUM,
    tags: ["String", "Hash Table"],
    description: `
## Problem

Given a string \`s\`, find the length of the longest substring without repeating characters.
    `.trim(),
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: "1",
        explanation: 'The answer is "b", with the length of 1.'
      }
    ],
    constraints: `
- 0 <= s.length <= 5 * 10^4
- s consists of English letters, digits, symbols and spaces.
    `.trim(),
    testCases: [
      {
        input: "abcabcbb",
        expectedOutput: "3",
        isSample: true,
        orderIndex: 1,
      },
      {
        input: "bbbbb",
        expectedOutput: "1",
        isSample: true,
        orderIndex: 2,
      },
      {
        input: "pwwkew",
        expectedOutput: "3",
        isSample: false,
        orderIndex: 3,
      },
    ],
  });

  // 10. 3Sum (MEDIUM)
  await upsertProblem({
    title: "3Sum",
    slug: "3sum",
    difficulty: Difficulty.MEDIUM,
    tags: ["Array", "Two Pointers"],
    description: `
## Problem

Given an integer array nums, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.
    `.trim(),
    examples: [
      {
        input: "nums = [-1,0,1,2,-1,-4]",
        output: "[[-1,-1,2],[-1,0,1]]",
      },
      {
        input: "nums = [0,1,1]",
        output: "[]",
      }
    ],
    constraints: `
- 3 <= nums.length <= 3000
- -10^5 <= nums[i] <= 10^5
    `.trim(),
    testCases: [
      {
        input: "[-1,0,1,2,-1,-4]",
        expectedOutput: "[[-1,-1,2],[-1,0,1]]",
        isSample: true,
        orderIndex: 1,
      },
      {
        input: "[0,1,1]",
        expectedOutput: "[]",
        isSample: true,
        orderIndex: 2,
      },
      {
        input: "[0,0,0]",
        expectedOutput: "[[0,0,0]]",
        isSample: false,
        orderIndex: 3,
      },
    ],
  });

  // 11. Coin Change (MEDIUM)
  await upsertProblem({
    title: "Coin Change",
    slug: "coin-change",
    difficulty: Difficulty.MEDIUM,
    tags: ["Array", "Dynamic Programming"],
    description: `
## Problem

You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.
    `.trim(),
    examples: [
      {
        input: "coins = [1,2,5], amount = 11",
        output: "3",
        explanation: "11 = 5 + 5 + 1"
      },
      {
        input: "coins = [2], amount = 3",
        output: "-1",
      }
    ],
    constraints: `
- 1 <= coins.length <= 12
- 1 <= coins[i] <= 2^31 - 1
- 0 <= amount <= 10^4
    `.trim(),
    testCases: [
      {
        input: "[1,2,5]\n11",
        expectedOutput: "3",
        isSample: true,
        orderIndex: 1,
      },
      {
        input: "[2]\n3",
        expectedOutput: "-1",
        isSample: true,
        orderIndex: 2,
      },
      {
        input: "[1]\n0",
        expectedOutput: "0",
        isSample: false,
        orderIndex: 3,
      },
    ],
  });

  // 12. Binary Tree Level Order Traversal (MEDIUM)
  await upsertProblem({
    title: "Binary Tree Level Order Traversal",
    slug: "binary-tree-level-order-traversal",
    difficulty: Difficulty.MEDIUM,
    tags: ["Tree"],
    description: `
## Problem

Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).
    `.trim(),
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "[[3],[9,20],[15,7]]",
      },
      {
        input: "root = [1]",
        output: "[[1]]",
      }
    ],
    constraints: `
- The number of nodes in the tree is in the range [0, 2000].
- -1000 <= Node.val <= 1000
    `.trim(),
    testCases: [
      {
        input: "[3,9,20,null,null,15,7]",
        expectedOutput: "[[3],[9,20],[15,7]]",
        isSample: true,
        orderIndex: 1,
      },
      {
        input: "[1]",
        expectedOutput: "[[1]]",
        isSample: true,
        orderIndex: 2,
      },
    ],
  });

  // 13. Median of Two Sorted Arrays (HARD)
  await upsertProblem({
    title: "Median of Two Sorted Arrays",
    slug: "median-of-two-sorted-arrays",
    difficulty: Difficulty.HARD,
    tags: ["Array", "Binary Search"],
    description: `
## Problem

Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the median of the two sorted arrays.

The overall run time complexity should be \`O(log (m+n))\`.
    `.trim(),
    examples: [
      {
        input: "nums1 = [1,3], nums2 = [2]",
        output: "2.00000",
        explanation: "merged array = [1,2,3] and median is 2."
      },
      {
        input: "nums1 = [1,2], nums2 = [3,4]",
        output: "2.50000",
        explanation: "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5."
      }
    ],
    constraints: `
- nums1.length == m
- nums2.length == n
- 0 <= m <= 1000
- 0 <= n <= 1000
- 1 <= m + n <= 2000
- -10^6 <= nums1[i], nums2[i] <= 10^6
    `.trim(),
    testCases: [
      {
        input: "[1,3]\n[2]",
        expectedOutput: "2.0",
        isSample: true,
        orderIndex: 1,
      },
      {
        input: "[1,2]\n[3,4]",
        expectedOutput: "2.5",
        isSample: true,
        orderIndex: 2,
      },
    ],
  });

  // 14. Merge k Sorted Lists (HARD)
  await upsertProblem({
    title: "Merge k Sorted Lists",
    slug: "merge-k-sorted-lists",
    difficulty: Difficulty.HARD,
    tags: ["Linked List", "Divide and Conquer"],
    description: `
## Problem

You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.
    `.trim(),
    examples: [
      {
        input: "lists = [[1,4,5],[1,3,4],[2,6]]",
        output: "[1,1,2,3,4,4,5,6]",
        explanation: "merging them into one sorted list:\n1->1->2->3->4->4->5->6"
      }
    ],
    constraints: `
- k == lists.length
- 0 <= k <= 10^4
- 0 <= lists[i].length <= 500
- -10^4 <= lists[i][j] <= 10^4
- lists[i] is sorted in non-decreasing order.
- The sum of lists[i].length will not exceed 10^4.
    `.trim(),
    testCases: [
      {
        input: "[[1,4,5],[1,3,4],[2,6]]",
        expectedOutput: "[1,1,2,3,4,4,5,6]",
        isSample: true,
        orderIndex: 1,
      },
      {
        input: "[]",
        expectedOutput: "[]",
        isSample: true,
        orderIndex: 2,
      },
    ],
  });

  // 15. Edit Distance (HARD)
  await upsertProblem({
    title: "Edit Distance",
    slug: "edit-distance",
    difficulty: Difficulty.HARD,
    tags: ["String", "Dynamic Programming"],
    description: `
## Problem

Given two strings \`word1\` and \`word2\`, return the minimum number of operations required to convert \`word1\` to \`word2\`.

You have the following three operations permitted on a word:
- Insert a character
- Delete a character
- Replace a character
    `.trim(),
    examples: [
      {
        input: 'word1 = "horse", word2 = "ros"',
        output: "3",
        explanation: "horse -> rorse (replace 'h' with 'r')\nrorse -> rose (remove 'r')\nrose -> ros (remove 'e')"
      },
      {
        input: 'word1 = "intention", word2 = "execution"',
        output: "5",
      }
    ],
    constraints: `
- 0 <= word1.length, word2.length <= 500
- word1 and word2 consist of lowercase English letters.
    `.trim(),
    testCases: [
      {
        input: "horse\nros",
        expectedOutput: "3",
        isSample: true,
        orderIndex: 1,
      },
      {
        input: "intention\nexecution",
        expectedOutput: "5",
        isSample: true,
        orderIndex: 2,
      },
    ],
  });

  console.log("Seeding finished.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });