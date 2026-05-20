'use client'

import { useState } from 'react'
import { Play, Check, X, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

const mockTestCases = [
  {
    id: 1,
    input: 'nums = [2,7,11,15]\ntarget = 9',
    output: '[0,1]',
    status: 'passed' as const,
  },
  {
    id: 2,
    input: 'nums = [3,2,4]\ntarget = 6',
    output: '[1,2]',
    status: 'passed' as const,
  },
  {
    id: 3,
    input: 'nums = [3,3]\ntarget = 6',
    output: '[0,1]',
    status: 'passed' as const,
  },
]

type ExecutionStatus = 'idle' | 'running' | 'passed' | 'failed'

export function ConsolePanel() {
  const [activeTab, setActiveTab] = useState('testcases')
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>('idle')

  const handleRunCode = () => {
    setExecutionStatus('running')
    setActiveTab('result')
    // Placeholder: will call Judge0 API
    setTimeout(() => setExecutionStatus('passed'), 1500)
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

        {/* Test Cases */}
        <TabsContent
          value="testcases"
          className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 data-[state=inactive]:hidden"
        >
          {mockTestCases.map((tc) => (
            <div
              key={tc.id}
              className="rounded-lg border border-border bg-muted p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground font-mono">
                  Test Case {tc.id}
                </span>
                {tc.status === 'passed' ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3 w-3" /> Passed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
                    <X className="h-3 w-3" /> Failed
                  </span>
                )}
              </div>
              <div className="rounded bg-background border border-border/50 p-2 font-mono text-xs text-foreground space-y-1">
                <div>
                  <span className="text-muted-foreground">Input: </span>
                  {tc.input.split('\n').join(', ')}
                </div>
                <div>
                  <span className="text-muted-foreground">Output: </span>
                  {tc.output}
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Result */}
        <TabsContent
          value="result"
          className="flex-1 min-h-0 overflow-y-auto p-4 data-[state=inactive]:hidden"
        >
          {executionStatus === 'idle' && (
            <div className="text-center py-8 text-muted-foreground select-none">
              <p className="text-sm">Click &quot;Run Code&quot; to execute your solution.</p>
            </div>
          )}
          {executionStatus === 'running' && (
            <div className="flex items-center justify-center gap-2 py-8 text-blue-600 dark:text-blue-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm">Running tests…</p>
            </div>
          )}
          {executionStatus === 'passed' && (
            <div className="space-y-3">
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 p-3">
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                  ✓ All test cases passed!
                </p>
              </div>
              <div className="rounded-lg bg-muted p-3 font-mono text-xs space-y-1.5 border border-border/50">
                {mockTestCases.map((tc) => (
                  <div key={tc.id} className="text-emerald-600 dark:text-emerald-400">
                    ✓ Test Case {tc.id}: Passed
                  </div>
                ))}
              </div>
            </div>
          )}
          {executionStatus === 'failed' && (
            <div className="space-y-3">
              <div className="rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950 p-3">
                <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">
                  ✗ Some test cases failed.
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Action bar (fixed at bottom) ── */}
      <div className="shrink-0 border-t border-border p-3">
        <Button
          onClick={handleRunCode}
          disabled={executionStatus === 'running'}
          className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white gap-2 transition-all duration-150"
        >
          {executionStatus === 'running' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {executionStatus === 'running' ? 'Running…' : 'Run Code'}
        </Button>
      </div>

    </div>
  )
}
