'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { WorkspaceProblem } from '@/modules/workspace/types/workspace-problem'

type Message = { role: 'user' | 'assistant'; content: string }

const MAX_DESCRIPTION_SUMMARY_LENGTH = 2000

interface AIChatPanelProps {
  onClose: () => void
  problem: WorkspaceProblem | null
  code: string
  language: string
}

function isAbortError(err: unknown) {
  return err instanceof DOMException
    ? err.name === 'AbortError'
    : err instanceof Error && err.name === 'AbortError'
}

function getProblemContext(problem: WorkspaceProblem | null) {
  if (!problem) {
    return null
  }

  const descriptionSummary = problem.description
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_DESCRIPTION_SUMMARY_LENGTH)

  return {
    title: problem.title,
    slug: problem.slug,
    difficulty: problem.difficulty,
    descriptionSummary,
  }
}

export function AIChatPanel({ onClose, problem, code, language }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your coding assistant. I can help you understand the problem, suggest optimizations, or explain concepts. Type 'hint', 'complexity', 'error', or 'explain' to get started!",
    },
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  // Scroll to bottom after each message update
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  const abortActiveRequest = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      abortActiveRequest()
    }
  }, [abortActiveRequest])

  const handleClose = useCallback(() => {
    abortActiveRequest()
    onClose()
  }, [abortActiveRequest, onClose])

  const handleSendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || isStreaming) return

    abortActiveRequest()
    const controller = new AbortController()
    abortControllerRef.current = controller

    const userMessage: Message = { role: 'user', content: text }
    const nextMessages = [...messages, userMessage]

    // Optimistically add user message + empty assistant placeholder
    setMessages([...nextMessages, { role: 'assistant', content: '' }])
    setInput('')
    setIsStreaming(true)

    try {
      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          problem: getProblemContext(problem),
          code,
          language,
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Sorry, something went wrong. Please try again.'
        try {
          const errorData = await response.json()
          if (errorData && typeof errorData === 'object' && 'message' in errorData) {
            errorMessage = String(errorData.message)
          }
        } catch {
          // ignore JSON parse error
        }
        throw new Error(errorMessage)
      }

      if (!response.body) {
        throw new Error('Response body is empty.')
      }

      reader = response.body.getReader()
      const decoder = new TextDecoder()

      // Stream tokens into the last assistant message
      while (true) {
        if (controller.signal.aborted) break

        const { done, value } = await reader.read()
        if (done) break
        if (controller.signal.aborted) break

        const chunk = decoder.decode(value, { stream: true })

        if (!isMountedRef.current) break

        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              content: last.content + chunk,
            }
          }
          return updated
        })
      }

      if (controller.signal.aborted) {
        await reader.cancel().catch(() => undefined)
      }
    } catch (err) {
      if (isAbortError(err) || controller.signal.aborted) {
        return
      }

      // Replace placeholder with error message
      const errMsg = err instanceof Error ? err.message : 'Sorry, something went wrong. Please try again.'
      if (isMountedRef.current) {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: errMsg,
          }
          return updated
        })
      }
      console.error('[AIChatPanel] streaming error:', err)
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null
        if (isMountedRef.current) {
          setIsStreaming(false)
        }
      }
    }
  }, [input, isStreaming, messages, code, language, problem, abortActiveRequest])

  return (
    /* min-h-0 is required so flex children don't overflow the ResizablePanel */
    <div className="h-full flex flex-col min-h-0 bg-card border-l border-border">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <h3 className="font-semibold text-sm text-foreground">AI Assistant</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {message.content}
              {/* Blinking cursor while this is the last assistant message being streamed */}
              {isStreaming &&
                idx === messages.length - 1 &&
                message.role === 'assistant' && (
                  <span className="inline-block w-1 h-3.5 ml-0.5 bg-current animate-pulse align-text-bottom" />
                )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border p-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // Send on Enter (not Shift+Enter)
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder="Ask a question…"
            className="flex-1 h-9 text-sm"
            disabled={isStreaming}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isStreaming}
            size="sm"
            className="h-9 w-9 p-0 bg-primary hover:bg-primary/90 shrink-0"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
