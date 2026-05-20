import { NavHeader } from '@/components/layout/nav-header'
import { ProblemsPageClient } from '@/modules/problems/components/problems-page-client'
import { getProblems } from '@/modules/problems/actions/get-problems'

export const metadata = {
  title: 'Problems - Next Code Judge',
  description: 'Browse and solve coding challenges',
}

export default async function ProblemsPage() {
  const problems = await getProblems()

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProblemsPageClient problems={problems} />
      </main>
    </div>
  )
}