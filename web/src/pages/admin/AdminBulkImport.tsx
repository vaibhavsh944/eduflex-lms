import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertCircle, CheckCircle2, Upload, FileText, Loader2, Download } from 'lucide-react'
import { toast } from 'sonner'

interface CSVRow {
  name: string
  email: string
  role: string
  password?: string
  department?: string
}

interface ImportResult {
  success: number
  errors: { row: number; message: string }[]
}

export function AdminBulkImport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [result, setResult] = useState<ImportResult | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter(l => l.trim())
    if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row')
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
    const required = ['name', 'email', 'role']
    for (const r of required) {
      if (!headers.includes(r)) throw new Error(`Missing required column: "${r}". Required: name, email, role`)
    }
    return lines.slice(1).map((line, i) => {
      const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''))
      const row: any = {}
      headers.forEach((h, idx) => { row[h] = values[idx] || '' })
      if (!row.name || !row.email || !row.role) throw new Error(`Row ${i + 2}: name, email, and role are required`)
      if (!['student', 'instructor', 'admin'].includes(row.role.toLowerCase())) {
        throw new Error(`Row ${i + 2}: role must be one of: student, instructor, admin`)
      }
      return { name: row.name, email: row.email, role: row.role.toLowerCase(), password: row.password, department: row.department }
    })
  }

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) { toast.error('Please upload a CSV file'); return }
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const rows = parseCSV(e.target?.result as string)
        setCsvData(rows)
        setResult(null)
        toast.success(`Parsed ${rows.length} users from CSV`)
      } catch (err: any) {
        toast.error(err.message)
        setCsvData([])
      }
    }
    reader.readAsText(file)
  }

  const importMutation = useMutation({
    mutationFn: async () => {
      const results: ImportResult = { success: 0, errors: [] }
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i]
        try {
          const { data, error } = await supabase.functions.invoke('admin-create-user', {
            body: { email: row.email, password: row.password || null, full_name: row.name, role: row.role },
          })
          if (error) throw new Error(error.message || 'Failed to import user')
          results.success++
        } catch (err: any) {
          results.errors.push({ row: i + 2, message: err.message })
        }
      }
      return results
    },
    onSuccess: (results) => {
      setResult(results)
      if (results.errors.length === 0) toast.success(`All ${results.success} users imported successfully`)
      else toast.warning(`${results.success} imported, ${results.errors.length} errors`)
    },
    onError: (err: any) => toast.error(err.message),
  })

  const downloadTemplate = () => {
    const csv = 'name,email,role,password,department\nJohn Doe,john@example.com,student,pass123,Engineering\nJane Smith,jane@example.com,instructor,,Design'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'user-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Bulk Import Users"
        description="Import users from a CSV file"
        actions={
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-1" /> Download Template
          </Button>
        }
      />

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Upload className="w-4 h-4" /> Upload CSV</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file) }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">Drop your CSV file here, or click to browse</p>
            <p className="text-xs text-muted-foreground">CSV must have columns: name, email, role (student/instructor/admin), password (optional)</p>
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) handleFile(file) }} />
          </div>
        </CardContent>
      </Card>

      {csvData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-4 h-4" /> Preview ({csvData.length} rows)
              </CardTitle>
              <Button
                onClick={() => importMutation.mutate()}
                disabled={importMutation.isPending}
              >
                {importMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                {importMutation.isPending ? 'Importing...' : `Import ${csvData.length} Users`}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead>#</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Password</TableHead><TableHead>Department</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {csvData.slice(0, 10).map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="text-sm">{row.name}</TableCell>
                    <TableCell className="text-sm">{row.email}</TableCell>
                    <TableCell><Badge variant="outline">{row.role}</Badge></TableCell>
                    <TableCell className="text-sm">{row.password ? '••••••••' : '—'}</TableCell>
                    <TableCell className="text-sm">{row.department || '—'}</TableCell>
                  </TableRow>
                ))}
                {csvData.length > 10 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground">...and {csvData.length - 10} more rows</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {result.errors.length === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-4">
              <Badge variant="default" className="text-sm px-3 py-1">{result.success} Succeeded</Badge>
              {result.errors.length > 0 && <Badge variant="destructive" className="text-sm px-3 py-1">{result.errors.length} Failed</Badge>}
            </div>
            {result.errors.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-600">Errors:</p>
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-500">Row {e.row}: {e.message}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
