'use client'

import { useState } from 'react'
import { Check, X, Clock, Cpu } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { WorkspaceProblem } from '@/modules/workspace/types/workspace-problem'
import type { SubmissionResult } from '@/modules/workspace/actions/run-code'

// ── Difficulty badge helper ──────────────────────────────────────────────────
function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Easy':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
    case 'Medium':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
    case 'Hard':
      return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

// ── Submission status badge ──────────────────────────────────────────────────
function SubmissionStatusBadge({ status, label }: { status: SubmissionResult['status']; label: string }) {
  const colorMap: Record<SubmissionResult['status'], string> = {
    ACCEPTED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    WRONG_ANSWER: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
    COMPILE_ERROR: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    RUNTIME_ERROR: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
    TIME_LIMIT_EXCEEDED: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorMap[status]}`}>
      {status === 'ACCEPTED' ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {label}
    </span>
  )
}

// ── Props ────────────────────────────────────────────────────────────────────
interface ProblemPanelProps {
  problem: WorkspaceProblem | null
  /** Submission history accumulated by CodeWorkspace */
  submissions: SubmissionResult[]
}

// ── Component ────────────────────────────────────────────────────────────────
export function ProblemPanel({ problem, submissions }: ProblemPanelProps) {
  const [activeTab, setActiveTab] = useState('description')

  return (
    /*
      h-full + flex flex-col: fills the ResizablePanel container.
      The tab content area gets overflow-y-auto so it independently scrolls.
    */
    <div className="h-full flex flex-col bg-card border-r border-border min-h-0">

      {/* ── Tab bar (fixed height, never scrolls) ── */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0"
      >
        <TabsList className="shrink-0 w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto">
          <TabsTrigger
            value="description"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value="submissions"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            Submissions
            {submissions.length > 0 && (
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {submissions.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Description tab ─────────────────────────────── */}
        <TabsContent
          value="description"
          // flex-1 + min-h-0 ensures this area takes remaining height.
          // overflow-y-auto makes it scroll when content is long.
          className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5 data-[state=inactive]:hidden"
        >
          {problem ? (
            <>
              {/* Title + difficulty badge */}
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-foreground leading-snug">
                  {problem.title}
                </h2>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 ${getDifficultyColor(problem.difficulty)}`}
                >
                  {problem.difficulty}
                </span>
              </div>

              {/* Tags */}
              {problem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
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

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Description
                </h3>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {problem.description}
                </p>
              </div>

              {/* Sample test cases */}
              {problem.testCases.length > 0 && (
                <div className="space-y-3">
                  {problem.testCases.map((tc, i) => (
                    <div key={tc.id} className="space-y-1.5">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Example {i + 1}
                      </h3>
                      <div className="rounded-lg bg-muted p-3 font-mono text-xs space-y-1.5 border border-border/50">
                        <div>
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">
                            Input:{' '}
                          </span>
                          <span className="text-foreground">{tc.input}</span>
                        </div>
                        <div>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Output:{' '}
                          </span>
                          <span className="text-foreground">{tc.expectedOutput}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Constraints */}
              {problem.constraints && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Constraints
                  </h3>
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed bg-muted rounded-lg p-3 border border-border/50">
                    {problem.constraints}
                  </pre>
                </div>
              )}

              {/* Time / memory limits */}
              <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                Time limit: {problem.timeLimitMs}&thinsp;ms&ensp;·&ensp;
                Memory limit: {Math.round(problem.memoryLimitKb / 1024)}&thinsp;MB
              </p>
            </>
          ) : (
            /* Fallback: no problem loaded */
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center select-none">
              <p className="text-sm text-muted-foreground">No problem selected.</p>
              <p className="text-xs text-muted-foreground">
                Open a problem from the{' '}
                <a
                  href="/problems"
                  className="underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  Problems
                </a>{' '}
                list to start coding.
              </p>
            </div>
          )}
        </TabsContent>

        {/* ── Submissions tab ─────────────────────────────── */}
        <TabsContent
          value="submissions"
          className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 data-[state=inactive]:hidden"
        >
          {submissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground select-none">
              <p className="text-sm">No submissions yet.</p>
              <p className="text-xs mt-1">Run your code to see results here.</p>
            </div>
          ) : (
            submissions.map((sub, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border bg-muted p-3 space-y-2"
              >
                {/* Row 1: status + timestamp */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <SubmissionStatusBadge status={sub.status} label={sub.statusLabel} />
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(sub.submittedAt).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Row 2: runtime + memory (if available) */}
                {(sub.runtime !== undefined || sub.memory !== undefined) && (
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {sub.runtime !== undefined && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {sub.runtime} ms
                      </span>
                    )}
                    {sub.memory !== undefined && (
                      <span className="flex items-center gap-1">
                        <Cpu className="h-3 w-3" />
                        {Math.round(sub.memory / 1024)} MB
                      </span>
                    )}
                    <span className="ml-auto">
                      {sub.passedTests}/{sub.totalTests} tests
                    </span>
                  </div>
                )}

                {/* Row 3: error message (if any) */}
                {sub.errorMessage && (
                  <pre className="rounded bg-background border border-border/50 p-2 font-mono text-xs text-foreground whitespace-pre-wrap overflow-x-auto">
                    {sub.errorMessage}
                  </pre>
                )}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
