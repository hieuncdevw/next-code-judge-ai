'use client'

import { useState, useTransition } from 'react'
import { Play, Check, X, Loader2, Clock, Cpu, Lock, Info } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { runCode, type SubmissionResult } from '@/modules/workspace/actions/run-code'
import { SignInButton } from '@clerk/nextjs'
import type { WorkspaceProblem } from '@/modules/workspace/types/workspace-problem'

// ── Status helpers ───────────────────────────────────────────────────────────
type StatusConfig = {
  bgClass: string
  textClass: string
  borderClass: string
  icon: React.ReactNode
}

function getStatusConfig(status: SubmissionResult['status']): StatusConfig {
  switch (status) {
    case 'ACCEPTED':
      return {
        bgClass: 'bg-emerald-50 dark:bg-emerald-950',
        textClass: 'text-emerald-800 dark:text-emerald-200',
        borderClass: 'border-emerald-200 dark:border-emerald-800',
        icon: <Check className="h-4 w-4" />,
      }
    case 'WRONG_ANSWER':
      return {
        bgClass: 'bg-rose-50 dark:bg-rose-950',
        textClass: 'text-rose-800 dark:text-rose-200',
        borderClass: 'border-rose-200 dark:border-rose-800',
        icon: <X className="h-4 w-4" />,
      }
    case 'COMPILE_ERROR':
      return {
        bgClass: 'bg-amber-50 dark:bg-amber-950',
        textClass: 'text-amber-800 dark:text-amber-200',
        borderClass: 'border-amber-200 dark:border-amber-800',
        icon: <X className="h-4 w-4" />,
      }
    case 'RUNTIME_ERROR':
      return {
        bgClass: 'bg-orange-50 dark:bg-orange-950',
        textClass: 'text-orange-800 dark:text-orange-200',
        borderClass: 'border-orange-200 dark:border-orange-800',
        icon: <X className="h-4 w-4" />,
      }
    case 'TIME_LIMIT_EXCEEDED':
      return {
        bgClass: 'bg-purple-50 dark:bg-purple-950',
        textClass: 'text-purple-800 dark:text-purple-200',
        borderClass: 'border-purple-200 dark:border-purple-800',
        icon: <Clock className="h-4 w-4" />,
      }
    case 'UNAUTHORIZED':
      return {
        bgClass: 'bg-yellow-50 dark:bg-yellow-950/30',
        textClass: 'text-yellow-800 dark:text-yellow-200',
        borderClass: 'border-yellow-200 dark:border-yellow-800',
        icon: <Lock className="h-4 w-4" />,
      }
    case 'DISPLAY_ONLY':
      return {
        bgClass: 'bg-blue-50 dark:bg-blue-950/30',
        textClass: 'text-blue-800 dark:text-blue-200',
        borderClass: 'border-blue-200 dark:border-blue-800',
        icon: <Info className="h-4 w-4" />,
      }
  }
}

// ── Props ────────────────────────────────────────────────────────────────────
interface ConsolePanelProps {
  /** Current editor code — passed from CodeWorkspace */
  code: string
  /** Currently selected language — passed from CodeWorkspace */
  language: string
  /** Currently loaded problem */
  problem: WorkspaceProblem | null
  /** Called after each submission so CodeWorkspace can accumulate results */
  onSubmissionResult: (result: SubmissionResult) => void
}

