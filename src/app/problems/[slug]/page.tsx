import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Code2 } from 'lucide-react'
import type { Metadata } from 'next'

import { NavHeader } from '@/components/layout/nav-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getProblemBySlug } from '@/modules/problems/actions/get-problem-by-slug'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const problem = await getProblemBySlug(slug)
  if (!problem) return { title: 'Problem Not Found - Next Code Judge' }
  return {
    title: `${problem.title} - Next Code Judge`,
    description: problem.description.slice(0, 160),
  }
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Easy':
      return 'bg-easy/10 text-easy'
    case 'Medium':
      return 'bg-medium/10 text-medium'
    case 'Hard':
      return 'bg-hard/10 text-hard'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export default async function ProblemDetailPage({ params }: Props) {
  const { slug } = await params
  const problem = await getProblemBySlug(slug)

  if (!problem) {
    notFound()
  }

  const sampleCases = problem.testCases.filter((tc) => tc.isSample)

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top bar: back link + Start Coding */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/problems"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Problems
          </Link>

          <Button asChild size="sm" className="gap-2">
            <Link href={`/workspace?problem=${problem.slug}`}>
              <Code2 className="h-4 w-4" />
              Start Coding
            </Link>
          </Button>
        </div>

        {/* Title + metadata */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{problem.title}</h1>
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getDifficultyColor(problem.difficulty)}`}
            >
              {problem.difficulty}
            </span>
          </div>

          {problem.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {problem.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded px-2 py-0.5 text-xs bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Time limit: {problem.timeLimitMs} ms &nbsp;·&nbsp;
            Memory limit: {Math.round(problem.memoryLimitKb / 1024)} MB
          </p>
        </div>

        {/* Description */}
        <Card className="mb-6 border border-border bg-card">
          <CardContent className="p-6">
            <h2 className="mb-3 text-base font-semibold text-foreground">Description</h2>
            <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/90">
              {problem.description}
            </p>
          </CardContent>
        </Card>

        {/* Sample Test Cases */}
        {sampleCases.length > 0 && (
          <div className="space-y-4">
            {sampleCases.map((tc, i) => (
              <Card key={tc.id} className="border border-border bg-card">
                <CardContent className="p-6">
                  <h2 className="mb-3 text-base font-semibold text-foreground">
                    Example {i + 1}
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Input
                      </p>
                      <pre className="rounded-md bg-muted px-4 py-3 text-sm font-mono text-foreground overflow-x-auto">
                        {tc.input}
                      </pre>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Output
                      </p>
                      <pre className="rounded-md bg-muted px-4 py-3 text-sm font-mono text-foreground overflow-x-auto">
                        {tc.expectedOutput}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Constraints */}
        {problem.constraints && (
          <Card className="mt-6 border border-border bg-card">
            <CardContent className="p-6">
              <h2 className="mb-3 text-base font-semibold text-foreground">Constraints</h2>
              <pre className="whitespace-pre-wrap text-sm leading-7 text-foreground/90 font-mono">
                {problem.constraints}
              </pre>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
