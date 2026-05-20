'use client'

import { useRef, useCallback } from 'react'
import { Settings, HelpCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'typescript', label: 'TypeScript' },
]

interface EditorPanelProps {
  /** Current source code — controlled by parent (CodeWorkspace) */
  code: string
  /** Currently selected language — controlled by parent (CodeWorkspace) */
  language: string
  onCodeChange: (code: string) => void
  onLanguageChange: (language: string) => void
  onShowAI: () => void
}

export function EditorPanel({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  onShowAI,
}: EditorPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  // Keep line-number gutter in sync with textarea scroll
  const syncScroll = useCallback(() => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [])

  const lineCount = code.split('\n').length

  return (
    <div className="h-full flex flex-col bg-background min-h-0">

      {/* ── Editor header ── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-border bg-card">
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-40 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Settings">
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onShowAI}
            title="Ask AI"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Code editor body ── */}
      {/*
        flex-1 + min-h-0: fills remaining panel height.
        overflow-hidden on the row so line-numbers + textarea
        scroll together as a unit.
      */}
      <div className="flex-1 min-h-0 overflow-hidden flex font-mono text-xs">

        {/* Line numbers — overflow-hidden, scrolled programmatically */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="
            select-none overflow-hidden shrink-0
            bg-muted text-muted-foreground
            border-r border-border
            pt-4 px-3
          "
          style={{ lineHeight: '1.5rem' }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="h-6 text-right leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          onScroll={syncScroll}
          className="
            flex-1 min-w-0
            bg-background text-foreground
            font-mono text-xs
            p-4 pt-4
            resize-none
            focus:outline-none
            overflow-y-auto overflow-x-auto
          "
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          style={{ lineHeight: '1.5rem', tabSize: 2 }}
        />
      </div>
    </div>
  )
}
