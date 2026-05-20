'use client'

import { useState } from 'react'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { ProblemPanel } from './problem-panel'
import { EditorPanel } from './editor-panel'
import { ConsolePanel } from './console-panel'
import { AIChatPanel } from '@/modules/ai/components/ai-chat-panel'
import type { WorkspaceProblem } from '@/modules/workspace/types/workspace-problem'

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
}

export function CodeWorkspace({ problem }: CodeWorkspaceProps) {
  const [showAIChat, setShowAIChat] = useState(false)

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

          {/* ── Left panel: Problem description (≈ 33 %) ── */}
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
            {/* overflow-hidden so ProblemPanel controls its own scroll */}
            <div className="h-full overflow-hidden">
              <ProblemPanel problem={problem} />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* ── Right panel: Editor + Console (≈ 67 %) ───── */}
          <ResizablePanel defaultSize={65} minSize={40}>
            <ResizablePanelGroup direction="vertical" className="h-full">

              {/* Code editor */}
              <ResizablePanel defaultSize={65} minSize={35}>
                <div className="h-full overflow-hidden">
                  <EditorPanel onShowAI={() => setShowAIChat(true)} />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Console / test cases */}
              <ResizablePanel defaultSize={35} minSize={20}>
                <div className="h-full overflow-hidden">
                  <ConsolePanel />
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
                  <AIChatPanel onClose={() => setShowAIChat(false)} />
                </div>
              </ResizablePanel>
            </>
          )}

        </ResizablePanelGroup>
      </div>
    </div>
  )
}
