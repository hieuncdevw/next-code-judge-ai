'use client'

import Link from 'next/link'
import { Circle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import type { ProblemRow } from '@/modules/problems/actions/get-problems'

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Easy':
      return 'bg-easy/10 text-easy'
    case 'Medium':
      return 'bg-medium/10 text-medium'
    case 'Hard':
      return 'bg-hard/10 text-hard'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

interface ProblemsTableProps {
  problems: ProblemRow[]
  currentPage: number
  itemsPerPage: number
  searchQuery: string
  selectedDifficulty: string
  selectedTopic: string
}

export function ProblemsTable({
  problems,
  currentPage,
  itemsPerPage,
  searchQuery,
  selectedDifficulty,
  selectedTopic,
}: ProblemsTableProps) {
  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesDifficulty =
      !selectedDifficulty || problem.difficulty === selectedDifficulty
    // tags array — filter by topic if selected
    const matchesTopic =
      !selectedTopic || problem.tags.includes(selectedTopic)

    return matchesSearch && matchesDifficulty && matchesTopic
  })

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProblems = filteredProblems.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  return (
    <Card className="border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border">
            <TableHead className="w-12 text-muted-foreground">#</TableHead>
            <TableHead className="text-muted-foreground">Title</TableHead>
            <TableHead className="w-32 text-muted-foreground">Difficulty</TableHead>
            <TableHead className="hidden w-48 text-muted-foreground sm:table-cell">Tags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedProblems.map((problem, index) => (
            <TableRow
              key={problem.id}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <TableCell className="text-muted-foreground">
                <div className="flex items-center justify-center">
                  <Circle className="h-5 w-5 text-muted-foreground" />
                </div>
              </TableCell>
              <TableCell className="font-medium text-foreground">
                <Link
                  href={`/problems/${problem.slug}`}
                  className="hover:text-primary transition-colors hover:underline underline-offset-4"
                >
                  {problem.title}
                </Link>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getDifficultyColor(
                    problem.difficulty
                  )}`}
                >
                  {problem.difficulty}
                </span>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="flex flex-wrap gap-1">
                  {problem.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded px-2 py-0.5 text-xs bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {problem.tags.length > 3 && (
                    <span className="inline-block rounded px-2 py-0.5 text-xs bg-muted text-muted-foreground">
                      +{problem.tags.length - 3}
                    </span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {paginatedProblems.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No problems found</p>
        </div>
      )}
    </Card>
  )
}
