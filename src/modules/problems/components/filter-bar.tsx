'use client'

import { Search, X, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface FilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedDifficulty: string
  onDifficultyChange: (value: string) => void
  selectedTopic: string
  onTopicChange: (value: string) => void
}

const difficulties = ['Easy', 'Medium', 'Hard']
const topics = ['Array', 'String', 'Hash Table', 'Tree', 'Graph', 'Dynamic Programming']

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedTopic,
  onTopicChange,
}: FilterBarProps) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3 rounded-md border border-input bg-background px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search problems..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={selectedTopic ? 'default' : 'outline'}
              className="w-full sm:w-auto flex items-center gap-2"
            >
              {selectedTopic || 'Topic'}
              <ChevronDown className="h-4 w-4" />
              {selectedTopic && (
                <X className="ml-2 h-3 w-3" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onTopicChange('')}>
              All
            </DropdownMenuItem>
            {topics.map((topic) => (
              <DropdownMenuItem
                key={topic}
                onClick={() =>
                  onTopicChange(selectedTopic === topic ? '' : topic)
                }
              >
                {topic}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={selectedDifficulty ? 'default' : 'outline'}
              className="w-full sm:w-auto flex items-center gap-2"
            >
              {selectedDifficulty || 'Difficulty'}
              <ChevronDown className="h-4 w-4" />
              {selectedDifficulty && (
                <X className="ml-2 h-3 w-3" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onDifficultyChange('')}>
              All
            </DropdownMenuItem>
            {difficulties.map((difficulty) => (
              <DropdownMenuItem
                key={difficulty}
                onClick={() =>
                  onDifficultyChange(
                    selectedDifficulty === difficulty ? '' : difficulty
                  )
                }
              >
                {difficulty}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
