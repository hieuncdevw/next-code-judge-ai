import { Card } from '@/components/ui/card'

interface LeaderboardEntry {
  rank: number
  username: string
  points: number
  isCurrentUser?: boolean
}

interface GlobalLeaderboardProps {
  entries?: LeaderboardEntry[]
  currentUserRank?: number
}

const defaultEntries: LeaderboardEntry[] = [
  { rank: 1, username: 'AlgoMaster', points: 2850, isCurrentUser: false },
  { rank: 2, username: 'CodeNinja', points: 2720, isCurrentUser: false },
  { rank: 3, username: 'DataWizard', points: 2615, isCurrentUser: false },
  { rank: 4, username: 'HashHunter', points: 2540, isCurrentUser: false },
  { rank: 5, username: 'SortSage', points: 2480, isCurrentUser: false },
]

export function GlobalLeaderboard({ 
  entries = defaultEntries,
  currentUserRank = 127,
}: GlobalLeaderboardProps) {
  return (
    <Card className="bg-card border-border p-4">
      <h3 className="text-lg font-bold text-foreground mb-4">Top Users</h3>
      
      <div className="space-y-2 mb-4">
        {entries.map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center justify-between px-3 py-2 rounded ${
              entry.isCurrentUser
                ? 'bg-primary/10 dark:bg-primary/5 border border-primary/30'
                : 'hover:bg-muted/50 dark:hover:bg-muted/20'
            } transition-colors`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-sm font-bold text-muted-foreground w-6">
                #{entry.rank}
              </span>
              <span className="text-sm font-medium text-foreground truncate">
                {entry.username}
              </span>
            </div>
            <span className="text-sm font-bold text-primary ml-2">
              {entry.points}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between px-3 py-2 bg-muted/30 dark:bg-muted/10 rounded">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-sm font-bold text-muted-foreground">
              #{currentUserRank}
            </span>
            <span className="text-sm font-medium text-foreground truncate">
              You
            </span>
          </div>
          <span className="text-sm font-bold text-muted-foreground ml-2">
            1,240
          </span>
        </div>
      </div>
    </Card>
  )
}
