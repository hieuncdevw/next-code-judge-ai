'use client'

import { Button } from '@/components/ui/button'
import { ThemeToggle } from './theme-toggle'
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

function isNavLinkActive(pathname: string, href: string) {
  return href === '/home' ? pathname === '/home' : pathname === href || pathname.startsWith(`${href}/`)
}

export function NavHeader() {
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
                const isActive = isNavLinkActive(pathname, href)
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
            <ThemeToggle />
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

        <nav className="mt-3 flex md:hidden items-center gap-2 overflow-x-auto">
          {navLinks.map(({ href, label }) => {
            const isActive = isNavLinkActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
