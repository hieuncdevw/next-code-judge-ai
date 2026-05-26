import { NavHeader } from '@/components/layout/nav-header'
import { CodeWorkspace } from '@/modules/workspace/components/code-workspace'
import { getProblemBySlug } from '@/modules/problems/actions/get-problem-by-slug'
import { getCurrentUserSubmissionsForProblem } from '@/modules/workspace/actions/get-submissions'
import type { WorkspaceSubmission } from '@/modules/workspace/types/workspace-problem'

export const metadata = {
  title: 'Code Workspace - Next Code Judge',
  description: 'Interactive code editor and problem solver',
}

export const dynamic = 'force-dynamic'

interface WorkspacePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const { problem: slug } = await searchParams

  const resolvedSlug = Array.isArray(slug) ? slug[0] : slug

  const problem = resolvedSlug
    ? await getProblemBySlug(resolvedSlug)
    : null

  let initialSubmissions: WorkspaceSubmission[] = []
  let isAuthenticated = false

  if (problem) {
    const submissionState = await getCurrentUserSubmissionsForProblem(problem.id)
    initialSubmissions = submissionState.submissions
    isAuthenticated = submissionState.isAuthenticated
  }

  return (
    <div className="flex flex-col h-screen">
      <NavHeader />
      <div className="flex-1 min-h-0 overflow-hidden">
        <CodeWorkspace
          problem={problem}
          initialSubmissions={initialSubmissions}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  )
}
