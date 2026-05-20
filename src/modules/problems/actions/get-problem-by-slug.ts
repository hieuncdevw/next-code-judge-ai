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

export async function getProblemBySlug(
  slug: string
): Promise<ProblemDetail | null> {
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

  if (!problem) return null

  return {
    ...problem,
    difficulty: DIFFICULTY_LABEL[problem.difficulty],
  }
}
