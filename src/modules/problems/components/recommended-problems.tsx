'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface RecommendedProblem {
  id: number
  title: string
  slug?: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  reason: string
}

const recommendedProblems: RecommendedProblem[] = [
  {
    id: 53,
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    difficulty: 'Medium',
    reason: 'Popular interview question',
  },
  {
    id: 15,
    title: '3Sum',
    slug: '3sum',
    difficulty: 'Medium',
    reason: 'Based on your history',
  },
  {
    id: 4,
    title: 'Median of Two Sorted Arrays',
    slug: 'median-of-two-sorted-arrays',
    difficulty: 'Hard',
    reason: 'Challenge yourself',
  },
]

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Easy':
      return 'text-easy'
    case 'Medium':
      return 'text-medium'
    case 'Hard':
      return 'text-hard'
    default:
      return 'text-muted-foreground'
  }
}

export function RecommendedProblems() {
  return (
    <Card className="border border-border bg-card p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recommended</h3>
          <p className="text-sm text-muted-foreground">
            Curated for you
          </p>
        </div>

        <div className="space-y-3">
          {recommendedProblems.map((problem) => {
            const content = (
              <>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-xs font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                  {problem.slug && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </div>
                <p className="text-xs font-medium text-foreground line-clamp-2">
                  {problem.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {problem.reason}
                </p>
              </>
            )

            if (problem.slug) {
              return (
                <Link
                  key={problem.id}
                  href={`/problems/${encodeURIComponent(problem.slug)}`}
                  className="group block rounded-lg border border-border bg-muted/50 p-3 transition-all hover:bg-muted"
                >
                  {content}
                </Link>
              )
            }

            return (
              <div
                key={problem.id}
                className="rounded-lg border border-border bg-muted/50 p-3"
              >
                {content}
              </div>
            )
          })}
        </div>

        <Button className="w-full" variant="default" asChild>
          <Link href="/problems">View More Recommendations</Link>
        </Button>
      </div>
    </Card>
  )
}
