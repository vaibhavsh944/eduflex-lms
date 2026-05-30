import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RunCodeButton } from './RunCodeButton'
import { TestResultsPanel } from './TestResultsPanel'
import { CODE_LANGUAGES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface TestResult {
  name: string
  passed: boolean
  input?: string
  expected?: string
  actual?: string
}

interface CodeLesson {
  problemStatement?: string
  language?: string
  code?: string
  testCases?: Array<{ input: string; expected: string; weight: number }>
}

interface CodeLessonPlayerProps {
  lesson: CodeLesson
}

export function CodeLessonPlayer({ lesson }: CodeLessonPlayerProps) {
  const [language, setLanguage] = useState(lesson?.language || 'javascript')
  const [code, setCode] = useState(lesson?.code || '')
  const [results, setResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleRun = useCallback(async () => {
    setIsLoading(true)
    setResults([])

    try {
      const response = await fetch('/api/code/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code,
          testCases: lesson?.testCases || [],
        }),
      })

      if (!response.ok) throw new Error('Execution failed')

      const data = await response.json()
      setResults(data.results || [])
    } catch {
      setResults([
        {
          name: 'Execution Error',
          passed: false,
          expected: 'Code execution',
          actual: 'Failed to run code. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [language, code, lesson])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      <div className="space-y-4 overflow-auto">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Problem</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {lesson?.problemStatement || 'No problem description.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <TestResultsPanel results={results} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {CODE_LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <RunCodeButton onClick={handleRun} isLoading={isLoading} />
        </div>

        <div
          className={cn(
            'flex-1 border rounded-lg overflow-hidden',
            'min-h-[400px]',
          )}
        >
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>
    </div>
  )
}
