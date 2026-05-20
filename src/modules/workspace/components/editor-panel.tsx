'use client'

import { useState } from 'react'
import { Settings, HelpCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const defaultCode = `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    
    return [];
};`

export function EditorPanel({ onShowAI }: { onShowAI: () => void }) {
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState(defaultCode)

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'typescript', label: 'TypeScript' },
  ]

  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-40 h-9">
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

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Settings"
          >
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

      {/* Code Editor */}
      <div className="flex-1 overflow-hidden flex">
        {/* Line Numbers */}
        <div className="flex flex-col bg-muted text-muted-foreground text-xs font-mono select-none pt-4 px-2 border-r border-border">
          {code.split('\n').map((_, i) => (
            <div key={i} className="leading-6 h-6 text-right">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Area */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 bg-background text-foreground font-mono text-xs p-4 resize-none focus:outline-none border-none overflow-y-auto"
          spellCheck="false"
          style={{
            lineHeight: '1.5',
            tabSize: 2,
          }}
        />
      </div>
    </div>
  )
}
