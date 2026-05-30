import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Certificate } from '@/lib/types'
import { ShieldCheck, ShieldX, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'

interface CertificateVerifyProps {
  certificateId: string
}

export function CertificateVerify({ certificateId }: CertificateVerifyProps) {
  const [data, setData] = useState<Certificate | null>(null)
  const [studentName, setStudentName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const { data: cert, error: certError } = await supabase
          .from('certificates')
          .select('*, course:courses(title, instructor_id)')
          .or(`id.eq.${certificateId},verification_code.eq.${certificateId}`)
          .single()

        if (certError) throw certError
        setData(cert)

        if (cert.user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', cert.user_id)
            .single()

          if (profile) setStudentName(profile.full_name)
        }
      } catch (err) {
        setError('Certificate not found or invalid.')
      } finally {
        setLoading(false)
      }
    }
    fetchCert()
  }, [certificateId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <ShieldX className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Invalid Certificate</h2>
          <p className="text-muted-foreground">This certificate could not be verified. The certificate ID may be incorrect or the certificate does not exist.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-8 text-center">
        <ShieldCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Valid Certificate ✓</h2>
        <div className="space-y-3 mt-6">
          <div>
            <p className="text-sm text-muted-foreground">Issued to</p>
            <p className="text-xl font-semibold">{studentName || 'Student'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Course</p>
            <p className="text-lg font-medium">{(data.course as any)?.title || 'Completed Course'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Issue Date</p>
            <p className="font-medium">{data.issued_at ? format(new Date(data.issued_at), 'MMMM d, yyyy') : '—'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Verification Code</p>
            <p className="text-xs font-mono text-muted-foreground">{data.verification_code || data.id}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
