'use client'

import { useState, useMemo } from 'react'

import { FilterBar } from '@/modules/problems/components/filter-bar'
import { ProblemsTable } from '@/modules/problems/components/problems-table'
import { Pagination } from '@/modules/problems/components/problems-pagination'
import { ProgressCard } from '@/modules/problems/components/progress-card'
import { RecommendedProblems } from '@/modules/problems/components/recommended-problems'
import type { ProblemRow } from '@/modules/problems/actions/get-problems'

interface ProblemsPageClientProps {
  problems: ProblemRow[]
}

const ITEMS_PER_PAGE = 10

export function ProblemsPageClient({ problems }: ProblemsPageClientProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Reset to page 1 whenever filters change
  function handleSearchChange(value: string) {
    setSearchQuery(value)
    setCurrentPage(1)
  }
  function handleDifficultyChange(value: string) {
    setSelectedDifficulty(value)
    setCurrentPage(1)
  }
  function handleTopicChange(value: string) {
    setSelectedTopic(value)
    setCurrentPage(1)
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

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="flex-1 space-y-6">
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={handleDifficultyChange}
          selectedTopic={selectedTopic}
          onTopicChange={handleTopicChange}
        />

        <ProblemsTable
          problems={problems}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          searchQuery={searchQuery}
          selectedDifficulty={selectedDifficulty}
          selectedTopic={selectedTopic}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <aside className="lg:w-1/4">
        <div className="sticky top-8 space-y-6">
          <ProgressCard />
          <RecommendedProblems />
        </div>
      </aside>
    </div>
  )
}
