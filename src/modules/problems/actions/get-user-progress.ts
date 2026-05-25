import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Difficulty } from "@/generated/prisma/enums";

export type UserProgress = {
  isAuthenticated: boolean;
  solvedCount: number;
  totalCount: number;
  solvedByDifficulty: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
};

export async function getUserProgress(): Promise<UserProgress> {
  const defaultProgress: UserProgress = {
    isAuthenticated: false,
    solvedCount: 0,
    totalCount: 15, // Fallback total problems count
    solvedByDifficulty: {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    },
  };

  try {
    const user = await getCurrentUser();
    if (!user) {
      // Guest user (not authenticated)
      try {
        const totalCount = await prisma.problem.count({
          where: { isPublished: true },
        });
        return {
          ...defaultProgress,
          totalCount,
        };
      } catch {
        return defaultProgress;
      }
    }

    // Authenticated user
    try {
      const totalCount = await prisma.problem.count({
        where: { isPublished: true },
      });

      const solvedProgress = await prisma.problemProgress.findMany({
        where: {
          userId: user.id,
          isSolved: true,
          problem: {
            isPublished: true,
          },
        },
        include: {
          problem: {
            select: {
              difficulty: true,
            },
          },
        },
      });

      const solvedByDifficulty = {
        Easy: 0,
        Medium: 0,
        Hard: 0,
      };

      const solvedByProblemId = new Map<string, (typeof solvedProgress)[number]>();
      solvedProgress.forEach((p) => {
        solvedByProblemId.set(p.problemId, p);
      });

      solvedByProblemId.forEach((p) => {
        if (p.problem.difficulty === Difficulty.EASY) {
          solvedByDifficulty.Easy++;
        } else if (p.problem.difficulty === Difficulty.MEDIUM) {
          solvedByDifficulty.Medium++;
        } else if (p.problem.difficulty === Difficulty.HARD) {
          solvedByDifficulty.Hard++;
        }
      });

      return {
        isAuthenticated: true,
        solvedCount: solvedByProblemId.size,
        totalCount,
        solvedByDifficulty,
      };
    } catch (err) {
      console.warn("[getUserProgress] Database offline, returning default progress for authenticated user:", err);
      return {
        ...defaultProgress,
        isAuthenticated: true,
      };
    }
  } catch (err) {
    console.warn("[getUserProgress] Error getting user progress:", err);
    return defaultProgress;
  }
}
