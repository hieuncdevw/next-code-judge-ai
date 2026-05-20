import { Card } from '@/components/ui/card'

interface HeatmapDay {
  date: string
  count: number
}

interface ContributionHeatmapProps {
  data?: HeatmapDay[]
}

function getHeatmapColor(count: number) {
  if (count === 0) return 'bg-muted dark:bg-muted/40'
  if (count === 1) return 'bg-emerald-200 dark:bg-emerald-900/40'
  if (count === 2) return 'bg-emerald-400 dark:bg-emerald-800/60'
  if (count === 3) return 'bg-emerald-600 dark:bg-emerald-700/80'
  return 'bg-emerald-700 dark:bg-emerald-600'
}

const defaultData: HeatmapDay[] = Array.from({ length: 84 }, (_, i) => ({
  date: new Date(Date.now() - (83 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  count: Math.floor(Math.random() * 4),
}))

export function ContributionHeatmap({ data = defaultData }: ContributionHeatmapProps) {
  // Group data into weeks (7-day chunks)
  const weeks = []
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7))
  }

  return (
    <Card className="bg-card border-border p-4">
      <h3 className="text-lg font-bold text-foreground mb-4">Your Activity</h3>
      
      <div className="overflow-x-auto">
        <div className="flex gap-1 pb-2">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  title={`${day.date}: ${day.count} submission${day.count !== 1 ? 's' : ''}`}
                  className={`w-4 h-4 rounded ${getHeatmapColor(day.count)} hover:ring-2 hover:ring-primary transition-all cursor-pointer`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-xs">
        <span className="text-muted-foreground">Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded bg-muted dark:bg-muted/40" />
          <div className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-900/40" />
          <div className="w-3 h-3 rounded bg-emerald-400 dark:bg-emerald-800/60" />
          <div className="w-3 h-3 rounded bg-emerald-600 dark:bg-emerald-700/80" />
          <div className="w-3 h-3 rounded bg-emerald-700 dark:bg-emerald-600" />
        </div>
        <span className="text-muted-foreground">More</span>
      </div>
    </Card>
  )
}
