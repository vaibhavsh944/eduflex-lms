import katex from 'katex'
import 'katex/dist/katex.min.css'

interface KaTeXRendererProps {
  latex: string
  displayMode?: boolean
}

export function KaTeXRenderer({ latex, displayMode = false }: KaTeXRendererProps) {
  try {
    const html = katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      errorColor: '#ef4444',
    })
    return (
      <span
        dangerouslySetInnerHTML={{ __html: html }}
        className={displayMode ? 'block text-center my-4' : 'inline'}
      />
    )
  } catch {
    return <span className="text-destructive italic">{latex}</span>
  }
}
