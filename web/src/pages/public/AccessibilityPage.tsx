import React from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

export function AccessibilityPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <PageHeader title="Accessibility Statement" description="EduFlow's commitment to WCAG 2.1 AA compliance" />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Our Commitment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            EduFlow is committed to ensuring digital accessibility for all users, including those with
            disabilities. We strive to meet WCAG 2.1 AA standards across all pages and features of our
            learning management system.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Accessibility Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /><span><strong>Keyboard navigation</strong> — All interactive elements are reachable and operable via keyboard. A skip-to-content link is provided on every page.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /><span><strong>Screen reader support</strong> — ARIA labels, roles, and live regions are used throughout the application. All icon-only buttons have descriptive labels.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /><span><strong>Text-to-speech</strong> — Lesson content, forum posts, and announcements can be read aloud using the built-in TTS feature with adjustable speed.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /><span><strong>Reading mode</strong> — Distraction-free overlay with adjustable font size, line height, font family, and background colour (white, sepia, dark).</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /><span><strong>Colourblind palettes</strong> — Three alternative colour schemes (deuteranopia, protanopia, achromatopsia) available in accessibility settings.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /><span><strong>High contrast mode</strong> — Automatically respects OS-level <code>prefers-contrast: more</code> setting.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /><span><strong>Reduced motion</strong> — All animations and transitions are suppressed when <code>prefers-reduced-motion: reduce</code> is active.</span></li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Known Exceptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            The following areas have documented WCAG 2.1 AA exceptions, with justifications:
          </p>
          <ul className="space-y-2 text-sm">
            <li><strong>Third-party embeds:</strong> Google Calendar Picker, Razorpay checkout, and Daily.co video rooms are embedded third-party interfaces. EduFlow cannot control their accessibility. We have selected vendors with strong accessibility track records.</li>
            <li><strong>Real-time collaboration:</strong> The collaborative whiteboard (tldraw) and code editor (Monaco) are complex interactive tools where full WCAG compliance depends on upstream library support.</li>
            <li><strong>Legacy content:</strong> User-uploaded PDF documents and video captions may not meet accessibility standards. Instructors are encouraged to provide accessible alternatives.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report an Issue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            If you encounter an accessibility barrier on EduFlow, please contact our accessibility team
            at <a href="mailto:accessibility@eduflow.com" className="text-primary underline">accessibility@eduflow.com</a>.
            We aim to respond within 2 business days and resolve issues within 2 weeks.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
