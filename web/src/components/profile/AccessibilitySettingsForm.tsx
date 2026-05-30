import React from 'react'
import { useThemeStore } from '@/store/themeStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Eye, Volume2, AlignLeft } from 'lucide-react'

const FONT_SIZES = [14, 16, 18, 20, 22, 24]
const LINE_HEIGHTS = [1.2, 1.4, 1.6, 1.8, 2.0]

export function AccessibilitySettingsForm() {
  const {
    colorblindMode, setColorblindMode,
    readingFontSize, setReadingFontSize,
    readingLineHeight, setReadingLineHeight,
    readingFontFamily, setReadingFontFamily,
    readingBackground, setReadingBackground,
  } = useThemeStore()

  const colorblindOptions = [
    { value: 'none', label: 'Default' },
    { value: 'deuteranopia', label: 'Deuteranopia (red-green)' },
    { value: 'protanopia', label: 'Protanopia (red-green)' },
    { value: 'achromatopsia', label: 'Full color blindness' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5" /> Accessibility</CardTitle>
        <CardDescription>Customize your visual and reading experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Eye className="w-4 h-4" /> Colorblind Mode</Label>
          <Select value={colorblindMode} onValueChange={(v: string | null) => v && setColorblindMode(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {colorblindOptions.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3 border-t pt-4">
          <Label className="flex items-center gap-2"><AlignLeft className="w-4 h-4" /> Reading Mode</Label>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Font Size</Label>
            <Select value={String(readingFontSize)} onValueChange={(v: string | null) => v && setReadingFontSize(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map(s => (
                  <SelectItem key={s} value={String(s)}>{s}px</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Line Height</Label>
            <Select value={String(readingLineHeight)} onValueChange={(v: string | null) => v && setReadingLineHeight(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LINE_HEIGHTS.map(h => (
                  <SelectItem key={h} value={String(h)}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Font Family</Label>
            <Select value={readingFontFamily} onValueChange={(v: string | null) => v && setReadingFontFamily(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sans">Sans-serif</SelectItem>
                <SelectItem value="serif">Serif</SelectItem>
                <SelectItem value="mono">Monospace</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Background</Label>
            <Select value={readingBackground} onValueChange={(v: string | null) => v && setReadingBackground(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="white">White</SelectItem>
                <SelectItem value="sepia">Sepia</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
