'use client'

import { useState, useMemo, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { FilterBar } from '@/modules/problems/components/filter-bar'
import { ProblemsTable } from '@/modules/problems/components/problems-table'
import { Pagination } from '@/modules/problems/components/problems-pagination'
import { ProgressCard } from '@/modules/problems/components/progress-card'
import { RecommendedProblems } from '@/modules/problems/components/recommended-problems'
import type { ProblemRow } from '@/modules/problems/actions/get-problems'
import type { UserProgress } from '@/modules/problems/actions/get-user-progress'

interface ProblemsPageClientProps {
  problems: ProblemRow[]
  userProgress: UserProgress
}

const ITEMS_PER_PAGE = 10

export function ProblemsPageClient({ problems, userProgress }: ProblemsPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Derive state directly from URL search params (Single Source of Truth)
  const searchQuery = searchParams.get('search') || ''
  const selectedDifficulty = searchParams.get('difficulty') || ''
  const selectedTopic = searchParams.get('topic') || ''

  // Local state for the search input to prevent keystroke lag
  const [localSearch, setLocalSearch] = useState(searchQuery)

  // Keep local search input in sync if URL changes (e.g. browser back/forward or resets)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalSearch(searchQuery)
  }, [searchQuery])

  // Helper to update query parameters in URL
  const updateFilters = (updates: {
    search?: string
    difficulty?: string
    topic?: string
    page?: number
  }) => {
    const params = new URLSearchParams(searchParams.toString())

    if (updates.search !== undefined) {
      if (updates.search) {
        params.set('search', updates.search)
      } else {
        params.delete('search')
      }
      params.set('page', '1') // reset page to 1
    }

    if (updates.difficulty !== undefined) {
      if (updates.difficulty) {
        params.set('difficulty', updates.difficulty)
      } else {
        params.delete('difficulty')
      }
      params.set('page', '1') // reset page to 1
    }

    if (updates.topic !== undefined) {
      if (updates.topic) {
        params.set('topic', updates.topic)
      } else {
        params.delete('topic')
      }
      params.set('page', '1') // reset page to 1
    }

    if (updates.page !== undefined) {
      if (updates.page > 1) {
        params.set('page', String(updates.page))
      } else {
        params.delete('page')
      }
    }

    const newParamsStr = params.toString()
    const newUrl = newParamsStr ? `${pathname}?${newParamsStr}` : pathname

    startTransition(() => {
      router.replace(newUrl, { scroll: false })
    })
  }

  // Debounce the local search text change and sync to URL search param
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        updateFilters({ search: localSearch })
      }
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch, searchQuery])

  const handleDifficultyChange = (val: string) => {
    updateFilters({ difficulty: val })
  }

  const handleTopicChange = (val: string) => {
    updateFilters({ topic: val })
  }

  // Compute totalPages based on filtered count so Pagination is always accurate
  const filteredCount = useMemo(() => {
    return problems.filter((p) => {
      const matchesSearch = p.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesDifficulty =
        !selectedDifficulty || p.difficulty === selectedDifficulty
      const matchesTopic =
        !selectedTopic || p.tags.includes(selectedTopic)
      return matchesSearch && matchesDifficulty && matchesTopic
    }).length
  }, [problems, searchQuery, selectedDifficulty, selectedTopic])

  const totalPages = Math.max(1, Math.ceil(filteredCount / ITEMS_PER_PAGE))

  // Parse, normalize and clamp current page
  const rawPage = searchParams.get('page')
  let parsedPage = Number(rawPage)
  if (!rawPage || isNaN(parsedPage) || parsedPage <= 0 || !Number.isInteger(parsedPage)) {
    parsedPage = 1
  }
  const currentPage = Math.min(parsedPage, totalPages)

  // Synchronize URL if page parameter in URL is invalid or out of bounds
  useEffect(() => {
    const rawPageVal = searchParams.get('page')
    if (rawPageVal === null) return // No page parameter, default is already page 1

    const pageVal = Number(rawPageVal)
    const isInvalid = isNaN(pageVal) || pageVal <= 0 || !Number.isInteger(pageVal)
    const isOutOfBounds = pageVal > totalPages

    if (isInvalid || isOutOfBounds) {
      const targetPage = isOutOfBounds ? totalPages : 1
      const params = new URLSearchParams(searchParams.toString())
      if (targetPage > 1) {
        params.set('page', String(targetPage))
      } else {
        params.delete('page')
      }
      const newParamsStr = params.toString()
      const newUrl = newParamsStr ? `${pathname}?${newParamsStr}` : pathname
      router.replace(newUrl, { scroll: false })
    }
  }, [searchParams, totalPages, pathname, router])

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="flex-1 space-y-6">
        <FilterBar
          searchQuery={localSearch}
          onSearchChange={setLocalSearch}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={handleDifficultyChange}
          selectedTopic={selectedTopic}
          onTopicChange={handleTopicChange}
        />

        {/* Visible Result Count */}
        <div className="text-sm text-muted-foreground font-medium px-1">
          Tìm thấy {filteredCount} bài tập
        </div>

        {/* Lightweight loading indicator wrapper */}
        <div className="relative">
          {isPending && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40 backdrop-blur-[1px] rounded-lg transition-all duration-200">
              <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 border border-border shadow-md">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium text-foreground">Updating...</span>
              </div>
            </div>
          )}

          <ProblemsTable
            problems={problems}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            searchQuery={searchQuery}
            selectedDifficulty={selectedDifficulty}
            selectedTopic={selectedTopic}
          />
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => updateFilters({ page })}
        />
      </div>

      <aside className="lg:w-1/4">
        <div className="sticky top-8 space-y-6">
          <ProgressCard userProgress={userProgress} />
          <RecommendedProblems />
        </div>
      </aside>
    </div>
  )
}
