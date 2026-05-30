import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle } from 'lucide-react'

interface TestResult {
  name: string
  passed: boolean
  input?: string
  expected?: string
  actual?: string
}

interface TestResultsPanelProps {
  results: TestResult[]
}

export function TestResultsPanel({ results }: TestResultsPanelProps) {
  if (!results || results.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center">
        No test results yet. Run your code to see results.
      </div>
    )
  }

  const passed = results.filter((r) => r.passed).length

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-medium mb-2">
        <span>
          Results: {passed}/{results.length} passed
        </span>
        <span
          className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            passed === results.length
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          )}
        >
          {passed === results.length ? 'All Passed' : 'Some Failed'}
        </span>
      </div>

      {results.map((result, idx) => (
        <div
          key={idx}
          className={cn(
            'rounded-lg border p-3 text-sm',
            result.passed
              ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20'
              : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20',
          )}
        >
          <div className="flex items-center gap-2 font-medium mb-1">
            {result.passed ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{result.name || `Test #${idx + 1}`}</span>
          </div>
          {!result.passed && result.expected !== undefined && (
            <div className="mt-1 space-y-0.5 text-xs font-mono">
              {result.input !== undefined && (
                <div>
                  <span className="text-muted-foreground">Input: </span>
                  <span>{result.input}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Expected: </span>
                <span>{result.expected}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Actual: </span>
                <span>{result.actual}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
