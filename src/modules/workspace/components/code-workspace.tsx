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
import { AIChatPanel } from "@/modules/ai/components/ai-chat-panel";

export function CodeWorkspace() {
  const [showAIChat, setShowAIChat] = useState(false)

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">Two Sum</h1>
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            Easy
          </span>
        </div>
        <button
          onClick={() => setShowAIChat(!showAIChat)}
          className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
        >
          {showAIChat ? 'Close AI' : 'Ask AI'}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel - Problem Description */}
          <ResizablePanel defaultSize={40} minSize={30}>
            <ProblemPanel />
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel - Code Editor and Console */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <ResizablePanelGroup direction="vertical">
              {/* Code Editor */}
              <ResizablePanel defaultSize={70} minSize={40}>
                <EditorPanel onShowAI={() => setShowAIChat(true)} />
              </ResizablePanel>

              <ResizableHandle />

              {/* Console / Test Cases */}
              <ResizablePanel defaultSize={30} minSize={20}>
                <ConsolePanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* AI Chat Panel - Right Side */}
          {showAIChat && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={25} minSize={20}>
                <AIChatPanel onClose={() => setShowAIChat(false)} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
