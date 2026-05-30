import React from 'react'

interface SkipToMainContentProps {
  mainId?: string
}

export function SkipToMainContent({ mainId = 'main-content' }: SkipToMainContentProps) {
  return (
    <a
      href={`#${mainId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:rounded-md focus:shadow-lg"
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  )
}
