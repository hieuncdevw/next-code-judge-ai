'use client'

import { CheckCircle, Circle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'

interface Problem {
  id: number
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  topic: string
  acceptance: number
  solved: boolean
}

// Mock data
const allProblems: Problem[] = [
  { id: 1, title: 'Two Sum', difficulty: 'Easy', topic: 'Array', acceptance: 48.2, solved: true },
  { id: 2, title: 'Add Two Numbers', difficulty: 'Medium', topic: 'Linked List', acceptance: 34.2, solved: false },
  { id: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'String', acceptance: 34.1, solved: false },
  { id: 4, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', topic: 'Array', acceptance: 29.1, solved: false },
  { id: 5, title: 'Longest Palindromic Substring', difficulty: 'Medium', topic: 'String', acceptance: 32.3, solved: true },
  { id: 6, title: 'ZigZag Conversion', difficulty: 'Medium', topic: 'String', acceptance: 36.3, solved: false },
  { id: 7, title: 'Reverse Integer', difficulty: 'Easy', topic: 'Math', acceptance: 26.1, solved: true },
  { id: 8, title: 'String to Integer (atoi)', difficulty: 'Medium', topic: 'String', acceptance: 15.3, solved: false },
  { id: 9, title: 'Palindrome Number', difficulty: 'Easy', topic: 'Math', acceptance: 51.3, solved: true },
  { id: 10, title: 'Regular Expression Matching', difficulty: 'Hard', topic: 'String', acceptance: 27.8, solved: false },
  { id: 11, title: 'Container With Most Water', difficulty: 'Medium', topic: 'Array', acceptance: 52.1, solved: false },
  { id: 12, title: 'Integer to Roman', difficulty: 'Medium', topic: 'String', acceptance: 58.9, solved: true },
  { id: 13, title: 'Roman to Integer', difficulty: 'Easy', topic: 'String', acceptance: 57.9, solved: true },
  { id: 14, title: 'Longest Common Prefix', difficulty: 'Easy', topic: 'String', acceptance: 36.2, solved: false },
  { id: 15, title: '3Sum', difficulty: 'Medium', topic: 'Array', acceptance: 32.6, solved: true },
]

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
  currentPage: number
  itemsPerPage: number
  searchQuery: string
  selectedDifficulty: string
  selectedTopic: string
}

export function ProblemsTable({
  currentPage,
  itemsPerPage,
  searchQuery,
  selectedDifficulty,
  selectedTopic,
}: ProblemsTableProps) {
  const filteredProblems = allProblems.filter((problem) => {
    const matchesSearch = problem.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesDifficulty =
      !selectedDifficulty || problem.difficulty === selectedDifficulty
    const matchesTopic = !selectedTopic || problem.topic === selectedTopic

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
            <TableHead className="hidden w-32 text-muted-foreground sm:table-cell">Topic</TableHead>
            <TableHead className="w-24 text-right text-muted-foreground">Acceptance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedProblems.map((problem) => (
            <TableRow
              key={problem.id}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <TableCell className="text-muted-foreground">
                <div className="flex items-center justify-center">
                  {problem.solved ? (
                    <CheckCircle className="h-5 w-5 text-easy" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {problem.title}
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
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {problem.topic}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {problem.acceptance}%
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
