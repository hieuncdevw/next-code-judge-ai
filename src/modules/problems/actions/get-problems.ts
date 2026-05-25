import { prisma } from "@/lib/prisma";
import { Difficulty } from "@/generated/prisma/enums";

// Map DB enum (EASY/MEDIUM/HARD) sang display label cho UI
const DIFFICULTY_LABEL: Record<Difficulty, "Easy" | "Medium" | "Hard"> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

export type ProblemRow = {
  id: string;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  createdAt: Date;
};

const MOCK_PROBLEM_ROWS: ProblemRow[] = [
  {
    id: 'two-sum-id',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    createdAt: new Date('2026-05-20'),
  },
  {
    id: 'valid-parentheses-id',
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    createdAt: new Date('2026-05-20'),
  },
  {
    id: 'palindrome-number-id',
    title: 'Palindrome Number',
    slug: 'palindrome-number',
    difficulty: 'Easy',
    tags: ['Math'],
    createdAt: new Date('2026-05-20'),
  },
  {
    id: 'merge-two-sorted-lists-id',
    title: 'Merge Two Sorted Lists',
    slug: 'merge-two-sorted-lists',
    difficulty: 'Easy',
    tags: ['Linked List', 'Recursion'],
    createdAt: new Date('2026-05-20'),
  },
  {
    id: 'best-time-to-buy-and-sell-stock-id',
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    difficulty: 'Easy',
    tags: ['Array', 'Dynamic Programming'],
    createdAt: new Date('2026-05-20'),
  },
  {
    id: 'binary-search-id',
    title: 'Binary Search',
    slug: 'binary-search',
    difficulty: 'Easy',
    tags: ['Array', 'Binary Search'],
    createdAt: new Date('2026-05-20'),
  },
  {
    id: 'maximum-subarray-id',
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    createdAt: new Date('2026-05-20'),
  },
  {
    id: 'product-of-array-except-self-id',
    title: 'Product of Array Except Self',
    slug: 'product-of-array-except-self',
    difficulty: 'Medium',
    tags: ['Array'],
    createdAt: new Date('2026-05-20'),
  },
  {
    id: 'longest-substring-without-repeating-characters-id',
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    tags: ['String', 'Hash Table'],
    createdAt: new Date('2026-05-20'),
  },
  {
    id: '3sum-id',
    title: '3Sum',
    slug: '3sum',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers'],
    createdAt: new Date('2026-05-20'),
  },
  {
    id: 'coin-change-id',
    title: 'Coin Change',
    slug: 'coin-change',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    createdAt: new Date('2026-05-20'),
  },
  {
    id: 'binary-tree-level-order-traversal-id',
    title: 'Binary Tree Level Order Traversal',
    slug: 'binary-tree-level-order-traversal',
    difficulty: 'Medium',
    tags: ['Tree'],
    createdAt: new Date('2026-05-20'),
  },
  {
    id: 'median-of-two-sorted-arrays-id',
    title: 'Median of Two Sorted Arrays',
    slug: 'median-of-two-sorted-arrays',
    difficulty: 'Hard',
    tags: ['Array', 'Binary Search'],
    createdAt: new Date('2026-05-20'),
  },
  {
    id: 'merge-k-sorted-lists-id',
    title: 'Merge k Sorted Lists',
    slug: 'merge-k-sorted-lists',
    difficulty: 'Hard',
    tags: ['Linked List', 'Divide and Conquer'],
    createdAt: new Date('2026-05-20'),
  },
  {
    id: 'edit-distance-id',
    title: 'Edit Distance',
    slug: 'edit-distance',
    difficulty: 'Hard',
    tags: ['String', 'Dynamic Programming'],
    createdAt: new Date('2026-05-20'),
  },
]

export async function getProblems(): Promise<ProblemRow[]> {
  try {
    const problems = await prisma.problem.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        tags: true,
        createdAt: true,
      },
    });

    return problems.map((p) => ({
      ...p,
      difficulty: DIFFICULTY_LABEL[p.difficulty],
    }));
  } catch (err) {
    const isDev = process.env.NODE_ENV === "development";
    if (isDev) {
      console.warn('[getProblems] Database offline, returning mock problems:', err)
      return MOCK_PROBLEM_ROWS
    }

    console.error('[getProblems] Database error in production:', err)
    return []
  }
}
