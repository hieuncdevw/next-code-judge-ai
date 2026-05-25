'use client'

import { ThemeToggle } from './theme-toggle'

export function Header() {

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Problems</h1>
            <p className="text-sm text-muted-foreground">
              Browse and solve coding challenges
            </p>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
