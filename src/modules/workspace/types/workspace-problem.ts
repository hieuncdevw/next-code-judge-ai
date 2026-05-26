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

export type WorkspaceSubmissionStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'COMPILE_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'UNAUTHORIZED'
  | 'DISPLAY_ONLY'

export type WorkspaceSubmission = {
  id?: string
  status: WorkspaceSubmissionStatus
  statusLabel: string
  language: string
  runtime?: number
  memory?: number
  errorMessage?: string
  passedTests: number
  totalTests: number
  submittedAt: string
}
