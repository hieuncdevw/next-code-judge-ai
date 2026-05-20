import { Card } from '@/components/ui/card'
import { Lightbulb } from 'lucide-react'

interface AIMentorTipProps {
  tip?: string
}

const defaultTips = [
  'Optimize your last submission using Binary Search to reduce time complexity to O(log N)',
  'Try using a HashMap to solve Two Sum in O(N) time with a single pass',
  'Dynamic Programming can reduce your exponential solution to polynomial time',
  'Consider using a Sliding Window approach for substring problems',
  'Two pointers technique is efficient for sorted array problems',
]

export function AIMentorTip({ tip = defaultTips[0] }: AIMentorTipProps) {
  return (
    <Card className="bg-card border-border p-4">
      <div className="flex gap-3">
        <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">
            AI Mentor Tip
          </p>
          <p className="text-sm text-muted-foreground">
            {tip}
          </p>
        </div>
      </div>
    </Card>
  )
}
