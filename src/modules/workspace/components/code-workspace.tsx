'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { ProblemPanel } from './problem-panel'
import { EditorPanel } from './editor-panel'
import { ConsolePanel } from './console-panel'
import { AIChatPanel } from '@/modules/ai/components/ai-chat-panel'
import type { WorkspaceProblem, WorkspaceSubmission } from '@/modules/workspace/types/workspace-problem'
import type { SubmissionResult } from '@/modules/workspace/actions/run-code'

function getDefaultCode(slug: string, language: string): string {
  if (slug === 'two-sum') {
    if (language === 'python') {
      return `def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []`
    }
    return `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n};`
  }
  if (slug === 'valid-parentheses') {
    if (language === 'python') {
      return `def isValid(s: str) -> bool:\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping:\n            top_element = stack.pop() if stack else '#'\n            if mapping[char] != top_element:\n                return False\n        else:\n            stack.append(char)\n    return not stack`
    }
    return `/**\n * @param {string} s\n * @return {boolean}\n */\nvar isValid = function(s) {\n    const stack = [];\n    const map = {\n        ')': '(',\n        '}': '{',\n        ']': '['\n    };\n    for (let char of s) {\n        if (char in map) {\n            if (stack.pop() !== map[char]) return false;\n        } else {\n            stack.push(char);\n        }\n    }\n    return stack.length === 0;\n};`
  }
  if (slug === 'palindrome-number') {
    if (language === 'python') {
      return `def isPalindrome(x: int) -> bool:\n    if x < 0:\n        return False\n    return str(x) == str(x)[::-1]`
    }
    return `/**\n * @param {number} x\n * @return {boolean}\n */\nvar isPalindrome = function(x) {\n    if (x < 0) return false;\n    const str = x.toString();\n    return str === str.split('').reverse().join('');\n};`
  }
  if (slug === 'merge-two-sorted-lists') {
    if (language === 'python') {
      return `def mergeTwoLists(list1, list2):\n    # Write your code here\n    pass`
    }
    return `/**\n * @param {ListNode} list1\n * @param {ListNode} list2\n * @return {ListNode}\n */\nvar mergeTwoLists = function(list1, list2) {\n    \n};`
  }
  if (slug === 'best-time-to-buy-and-sell-stock') {
    if (language === 'python') {
      return `def maxProfit(prices):\n    # Write your code here\n    pass`
    }
    return `/**\n * @param {number[]} prices\n * @return {number}\n */\nvar maxProfit = function(prices) {\n    \n};`
  }
  if (slug === 'binary-search') {
    if (language === 'python') {
      return `def search(nums, target):\n    # Write your code here\n    pass`
    }
    return `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */\nvar search = function(nums, target) {\n    \n};`
  }
  if (slug === 'maximum-subarray') {
    if (language === 'python') {
      return `def maxSubArray(nums):\n    # Write your code here\n    pass`
    }
    return `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar maxSubArray = function(nums) {\n    \n};`
  }
  if (slug === 'product-of-array-except-self') {
    if (language === 'python') {
      return `def productExceptSelf(nums):\n    # Write your code here\n    pass`
    }
    return `/**\n * @param {number[]} nums\n * @return {number[]}\n */\nvar productExceptSelf = function(nums) {\n    \n};`
  }
  if (slug === 'longest-substring-without-repeating-characters') {
    if (language === 'python') {
      return `def lengthOfLongestSubstring(s):\n    # Write your code here\n    pass`
    }
    return `/**\n * @param {string} s\n * @return {number}\n */\nvar lengthOfLongestSubstring = function(s) {\n    \n};`
  }
  if (slug === '3sum') {
    if (language === 'python') {
      return `def threeSum(nums):\n    # Write your code here\n    pass`
    }
    return `/**\n * @param {number[]} nums\n * @return {number[][]}\n */\nvar threeSum = function(nums) {\n    \n};`
  }
  if (slug === 'coin-change') {
    if (language === 'python') {
      return `def coinChange(coins, amount):\n    # Write your code here\n    pass`
    }
    return `/**\n * @param {number[]} coins\n * @param {number} amount\n * @return {number}\n */\nvar coinChange = function(coins, amount) {\n    \n};`
  }
  if (slug === 'binary-tree-level-order-traversal') {
    if (language === 'python') {
      return `def levelOrder(root):\n    # Write your code here\n    pass`
    }
    return `/**\n * @param {TreeNode} root\n * @return {number[][]}\n */\nvar levelOrder = function(root) {\n    \n};`
  }
  if (slug === 'median-of-two-sorted-arrays') {
    if (language === 'python') {
      return `def findMedianSortedArrays(nums1, nums2):\n    # Write your code here\n    pass`
    }
    return `/**\n * @param {number[]} nums1\n * @param {number[]} nums2\n * @return {number}\n */\nvar findMedianSortedArrays = function(nums1, nums2) {\n    \n};`
  }
  if (slug === 'merge-k-sorted-lists') {
    if (language === 'python') {
      return `def mergeKLists(lists):\n    # Write your code here\n    pass`
    }
    return `/**\n * @param {ListNode[]} lists\n * @return {ListNode}\n */\nvar mergeKLists = function(lists) {\n    \n};`
  }
  if (slug === 'edit-distance') {
    if (language === 'python') {
      return `def minDistance(word1, word2):\n    # Write your code here\n    pass`
    }
    return `/**\n * @param {string} word1\n * @param {string} word2\n * @return {number}\n */\nvar minDistance = function(word1, word2) {\n    \n};`
  }
  return `// Write your code here`
}

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

