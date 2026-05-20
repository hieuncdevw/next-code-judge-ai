import { Card } from '@/components/ui/card'
import { CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

interface Submission {
  id: string
  problemTitle: string
  /** Slug used to navigate to /workspace?problem={slug} */
  problemSlug: string
  status: 'accepted' | 'wrong_answer'
  executionTime: number
  timestamp: string
}

interface RecentActivityFeedProps {
  submissions?: Submission[]
}

const defaultSubmissions: Submission[] = [
  { id: '1', problemTitle: 'Two Sum', problemSlug: 'two-sum', status: 'accepted', executionTime: 15, timestamp: '2 hours ago' },
  { id: '2', problemTitle: 'Add Two Numbers', problemSlug: 'add-two-numbers', status: 'accepted', executionTime: 24, timestamp: '5 hours ago' },
  { id: '3', problemTitle: 'Longest Substring', problemSlug: 'longest-substring-without-repeating-characters', status: 'wrong_answer', executionTime: 8, timestamp: '1 day ago' },
  { id: '4', problemTitle: 'Median of Two Sorted', problemSlug: 'median-of-two-sorted-arrays', status: 'accepted', executionTime: 12, timestamp: '2 days ago' },
  { id: '5', problemTitle: 'Zigzag Conversion', problemSlug: 'zigzag-conversion', status: 'accepted', executionTime: 3, timestamp: '3 days ago' },
]

export function RecentActivityFeed({ submissions = defaultSubmissions }: RecentActivityFeedProps) {
  return (
    <Card className="bg-card border-border p-4 sm:p-6 lg:col-span-2">
      <h3 className="text-lg font-bold text-foreground mb-4">Recent Submissions</h3>
      
      <div className="space-y-3">
        {submissions.map((submission) => (
          <Link 
            key={submission.id}
          href={`/workspace?problem=${submission.problemSlug}`}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {submission.status === 'accepted' ? (
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {submission.problemTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  {submission.timestamp}
                </p>
              </div>
            </div>
            <div className="text-right ml-2 flex-shrink-0">
              <p className="text-xs font-medium text-muted-foreground">
                {submission.executionTime}ms
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}
