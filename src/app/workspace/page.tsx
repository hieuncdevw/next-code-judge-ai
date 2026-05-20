import { NavHeader } from '@/components/layout/nav-header'
import { CodeWorkspace } from '@/modules/workspace/components/code-workspace'
import { getProblemBySlug } from '@/modules/problems/actions/get-problem-by-slug'

export const metadata = {
  title: 'Code Workspace - Next Code Judge',
  description: 'Interactive code editor and problem solver',
}

interface WorkspacePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const { problem: slug } = await searchParams

  // slug may be a string[] if duplicated in query — always take first value
  const resolvedSlug = Array.isArray(slug) ? slug[0] : slug

  const problem = resolvedSlug
    ? await getProblemBySlug(resolvedSlug)
    : null

  return (
    <div className="flex flex-col h-screen">
      <NavHeader />
      <div className="flex-1 min-h-0 overflow-hidden">
        <CodeWorkspace problem={problem} />
      </div>
    </div>
  )
}