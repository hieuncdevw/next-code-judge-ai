import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Clock, HelpCircle, Info, XCircle } from 'lucide-react'
import Link from 'next/link'

export type RecentActivityStatus =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'COMPILE_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT_EXCEEDED'
  | 'PENDING'
  | 'RUNNING'
  | 'DISPLAY_ONLY'
  | 'UNAUTHORIZED'
  | string

interface Submission {
  id: string
  problemTitle: string
  /** Slug used to navigate to /workspace?problem={slug} */
  problemSlug: string
  status: RecentActivityStatus
  executionTime: number
  timestamp: string
}

interface RecentActivityFeedProps {
  submissions?: Submission[]
  isAuthenticated?: boolean
}

const defaultSubmissions: Submission[] = [
  { id: '1', problemTitle: 'Two Sum', problemSlug: 'two-sum', status: 'ACCEPTED', executionTime: 15, timestamp: '2 hours ago' },
  { id: '2', problemTitle: 'Add Two Numbers', problemSlug: 'add-two-numbers', status: 'ACCEPTED', executionTime: 24, timestamp: '5 hours ago' },
  { id: '3', problemTitle: 'Longest Substring', problemSlug: 'longest-substring-without-repeating-characters', status: 'WRONG_ANSWER', executionTime: 8, timestamp: '1 day ago' },
  { id: '4', problemTitle: 'Median of Two Sorted', problemSlug: 'median-of-two-sorted-arrays', status: 'ACCEPTED', executionTime: 12, timestamp: '2 days ago' },
  { id: '5', problemTitle: 'Zigzag Conversion', problemSlug: 'zigzag-conversion', status: 'ACCEPTED', executionTime: 3, timestamp: '3 days ago' },
]

function getStatusConfig(status: RecentActivityStatus) {
  switch (status) {
    case 'ACCEPTED':
      return {
        label: 'Accepted',
        icon: CheckCircle,
        iconClass: 'text-emerald-600 dark:text-emerald-400',
        badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
      }
    case 'WRONG_ANSWER':
      return {
        label: 'Wrong Answer',
        icon: XCircle,
        iconClass: 'text-rose-600 dark:text-rose-400',
        badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
      }
    case 'COMPILE_ERROR':
      return {
        label: 'Compile Error',
        icon: AlertCircle,
        iconClass: 'text-amber-600 dark:text-amber-400',
        badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
      }
    case 'RUNTIME_ERROR':
      return {
        label: 'Runtime Error',
        icon: AlertCircle,
        iconClass: 'text-orange-600 dark:text-orange-400',
        badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
      }
    case 'TIME_LIMIT_EXCEEDED':
      return {
        label: 'Time Limit',
        icon: Clock,
        iconClass: 'text-purple-600 dark:text-purple-400',
        badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
      }
    case 'PENDING':
    case 'RUNNING':
      return {
        label: status === 'PENDING' ? 'Pending' : 'Running',
        icon: Clock,
        iconClass: 'text-blue-600 dark:text-blue-400',
        badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
      }
    case 'DISPLAY_ONLY':
      return {
        label: 'Display Only',
        icon: Info,
        iconClass: 'text-sky-600 dark:text-sky-400',
        badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
      }
    case 'UNAUTHORIZED':
      return {
        label: 'Unauthorized',
        icon: AlertCircle,
        iconClass: 'text-yellow-600 dark:text-yellow-400',
        badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
      }
    default:
      return {
        label: 'Unknown',
        icon: HelpCircle,
        iconClass: 'text-muted-foreground',
        badgeClass: 'bg-muted text-muted-foreground',
      }
  }
}

export function RecentActivityFeed({ submissions = defaultSubmissions, isAuthenticated = true }: RecentActivityFeedProps) {
  return (
    <Card className="bg-card border-border p-4 sm:p-6 lg:col-span-2">
      <h3 className="text-lg font-bold text-foreground mb-4">Recent Submissions</h3>
      
      {!isAuthenticated ? (
        <div className="text-center py-10 text-muted-foreground select-none">
          <p className="text-sm">Đăng nhập để xem lịch sử nộp bài.</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground select-none">
          <p className="text-sm">No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => {
            const statusConfig = getStatusConfig(submission.status)
            const StatusIcon = statusConfig.icon

            return (
              <Link
                key={submission.id}
                href={`/workspace?problem=${submission.problemSlug}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <StatusIcon className={`h-5 w-5 flex-shrink-0 ${statusConfig.iconClass}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {submission.problemTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {submission.timestamp}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-2 flex-shrink-0 space-y-1">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusConfig.badgeClass}`}>
                    {statusConfig.label}
                  </span>
                  <p className="text-xs font-medium text-muted-foreground">
                    {submission.executionTime}ms
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </Card>
  )
}
