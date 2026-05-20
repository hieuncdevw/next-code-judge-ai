import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DailyChallengeProps {
  title?: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  acceptanceRate?: number
  description?: string
  /** @deprecated use problemSlug instead */
  problemId?: string
  /** URL slug of the problem, used to navigate to /workspace?problem={slug} */
  problemSlug?: string
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Easy':
      return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
    case 'Medium':
      return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
    case 'Hard':
      return 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400'
    default:
      return 'bg-gray-50 dark:bg-gray-950/20 text-gray-700 dark:text-gray-400'
  }
}

export function DailyChallengeCard({
  title = 'Two Sum',
  difficulty = 'Easy',
  acceptanceRate = 47.3,
  description = 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.',
  problemId = '1',
  problemSlug = 'two-sum',
}: DailyChallengeProps) {
  return (
    <Card className="bg-card border-border p-6 lg:col-span-2">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </span>
            <span className="text-sm text-muted-foreground">
              {acceptanceRate}% Acceptance
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
        {description}
      </p>

      <Link href={`/workspace?problem=${problemSlug}`}>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          Solve Challenge
        </Button>
      </Link>
    </Card>
  )
}
