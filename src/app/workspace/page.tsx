import { NavHeader } from '@/components/layout/nav-header'
import { CodeWorkspace } from '@/modules/workspace/components/code-workspace'
import { getProblemBySlug } from '@/modules/problems/actions/get-problem-by-slug'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const metadata = {
  title: 'Code Workspace - Next Code Judge',
  description: 'Interactive code editor and problem solver',
}

interface WorkspacePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const { problem: slug } = await searchParams

  const resolvedSlug = Array.isArray(slug) ? slug[0] : slug

  const problem = resolvedSlug
    ? await getProblemBySlug(resolvedSlug)
    : null

  // Fetch past submissions from database for this problem and user
  let initialSubmissions: any[] = []
  if (problem) {
    try {
      const user = await getCurrentUser()
      const dbSubmissions = await prisma.submission.findMany({
        where: {
          userId: user.id,
          problemId: problem.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          results: true,
        },
        take: 50, // limit to last 50 submissions
      })

      initialSubmissions = dbSubmissions.map((sub) => {
        const passed = sub.results.filter((r) => r.status === 'ACCEPTED').length
        const total = sub.results.length

        const label = sub.status
          .toLowerCase()
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')

        return {
          status: sub.status,
          statusLabel: label,
          runtime: sub.runtimeMs ?? undefined,
          memory: sub.memoryKb ?? undefined,
          errorMessage: sub.errorMessage ?? undefined,
          passedTests: passed,
          totalTests: total > 0 ? total : 2, // fallback
          submittedAt: sub.createdAt.toISOString(),
        }
      })
    } catch (err) {
      console.error('[WorkspacePage] failed to fetch initial submissions:', err)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <NavHeader />
      <div className="flex-1 min-h-0 overflow-hidden">
        <CodeWorkspace problem={problem} initialSubmissions={initialSubmissions} />
      </div>
    </div>
  )
}