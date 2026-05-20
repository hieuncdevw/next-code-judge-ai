import { Card } from '@/components/ui/card'
import { Flame } from 'lucide-react'

interface WelcomeBannerProps {
  username?: string
  streak?: number
}

export function WelcomeBanner({ username = 'User', streak = 5 }: WelcomeBannerProps) {
  return (
    <Card className="bg-card border-border p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome back, {username}!
          </h2>
          <p className="text-muted-foreground text-sm">
            Keep up your coding streak
          </p>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/20 px-3 py-2 rounded-lg">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="font-bold text-orange-600 dark:text-orange-400">{streak}</span>
        </div>
      </div>
    </Card>
  )
}
