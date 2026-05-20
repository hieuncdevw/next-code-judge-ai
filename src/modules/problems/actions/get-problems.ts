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
    console.warn('[getProblems] Database offline, returning mock problems:', err)
    return MOCK_PROBLEM_ROWS
  }
}
