import { ContentTypeSelector } from '@/components/live/ContentTypeSelector'
import { CodeLessonEditor } from '@/components/live/CodeLessonEditor'
import { MathLessonEditor } from '@/components/live/MathLessonEditor'
import { ScormUploader } from '@/components/live/ScormUploader'
import { ScormPlayer } from '@/components/live/ScormPlayer'
import { H5PPlayer } from '@/components/live/H5PPlayer'
import { EmbedPlayer } from '@/components/live/EmbedPlayer'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface CodeLessonData {
  problemStatement: string
  language: string
  code: string
  testCases: Array<{ id: string; input: string; expected: string; weight: number }>
}

interface MathLessonData {
  content: string
  mathBlocks: Array<{ id: string; latex: string }>
}

interface LessonEditorExtensionsValue {
  contentType: string
  contentUrl: string
  codeData?: CodeLessonData
  mathData?: MathLessonData
}

interface LessonEditorExtensionsProps {
  value: LessonEditorExtensionsValue
  onChange: (value: LessonEditorExtensionsValue) => void
}

export function LessonEditorExtensions({ value, onChange }: LessonEditorExtensionsProps) {
  const handleContentTypeChange = (type: string) => {
    onChange({ ...value, contentType: type, contentUrl: '' })
  }

  const handleCodeChange = (codeData: CodeLessonData) => {
    onChange({ ...value, codeData })
  }

  const handleMathChange = (mathData: MathLessonData) => {
    onChange({ ...value, mathData })
  }

  const handleUpload = async (file: File): Promise<void> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch('/api/upload/scorm', {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) throw new Error('Upload failed')
    const data = await response.json()
    onChange({ ...value, contentUrl: data.url })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Content Type</label>
        <ContentTypeSelector
          value={value?.contentType || 'text'}
          onChange={handleContentTypeChange}
        />
      </div>

      {value?.contentType === 'code' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Code Lesson</label>
          <CodeLessonEditor
            value={
              value?.codeData || {
                problemStatement: '',
                language: 'javascript',
                code: '',
                testCases: [],
              }
            }
            onChange={handleCodeChange}
          />
        </div>
      )}

      {value?.contentType === 'math' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Math Lesson</label>
          <MathLessonEditor
            value={
              value?.mathData || {
                content: '',
                mathBlocks: [],
              }
            }
            onChange={handleMathChange}
          />
        </div>
      )}

      {value?.contentType === 'scorm' && (
        <div className="space-y-4">
          {value?.contentUrl ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">SCORM Preview</label>
              <Card>
                <CardContent className="p-4">
                  <ScormPlayer url={value.contentUrl} />
                </CardContent>
              </Card>
              <Input
                placeholder="SCORM URL"
                value={value.contentUrl}
                onChange={(e) => onChange({ ...value, contentUrl: e.target.value })}
                className="text-xs"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload SCORM Package</label>
              <ScormUploader onUpload={handleUpload} />
            </div>
          )}
        </div>
      )}

      {value?.contentType === 'h5p' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">H5P URL</label>
          <Input
            placeholder="https://example.com/h5p-content"
            value={value?.contentUrl || ''}
            onChange={(e) => onChange({ ...value, contentUrl: e.target.value })}
          />
          {value?.contentUrl && (
            <div className="mt-2">
              <label className="text-sm font-medium mb-1 block">Preview</label>
              <H5PPlayer url={value.contentUrl} />
            </div>
          )}
        </div>
      )}

      {value?.contentType === 'embed' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Embed URL</label>
          <Input
            placeholder="https://www.youtube.com/watch?v=..."
            value={value?.contentUrl || ''}
            onChange={(e) => onChange({ ...value, contentUrl: e.target.value })}
          />
          {value?.contentUrl && (
            <div className="mt-2">
              <label className="text-sm font-medium mb-1 block">Preview</label>
              <EmbedPlayer url={value.contentUrl} />
            </div>
          )}
        </div>
      )}

      {value?.contentType === 'video' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Video URL</label>
          <Input
            placeholder="https://example.com/video.mp4 or YouTube/Vimeo URL"
            value={value?.contentUrl || ''}
            onChange={(e) => onChange({ ...value, contentUrl: e.target.value })}
          />
        </div>
      )}

      {value?.contentType === 'text' && (
        <p className="text-xs text-muted-foreground">
          Use the main content editor to write text content.
        </p>
      )}
    </div>
  )
}
