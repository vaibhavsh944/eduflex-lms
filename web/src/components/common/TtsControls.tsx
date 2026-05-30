import React from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, Square, Volume2 } from 'lucide-react'

interface TtsControlsProps {
  speaking: boolean
  paused: boolean
  rate: number
  onPlay: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onRateChange: (rate: number) => void
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2]

export function TtsControls({ speaking, paused, rate, onPlay, onPause, onResume, onStop, onRateChange }: TtsControlsProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50" role="toolbar" aria-label="Text to speech controls">
      {!speaking ? (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onPlay} aria-label="Listen">
          <Play className="w-4 h-4" />
        </Button>
      ) : paused ? (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onResume} aria-label="Resume">
          <Play className="w-4 h-4" />
        </Button>
      ) : (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onPause} aria-label="Pause">
          <Pause className="w-4 h-4" />
        </Button>
      )}
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onStop} aria-label="Stop">
        <Square className="w-4 h-4" />
      </Button>
      <div className="h-4 w-px bg-border mx-1" />
      <Volume2 className="w-3 h-3 text-muted-foreground" />
      <div className="flex gap-1">
        {SPEED_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onRateChange(s)}
            className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
              rate === s ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/20'
            }`}
            aria-label={`Speed ${s}x`}
            aria-pressed={rate === s}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  )
}
