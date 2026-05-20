'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { FilterBar } from '@/components/filter-bar'
import { ProblemsTable } from '@/components/problems-table'
import { Pagination } from '@/components/problems-pagination'
import { ProgressCard } from '@/components/progress-card'
import { RecommendedProblems } from '@/components/recommended-problems'

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const itemsPerPage = 10

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left column - 75% */}
          <div className="flex-1 space-y-6">
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedDifficulty={selectedDifficulty}
              onDifficultyChange={setSelectedDifficulty}
              selectedTopic={selectedTopic}
              onTopicChange={setSelectedTopic}
            />
            
            <ProblemsTable
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              searchQuery={searchQuery}
              selectedDifficulty={selectedDifficulty}
              selectedTopic={selectedTopic}
            />
            
            <Pagination
              currentPage={currentPage}
              totalPages={5}
              onPageChange={setCurrentPage}
            />
          </div>

          {/* Right column - 25% */}
          <aside className="lg:w-1/4">
            <div className="sticky top-8 space-y-6">
              <ProgressCard />
              <RecommendedProblems />
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
