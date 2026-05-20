'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function NavHeader() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">NCJ</span>
              </div>
              <span className="font-bold text-foreground hidden sm:inline">Next Code Judge</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/problems" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Problems
              </Link>
              <Link 
                href="/contests" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Contests
              </Link>
              <Link 
                href="/discuss" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Discuss
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">U</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
