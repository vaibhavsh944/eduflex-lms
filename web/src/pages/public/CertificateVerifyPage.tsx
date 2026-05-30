import { useParams } from 'react-router-dom'
import { CertificateVerify } from '@/components/gamification/CertificateVerify'
import { ShieldCheck } from 'lucide-react'

export function CertificateVerifyPage() {
  const { certificateId } = useParams<{ certificateId: string }>()

  if (!certificateId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">No certificate ID provided.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-20 px-4">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Certificate Verification</h1>
        <p className="text-muted-foreground">Verify the authenticity of an EduFlow certificate.</p>
      </div>
      <CertificateVerify certificateId={certificateId} />
    </div>
  )
}