interface CodeWorkspaceProps {
  problem: WorkspaceProblem | null
  initialSubmissions?: WorkspaceSubmission[]
  isAuthenticated?: boolean
}

export function CodeWorkspace({ problem, initialSubmissions = [], isAuthenticated = false }: CodeWorkspaceProps) {
  const [showAIChat, setShowAIChat] = useState(false)

  // Shared editor state — lifted from EditorPanel so ConsolePanel can read it
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')

  // Automatically load template when problem or language changes.
  // templateKey captures both dimensions so the effect only runs when either changes.
  const templateKey = problem ? `${problem.slug}::${language}` : null

  useEffect(() => {
    if (problem && templateKey !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCode(getDefaultCode(problem.slug, language))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateKey])

  // Submission history shown in the Submissions tab
  const [submissions, setSubmissions] = useState<WorkspaceSubmission[]>(initialSubmissions)
  const activeProblemKey = problem ? `${problem.id}:${problem.slug}` : ''
  const activeProblemKeyRef = useRef(activeProblemKey)

  useEffect(() => {
    activeProblemKeyRef.current = activeProblemKey
  }, [activeProblemKey])

  // Sync state with server-side fetched submissions on problem change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSubmissions(initialSubmissions)
  }, [initialSubmissions])

  const handleSubmissionResult = useCallback((payload: {
    problemId: string
    problemSlug: string
    problemKey: string
    language: string
    result: SubmissionResult
  }) => {
    if (payload.problemKey !== activeProblemKeyRef.current) {
      return
    }

    setSubmissions((prev) => [
      {
        ...payload.result,
        language: payload.language,
      },
      ...prev,
    ])
  }, [])


  return (
    // h-full fills the flex-1 container from workspace/page.tsx
    <div className="h-full w-full bg-background flex flex-col min-h-0">

      {/* ── Workspace sub-header ─────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-border bg-card">
        {/* Left: title + difficulty */}
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-base font-semibold text-foreground truncate">
            {problem?.title ?? 'Workspace'}
          </h1>
          {problem && (
            <span
              className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}
            >
              {problem.difficulty}
            </span>
          )}
        </div>

        {/* Right: Ask AI */}
        <button
          onClick={() => setShowAIChat(!showAIChat)}
          className="
            shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium
            bg-blue-600 hover:bg-blue-700 active:scale-95
            text-white transition-all duration-150
          "
        >
          {showAIChat ? 'Close AI' : 'Ask AI'}
        </button>
      </div>

      {/* ── Main resizable area ───────────────────────────── */}
      {/*
        overflow-hidden is REQUIRED here so ResizablePanelGroup can
        constrain its children. Each panel manages its own scroll internally.
      */}
      <div className="flex-1 overflow-hidden min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full">

          {/* ── Left panel: Problem description (≈ 35 %) ── */}
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
            {/* overflow-hidden so ProblemPanel controls its own scroll */}
            <div className="h-full overflow-hidden">
              <ProblemPanel
                problem={problem}
                submissions={submissions}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* ── Right panel: Editor + Console (≈ 65 %) ───── */}
          <ResizablePanel defaultSize={65} minSize={40}>
            <ResizablePanelGroup direction="vertical" className="h-full">

              {/* Code editor */}
              <ResizablePanel defaultSize={65} minSize={35}>
                <div className="h-full overflow-hidden">
                  <EditorPanel
                    code={code}
                    language={language}
                    onCodeChange={setCode}
                    onLanguageChange={setLanguage}
                    onShowAI={() => setShowAIChat(true)}
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Console / test cases */}
              <ResizablePanel defaultSize={35} minSize={20}>
                <div className="h-full overflow-hidden">
                  <ConsolePanel
                    code={code}
                    language={language}
                    problem={problem}
                    onSubmissionResult={handleSubmissionResult}
                  />
                </div>
              </ResizablePanel>

            </ResizablePanelGroup>
          </ResizablePanel>

          {/* ── AI Chat panel (conditional) ───────────────── */}
          {showAIChat && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <div className="h-full overflow-hidden">
                  <AIChatPanel
                    onClose={() => setShowAIChat(false)}
                    problem={problem}
                    code={code}
                    language={language}
                  />
                </div>
              </ResizablePanel>
            </>
          )}

        </ResizablePanelGroup>
      </div>
    </div>
  )
}
