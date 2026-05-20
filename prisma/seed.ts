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

async function main() {
  console.log("Start seeding...");

  await prisma.testCaseResult.deleteMany();
  await prisma.testCase.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.problemProgress.deleteMany();
  await prisma.aIChatMessage.deleteMany();
  await prisma.aIChatSession.deleteMany();
  await prisma.problem.deleteMany();

  const twoSum = await prisma.problem.create({
    data: {
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
      isPublished: true,
      testCases: {
        create: [
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
      },
    },
  });

  const validParentheses = await prisma.problem.create({
    data: {
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
      isPublished: true,
      testCases: {
        create: [
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
      },
    },
  });

  const palindromeNumber = await prisma.problem.create({
    data: {
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
      isPublished: true,
      testCases: {
        create: [
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
      },
    },
  });

  console.log("Seeded problems:", {
    twoSum: twoSum.id,
    validParentheses: validParentheses.id,
    palindromeNumber: palindromeNumber.id,
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