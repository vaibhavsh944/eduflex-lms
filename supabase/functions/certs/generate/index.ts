import { serve } from 'https://deno.land/std@0.210.0/http/server.ts'
import { createSupabaseAdmin } from '../../_shared/supabase.ts'
import { handleCors, jsonResponse, errorResponse } from '../../_shared/cors.ts'
import { jsPDF } from 'npm:jspdf@2.5.1'

function generateCertificatePDF(params: {
  studentName: string
  courseName: string
  instructorName: string
  issuedAt: string
  certificateId: string
}): Uint8Array {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const W = 297
  const H = 210

  const INDIGO: [number, number, number] = [79, 70, 229]

  doc.setDrawColor(...INDIGO)
  doc.setLineWidth(1.5)
  doc.rect(8, 8, W - 16, H - 16)
  doc.setLineWidth(0.5)
  doc.rect(11, 11, W - 22, H - 22)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(30, 30, 30)
  doc.text('CERTIFICATE OF COMPLETION', W / 2, 45, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(100, 100, 100)
  doc.text('This certifies that', W / 2, 65, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(36)
  doc.setTextColor(...INDIGO)
  doc.text(params.studentName, W / 2, 90, { align: 'center' })

  const nameWidth = doc.getTextWidth(params.studentName)
  doc.setDrawColor(...INDIGO)
  doc.setLineWidth(0.8)
  doc.line((W - nameWidth) / 2, 93, (W + nameWidth) / 2, 93)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(100, 100, 100)
  doc.text('has successfully completed the course', W / 2, 110, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(30, 30, 30)
  doc.text(params.courseName, W / 2, 128, { align: 'center', maxWidth: 200 })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.text(`Issued on: ${params.issuedAt}`, 40, 170)
  doc.text(`Instructor: ${params.instructorName}`, 40, 180)

  doc.setDrawColor(150, 150, 150)
  doc.setLineWidth(0.3)
  doc.line(W - 100, 175, W - 30, 175)
  doc.setFontSize(9)
  doc.text('Instructor Signature', W - 100, 180)

  doc.setFontSize(10)
  doc.setTextColor(...INDIGO)
  doc.text('EduFlow', W - 35, 195)
  doc.text('eduflow.com', W - 45, 200)

  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text(`Certificate ID: ${params.certificateId}`, 20, 200)

  return doc.output('arraybuffer') as unknown as Uint8Array
}

serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const { user_id, course_id } = await req.json()
    if (!user_id || !course_id) {
      return errorResponse('user_id and course_id are required')
    }

    const supabase = createSupabaseAdmin()

    const { data: course } = await supabase
      .from('courses')
      .select('title, instructor_id')
      .eq('id', course_id)
      .single()

    if (!course) return errorResponse('Course not found', 404)

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user_id)
      .single()

    if (!profile) return errorResponse('User not found', 404)

    let instructorName = 'Instructor'
    if (course.instructor_id) {
      const { data: instructor } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', course.instructor_id)
        .single()
      if (instructor) instructorName = instructor.full_name
    }

    const { data: existing } = await supabase
      .from('certificates')
      .select('id, pdf_url, verification_code')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .maybeSingle()

    if (existing) {
      return jsonResponse({
        certificate_id: existing.id,
        pdf_url: existing.pdf_url,
        verification_code: existing.verification_code,
        existing: true,
      })
    }

    const verificationCode = crypto.randomUUID().slice(0, 8).toUpperCase()
    const issuedAt = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

    const pdfBytes = generateCertificatePDF({
      studentName: profile.full_name,
      courseName: course.title,
      instructorName,
      issuedAt,
      certificateId: verificationCode,
    })

    const filePath = `${user_id}/${course_id}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(filePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) return errorResponse('Failed to upload certificate: ' + uploadError.message, 500)

    const { data: { publicUrl } } = supabase.storage.from('certificates').getPublicUrl(filePath)

    const { data: certRecord, error: insertError } = await supabase
      .from('certificates')
      .insert({
        user_id,
        course_id,
        pdf_url: publicUrl,
        verification_code: verificationCode,
      })
      .select('id')
      .single()

    if (insertError) return errorResponse('Failed to save certificate record', 500)

    await supabase.from('certificate_queue')
      .delete()
      .eq('user_id', user_id)
      .eq('course_id', course_id)

    await supabase.from('user_points_log').insert({
      user_id,
      points: 100,
      reason: 'course_complete',
      reference_id: course_id,
    })

    await supabase.from('notifications').insert({
      user_id,
      type: 'certificate_issued',
      title: 'Certificate Ready!',
      body: `You earned a certificate for completing ${course.title}`,
      data: { certificate_id: certRecord?.id, course_id, pdf_url: publicUrl },
    })

    return jsonResponse({
      certificate_id: certRecord?.id,
      pdf_url: publicUrl,
      verification_code: verificationCode,
    })
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
