'use client'

import { useState } from 'react'
import { Play, Check, X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

export function ConsolePanel() {
  const [activeTab, setActiveTab] = useState('testcases')
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'passed' | 'failed'>('idle')

  const testCases = [
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

  const handleRunCode = () => {
    setExecutionStatus('running')
    setTimeout(() => {
      setExecutionStatus('passed')
    }, 1500)
  }

  return (
    <div className="h-full flex flex-col bg-card border-t border-border">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto">
          <TabsTrigger
            value="testcases"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            Test Cases
          </TabsTrigger>
          <TabsTrigger
            value="result"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            Result
          </TabsTrigger>
        </TabsList>

        {/* Test Cases Tab */}
        <TabsContent value="testcases" className="flex-1 overflow-y-auto p-3 space-y-2">
          {testCases.map((testCase) => (
            <div
              key={testCase.id}
              className="bg-muted rounded-lg p-3 border border-border"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-mono font-semibold text-muted-foreground">
                  Test Case {testCase.id}
                </span>
                {testCase.status === 'passed' ? (
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs">
                    <Check className="h-3 w-3" />
                    Passed
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs">
                    <X className="h-3 w-3" />
                    Failed
                  </div>
                )}
              </div>
              <div className="text-xs font-mono text-foreground bg-background rounded p-2 space-y-1">
                <div><span className="text-muted-foreground">Input:</span> {testCase.input.split('\n').join(', ')}</div>
                <div><span className="text-muted-foreground">Output:</span> {testCase.output}</div>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Result Tab */}
        <TabsContent value="result" className="flex-1 overflow-y-auto p-4">
          {executionStatus === 'idle' && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Click "Run Code" to execute</p>
            </div>
          )}
          {executionStatus === 'running' && (
            <div className="text-center py-8 text-blue-600 dark:text-blue-400">
              <p className="text-sm">Running tests...</p>
            </div>
          )}
          {executionStatus === 'passed' && (
            <div className="space-y-3">
              <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">All tests passed!</p>
              </div>
              <div className="bg-muted rounded-lg p-3 font-mono text-xs space-y-2">
                <div>✓ Test Case 1: Passed</div>
                <div>✓ Test Case 2: Passed</div>
                <div>✓ Test Case 3: Passed</div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="border-t border-border p-3 flex gap-2">
        <Button
          onClick={handleRunCode}
          disabled={executionStatus === 'running'}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-9"
        >
          <Play className="h-4 w-4" />
          Run Code
        </Button>
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-9">
          Submit
        </Button>
      </div>
    </div>
  )
}
