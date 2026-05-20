'use client'

import { Card } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface StatItem {
  label: string
  value: number
  color: string
}

export function ProgressCard() {
  const solved = 42
  const total = 150
  const percentage = Math.round((solved / total) * 100)

  const stats: StatItem[] = [
    { label: 'Easy', value: 28, color: 'bg-easy' },
    { label: 'Medium', value: 12, color: 'bg-medium' },
    { label: 'Hard', value: 2, color: 'bg-hard' },
  ]

  return (
    <Card className="border border-border bg-card p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Your Progress</h3>
          <p className="text-sm text-muted-foreground">
            Keep solving to improve
          </p>
        </div>

        {/* Circular Progress */}
        <div className="flex items-center justify-center">
          <div className="relative h-40 w-40">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-border"
              />

              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${(percentage / 100) * 440} 440`}
                className="text-primary transition-all duration-500"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-foreground">{percentage}%</div>
              <div className="text-xs text-muted-foreground">
                {solved}/{total}
              </div>
            </div>
          </div>
        </div>

        {/* Stats breakdown */}
        <div className="space-y-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${stat.color}`} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Motivation */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground">Great Progress!</p>
              <p className="text-xs text-muted-foreground">
                Solve 8 more problems to reach 50%
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