// ── Component ────────────────────────────────────────────────────────────────
export function ConsolePanel({
  code,
  language,
  problem,
  onSubmissionResult,
}: ConsolePanelProps) {
  const [activeTab, setActiveTab] = useState('testcases')
  const [lastResult, setLastResult] = useState<SubmissionResult | null>(null)
  // useTransition gives us isPending for free without managing a boolean
  const [isPending, startTransition] = useTransition()

  const problemId = problem?.id ?? ''
  const problemSlug = problem?.slug ?? ''
  const testCases: WorkspaceProblem['testCases'] =
    problem?.testCases?.filter((tc) => tc.isSample) || []

  const handleRunCode = () => {
    setActiveTab('result')

    startTransition(async () => {
      const result = await runCode({ problemId, problemSlug, language, code })
      setLastResult(result)
      onSubmissionResult(result)
    })
  }

  return (
    <div className="h-full flex flex-col bg-card border-t border-border min-h-0">

      {/* ── Tabs ── */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0"
      >
        <TabsList className="shrink-0 w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto">
          <TabsTrigger
            value="testcases"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2.5 text-sm"
          >
            Test Cases
          </TabsTrigger>
          <TabsTrigger
            value="result"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2.5 text-sm"
          >
            Result
          </TabsTrigger>
        </TabsList>

        {/* ── Test Cases tab ── */}
        <TabsContent
          value="testcases"
          className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 data-[state=inactive]:hidden"
        >
          {testCases.map((tc, idx) => (
            <div
              key={tc.id || idx}
              className="rounded-lg border border-border bg-muted p-3 space-y-2"
            >
              <span className="text-xs font-semibold text-muted-foreground font-mono">
                Test Case {idx + 1}
              </span>
              <div className="rounded bg-background border border-border/50 p-2 font-mono text-xs text-foreground space-y-1">
                <div>
                  <span className="text-muted-foreground">Input: </span>
                  {tc.input.split('\n').join(', ')}
                </div>
                <div>
                  <span className="text-muted-foreground">Expected: </span>
                  {tc.expectedOutput}
                </div>
              </div>
            </div>
          ))}
          {testCases.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No test cases available.</p>
            </div>
          )}
        </TabsContent>

        {/* ── Result tab ── */}
        <TabsContent
          value="result"
          className="flex-1 min-h-0 overflow-y-auto p-4 data-[state=inactive]:hidden"
        >
          {isPending && (
            <div className="flex items-center justify-center gap-2 py-10 text-blue-600 dark:text-blue-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm">Running tests…</p>
            </div>
          )}

          {!isPending && lastResult === null && (
            <div className="text-center py-10 text-muted-foreground select-none">
              <p className="text-sm">Click &quot;Run Code&quot; to execute your solution.</p>
            </div>
          )}

          {!isPending && lastResult !== null && (() => {
            const cfg = getStatusConfig(lastResult.status)
            const testResults = lastResult.testResults ?? []
            return (
              <div className="space-y-3">
                {/* Status banner */}
                <div className={`rounded-lg border ${cfg.borderClass} ${cfg.bgClass} p-3 flex items-center gap-2`}>
                  <span className={cfg.textClass}>{cfg.icon}</span>
                  <p className={`text-sm font-semibold ${cfg.textClass}`}>
                    {lastResult.statusLabel}
                  </p>
                  {lastResult.status !== 'UNAUTHORIZED' && lastResult.status !== 'DISPLAY_ONLY' && (
                    <span className={`ml-auto text-xs ${cfg.textClass} opacity-70`}>
                      {lastResult.passedTests}/{lastResult.totalTests} tests
                    </span>
                  )}
                </div>

                {/* Runtime / memory stats */}
                {lastResult.runtime !== undefined && (
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lastResult.runtime} ms
                    </span>
                    {lastResult.memory !== undefined && (
                      <span className="flex items-center gap-1">
                        <Cpu className="h-3 w-3" />
                        {Math.round(lastResult.memory / 1024)} MB
                      </span>
                    )}
                  </div>
                )}

                {/* Error message (compile / runtime) */}
                {lastResult.errorMessage && (
                  lastResult.status === 'UNAUTHORIZED' ? (
                    <div className="rounded-lg border border-yellow-200/60 bg-yellow-50/40 p-4 dark:border-yellow-800/40 dark:bg-yellow-950/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed font-medium">
                        {lastResult.errorMessage}
                      </p>
                      <SignInButton mode="modal">
                        <Button
                          size="sm"
                          className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg shrink-0 self-start md:self-auto"
                        >
                          Đăng nhập
                        </Button>
                      </SignInButton>
                    </div>
                  ) : lastResult.status === 'DISPLAY_ONLY' ? (
                    <div className="rounded-lg border border-blue-200/60 bg-blue-50/40 p-4 dark:border-blue-800/40 dark:bg-blue-950/10 flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed font-medium">
                        {lastResult.errorMessage}
                      </p>
                    </div>
                  ) : (
                    <pre className="rounded-lg bg-muted border border-border/50 p-3 font-mono text-xs text-foreground whitespace-pre-wrap overflow-x-auto">
                      {lastResult.errorMessage}
                    </pre>
                  )
                )}

                {/* Per-test breakdown */}
                {lastResult.status !== 'UNAUTHORIZED' && lastResult.status !== 'DISPLAY_ONLY' && testResults.length > 0 && (
                  <div className="rounded-lg bg-muted p-3 font-mono text-xs space-y-1.5 border border-border/50">
                    {testCases.map((tc, idx) => {
                      const result = testResults.find((item) => item.testCaseId === tc.id) ?? testResults[idx]
                      if (!result) {
                        return null
                      }

                      const passed = result.passed
                      return (
                        <div
                          key={tc.id || idx}
                          className={passed
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'}
                        >
                          {passed ? '✓' : '✗'} Test Case {idx + 1}: {passed ? 'Passed' : 'Failed'}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })()}
        </TabsContent>
      </Tabs>

      {/* ── Action bar (fixed at bottom) ── */}
      <div className="shrink-0 border-t border-border p-3">
        <Button
          onClick={handleRunCode}
          disabled={isPending}
          className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white gap-2 transition-all duration-150"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {isPending ? 'Running…' : 'Run Code'}
        </Button>
      </div>

    </div>
  )
}
