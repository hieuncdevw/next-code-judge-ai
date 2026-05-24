import { NavHeader } from '@/components/layout/nav-header'
import { ProblemsPageClient } from '@/modules/problems/components/problems-page-client'
import { getProblems } from '@/modules/problems/actions/get-problems'

export const metadata = {
  title: 'Problems - Next Code Judge',
  description: 'Browse and solve coding challenges',
}

import { Suspense } from 'react'

export default async function ProblemsPage() {
  const problems = await getProblems()

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <ProblemsPageClient problems={problems} />
        </Suspense>
      </main>
    </div>
  )
}