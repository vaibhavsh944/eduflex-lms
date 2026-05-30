import { serve } from 'https://deno.land/std@0.210.0/http/server.ts'
import { createSupabaseAdmin } from '../_shared/supabase.ts'
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { jsPDF } from 'npm:jspdf@2.5.1'

function generateInvoicePDF(params: {
  invoiceNumber: string
  studentName: string
  studentEmail: string
  courseName: string
  amount: number
  currency: string
  paidAt: string
  razorpayPaymentId: string
}): Uint8Array {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const INDIGO: [number, number, number] = [79, 70, 229]

  doc.setFillColor(...INDIGO)
  doc.rect(0, 0, W, 8, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(...INDIGO)
  doc.text('EduFlow', 20, 22)

  doc.setFontSize(18)
  doc.setTextColor(60, 60, 60)
  doc.text('INVOICE', W - 20, 22, { align: 'right' })

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.line(20, 28, W - 20, 28)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('Bill To:', 20, 40)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(30, 30, 30)
  doc.text(params.studentName, 20, 46)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  doc.text(params.studentEmail, 20, 52)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('Invoice #', W - 20, 40, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(30, 30, 30)
  doc.text(params.invoiceNumber, W - 20, 46, { align: 'right' })
  doc.text(`Date: ${params.paidAt}`, W - 20, 52, { align: 'right' })

  const tableTop = 65
  const col1 = 20
  const col2 = 130
  const col3 = W - 20
  const rowH = 8

  doc.setFillColor(245, 247, 250)
  doc.rect(20, tableTop, W - 40, rowH, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  doc.text('Description', col1 + 2, tableTop + 5.5)
  doc.text('Amount', col3 - 2, tableTop + 5.5, { align: 'right' })

  const dataY = tableTop + rowH
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(30, 30, 30)
  doc.text(params.courseName, col1 + 2, dataY + 5)
  doc.text(`${params.currency} ${params.amount.toFixed(2)}`, col3 - 2, dataY + 5, { align: 'right' })

  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(20, dataY + rowH, W - 20, dataY + rowH)

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  const totalY = dataY + rowH + 8
  doc.line(120, totalY, W - 20, totalY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(30, 30, 30)
  doc.text('Total', col2, totalY + 6)
  doc.text(`${params.currency} ${params.amount.toFixed(2)}`, col3 - 2, totalY + 6, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text(`Payment ID: ${params.razorpayPaymentId}`, 20, totalY + 20)
  doc.text('Payment method: Razorpay', 20, totalY + 26)

  doc.setFillColor(...INDIGO)
  doc.rect(0, 285, W, 12, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text('EduFlow LMS — Thank you for your purchase', W / 2, 291, { align: 'center' })
  doc.text('support@eduflow.com', W / 2, 295, { align: 'center' })

  return doc.output('arraybuffer') as unknown as Uint8Array
}

serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const supabaseAdmin = createSupabaseAdmin()

    const { payment_id, user_id, course_title, amount } = await req.json()
    if (!payment_id || !user_id) {
      return errorResponse('payment_id and user_id are required')
    }

    const { data: user } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', user_id)
      .single()

    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const shortId = payment_id.slice(0, 8).toUpperCase()
    const invoiceNumber = `INV-${dateStr}-${shortId}`
    const paidAt = now.toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

    const pdfBytes = generateInvoicePDF({
      invoiceNumber,
      studentName: user?.full_name || 'Valued Student',
      studentEmail: user?.email || '',
      courseName: course_title || 'Course Enrollment',
      amount: Number(amount || 0),
      currency: 'INR',
      paidAt,
      razorpayPaymentId: payment_id,
    })

    const fileName = `invoices/${user_id}/${invoiceNumber}.pdf`
    const { error: uploadError } = await supabaseAdmin.storage
      .from('invoices')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) return errorResponse('Failed to upload invoice: ' + uploadError.message, 500)

    const { data: { publicUrl } } = supabaseAdmin.storage.from('invoices').getPublicUrl(fileName)

    return jsonResponse({
      invoice_number: invoiceNumber,
      invoice_url: publicUrl,
    })
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
