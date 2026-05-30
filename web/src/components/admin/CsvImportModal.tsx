import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CSVRow {
  name: string;
  email: string;
  role: string;
  password?: string;
}

interface ImportResult {
  success: number;
  errors: { row: number; message: string }[];
}

interface CsvImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (rows: CSVRow[]) => Promise<ImportResult>;
}

export function CsvImportModal({ open, onOpenChange, onImport }: CsvImportModalProps) {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    const required = ['name', 'email', 'role'];
    for (const r of required) {
      if (!headers.includes(r)) throw new Error(`Missing required column: "${r}". Required: name, email, role`);
    }
    return lines.slice(1).map((line, i) => {
      const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
      if (!row.name || !row.email || !row.role) throw new Error(`Row ${String(i + 2)}: name, email, and role are required`);
      if (!['student', 'instructor', 'admin'].includes(row.role.toLowerCase())) {
        throw new Error(`Row ${String(i + 2)}: role must be one of: student, instructor, admin`);
      }
      return { name: row.name, email: row.email, role: row.role.toLowerCase(), password: row.password };
    });
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseCSV(e.target?.result as string);
        setCsvData(rows);
        setResult(null);
      } catch (err) {
        setResult({ success: 0, errors: [{ row: 0, message: (err as Error).message }] });
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await onImport(csvData);
      setResult(res);
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setCsvData([]);
    setResult(null);
    setImporting(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Users from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with columns: name, email, role (student/instructor/admin). Password is optional.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {csvData.length === 0 ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => { setDragOver(false); }}
              onClick={() => { fileInputRef.current?.click(); }}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
                dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              <Upload className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">
                Drop CSV here, or <span className="text-primary">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">.csv files only</p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                    <p className="font-medium">{String(result.success)} users created successfully</p>
                    {result.errors.length > 0 && (
                      <p className="text-sm text-destructive">{String(result.errors.length)} rows had errors</p>
                  )}
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Row</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.errors.map((err, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-sm">{err.row}</TableCell>
                          <TableCell className="text-sm text-destructive">{err.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium">{String(csvData.length)} rows parsed</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { reset(); }}>
                  <X className="h-4 w-4 mr-1" /> Change File
                </Button>
              </div>

              <div className="max-h-[200px] overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 5).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{row.role}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {csvData.length > 5 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                            ...and {String(csvData.length - 5)} more rows
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!result && csvData.length > 0 && (
            <>
              <Button variant="outline" onClick={() => { handleOpenChange(false); }}>Cancel</Button>
              <Button onClick={() => { void handleImport(); }} disabled={importing}>
                {importing ? 'Importing...' : `Import ${String(csvData.length)} Users`}
              </Button>
            </>
          )}
          {result && (
            <Button onClick={() => { handleOpenChange(false); }}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
