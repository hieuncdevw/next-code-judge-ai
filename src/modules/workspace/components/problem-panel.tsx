'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ProblemPanel() {
  const [activeTab, setActiveTab] = useState('description')

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto">
          <TabsTrigger
            value="description"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value="submissions"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Submissions
          </TabsTrigger>
        </TabsList>

        {/* Description Tab */}
        <TabsContent value="description" className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Description
            </h2>
            <p className="text-foreground text-sm leading-relaxed">
              Given an array of integers <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">nums</code> and
              an integer <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">target</code>, return the
              indices of the two numbers such that they add up to <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">target</code>.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Example 1
            </h3>
            <div className="bg-muted rounded-lg p-3 font-mono text-xs space-y-1">
              <div><span className="text-amber-600 dark:text-amber-400">Input:</span> nums = [2,7,11,15], target = 9</div>
              <div><span className="text-emerald-600 dark:text-emerald-400">Output:</span> [0,1]</div>
              <div><span className="text-blue-600 dark:text-blue-400">Explanation:</span> nums[0] + nums[1] == 9, return [0, 1].</div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Example 2
            </h3>
            <div className="bg-muted rounded-lg p-3 font-mono text-xs space-y-1">
              <div><span className="text-amber-600 dark:text-amber-400">Input:</span> nums = [3,2,4], target = 6</div>
              <div><span className="text-emerald-600 dark:text-emerald-400">Output:</span> [1,2]</div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Constraints
            </h3>
            <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
              <li>2 &lt;= nums.length &lt;= 10^4</li>
              <li>-10^9 &lt;= nums[i] &lt;= 10^9</li>
              <li>-10^9 &lt;= target &lt;= 10^9</li>
              <li>Only one valid answer exists.</li>
            </ul>
          </div>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="flex-1 overflow-y-auto p-4">
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No submissions yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
