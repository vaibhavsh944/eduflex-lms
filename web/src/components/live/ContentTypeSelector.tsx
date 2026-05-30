import { cn } from '@/lib/utils'
import { CONTENT_TYPES } from '@/lib/constants'
import { FileText, Video, Code, Sigma, PackageOpen, Puzzle, Link } from 'lucide-react'

const typeIcons: Record<string, React.ReactNode> = {
  text: <FileText className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  code: <Code className="w-4 h-4" />,
  math: <Sigma className="w-4 h-4" />,
  scorm: <PackageOpen className="w-4 h-4" />,
  h5p: <Puzzle className="w-4 h-4" />,
  embed: <Link className="w-4 h-4" />,
}

const typeLabels: Record<string, string> = {
  text: 'Text',
  video: 'Video',
  code: 'Code',
  math: 'Math',
  scorm: 'SCORM',
  h5p: 'H5P',
  embed: 'Embed',
}

interface ContentTypeSelectorProps {
  value: string
  onChange: (type: string) => void
}

export function ContentTypeSelector({ value, onChange }: ContentTypeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CONTENT_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors border',
            value === type
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground',
          )}
        >
          {typeIcons[type]}
          {typeLabels[type]}
        </button>
      ))}
    </div>
  )
}
