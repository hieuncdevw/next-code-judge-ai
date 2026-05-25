'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import type { ReactNode } from 'react'

function SignedIn({ children }: { children: ReactNode }) {
  const { isLoaded, userId } = useAuth()
  if (!isLoaded) return null
  return userId ? <>{children}</> : null
}

function SignedOut({ children }: { children: ReactNode }) {
  const { isLoaded, userId } = useAuth()
  if (!isLoaded) return null
  return userId ? null : <>{children}</>
}

const navLinks = [
  { href: '/home', label: 'Home' },
  { href: '/problems', label: 'Problems' },
  // { href: '/discuss', label: 'Discuss' },
  { href: '/workspace', label: 'Workspace' },
]

export function NavHeader() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

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
              {navLinks.map(({ href, label }) => {
                const isActive =
                  href === '/home'
                    ? pathname === '/home'
                    : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'text-sm font-medium transition-colors',
                      isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {label}
                  </Link>
                )
              })}
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
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="rounded-lg font-medium">
                  Đăng nhập
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" className="rounded-lg font-medium">
                  Đăng ký
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  )
}
