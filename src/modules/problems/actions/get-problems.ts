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

export async function getProblems(): Promise<ProblemRow[]> {
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
}
