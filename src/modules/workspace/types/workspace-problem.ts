/**
 * Subset of ProblemDetail that is serialisable across the Server→Client boundary.
 * Only primitive / plain-object fields — no Date, no functions.
 */
export type WorkspaceProblem = {
  id: string
  title: string
  slug: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  tags: string[]
  constraints: string | null
  timeLimitMs: number
  memoryLimitKb: number
  testCases: {
    id: string
    input: string
    expectedOutput: string
    isSample: boolean
    orderIndex: number
  }[]
}
