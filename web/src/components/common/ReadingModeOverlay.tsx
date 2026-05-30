import React from 'react'
import { useThemeStore } from '@/store/themeStore'
import { Button } from '@/components/ui/button'
import { X, Minus, Plus, Type, AlignLeft } from 'lucide-react'

interface ReadingModeOverlayProps {
  title: string
  content: string
  onClose: () => void
}

export function ReadingModeOverlay({ title, content, onClose }: ReadingModeOverlayProps) {
  const {
    readingFontSize, setReadingFontSize,
    readingLineHeight, setReadingLineHeight,
    readingFontFamily, setReadingFontFamily,
    readingBackground, setReadingBackground,
  } = useThemeStore()

  const bgMap = {
    white: 'bg-white text-black',
    sepia: 'bg-[#f8f0e3] text-[#5b4636]',
    dark: 'bg-[#1a1a1a] text-[#e0e0e0]',
  }

  const fontMap = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-y-auto ${bgMap[readingBackground]}`}
      role="dialog"
      aria-label="Reading mode"
    >
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-center gap-4 p-3 border-b bg-inherit">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setReadingFontSize(Math.max(14, readingFontSize - 2))} aria-label="Decrease font size">
            <Minus className="w-4 h-4" />
          </Button>
          <span className="text-xs w-10 text-center tabular-nums">{readingFontSize}px</span>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setReadingFontSize(Math.min(24, readingFontSize + 2))} aria-label="Increase font size">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <select
          className="h-8 text-xs rounded border bg-transparent px-2"
          value={readingFontFamily}
          onChange={(e) => setReadingFontFamily(e.target.value as any)}
          aria-label="Font family"
        >
          <option value="sans">Sans-serif</option>
          <option value="serif">Serif</option>
          <option value="mono">Monospace</option>
        </select>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setReadingLineHeight(Math.max(1.4, readingLineHeight - 0.2))} aria-label="Decrease line height">
            <AlignLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs w-10 text-center">{readingLineHeight.toFixed(1)}</span>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setReadingLineHeight(Math.min(2.0, readingLineHeight + 0.2))} aria-label="Increase line height">
            <AlignLeft className="w-4 h-4 rotate-180" />
          </Button>
        </div>

        <div className="flex gap-1 ml-4">
          {(['white', 'sepia', 'dark'] as const).map((bg) => (
            <button
              key={bg}
              onClick={() => setReadingBackground(bg)}
              className={`w-6 h-6 rounded-full border-2 ${bg === 'white' ? 'bg-white border-gray-300' : bg === 'sepia' ? 'bg-[#f8f0e3] border-amber-300' : 'bg-[#1a1a1a] border-gray-600'} ${readingBackground === bg ? 'ring-2 ring-primary' : ''}`}
              aria-label={`${bg} background`}
            />
          ))}
        </div>

        <Button variant="ghost" size="sm" className="ml-auto" onClick={onClose} aria-label="Close reading mode">
          <X className="w-4 h-4" /> Exit
        </Button>
      </div>

      {/* Content */}
      <article
        className="mx-auto px-6 py-8"
        style={{
          maxWidth: '70ch',
          fontSize: `${readingFontSize}px`,
          lineHeight: readingLineHeight,
          fontFamily: readingFontFamily === 'serif' ? 'Georgia, serif' : readingFontFamily === 'mono' ? '"JetBrains Mono", monospace' : undefined,
        }}
      >
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      </article>
    </div>
  )
}
