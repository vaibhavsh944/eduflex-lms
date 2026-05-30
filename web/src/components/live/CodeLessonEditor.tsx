import Editor from '@monaco-editor/react'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TestCaseBuilder, type TestCase } from './TestCaseBuilder'
import { CODE_LANGUAGES } from '@/lib/constants'

interface CodeLessonData {
  problemStatement: string
  language: string
  code: string
  testCases: TestCase[]
}

interface CodeLessonEditorProps {
  value: CodeLessonData
  onChange: (value: CodeLessonData) => void
}

export function CodeLessonEditor({ value, onChange }: CodeLessonEditorProps) {
  const handleChange = (field: keyof CodeLessonData, val: unknown) => {
    onChange({ ...value, [field]: val })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Problem Statement</label>
        <Textarea
          placeholder="Describe the coding problem..."
          value={value?.problemStatement || ''}
          onChange={(e) => handleChange('problemStatement', e.target.value)}
          className="min-h-[120px]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Language</label>
        <Select
          value={value?.language || 'javascript'}
          onValueChange={(v) => v && handleChange('language', v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {CODE_LANGUAGES.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Solution Code</label>
        <div className="border rounded-lg overflow-hidden">
          <Editor
            height="320px"
            defaultLanguage={value?.language || 'javascript'}
            language={value?.language || 'javascript'}
            theme="vs-dark"
            value={value?.code || ''}
            onChange={(val) => handleChange('code', val || '')}
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

      <div className="space-y-2">
        <TestCaseBuilder
          testCases={value?.testCases || []}
          onChange={(testCases) => handleChange('testCases', testCases)}
        />
      </div>
    </div>
  )
}
