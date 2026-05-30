import React, { useState, useMemo } from 'react';
import { useInstructorSubmissions, useGradeSubmission } from '@/hooks/queries/useInstructor';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Submission } from '@/lib/types';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, CheckCircle, FileText, UploadCloud, Plus, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export function GradebookPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: submissions, isLoading } = useInstructorSubmissions(user?.id);
  const { mutate: gradeSubmission, isPending } = useGradeSubmission();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAdjustAmount, setBulkAdjustAmount] = useState('');

  const gradedSubmissions = (submissions ?? []).filter((s: Submission) => s.status === 'graded');
  const filteredSubmissions = (submissions ?? []).filter((s: Submission) =>
    s.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAllGraded = () => {
    if (selectedIds.length === gradedSubmissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(gradedSubmissions.map((s: Submission) => s.id));
    }
  };

  const handleOpenGrading = (sub: Submission) => {
    setSelectedSubmission(sub);
    setScore(String(sub.grade ?? ''));
    setFeedback(sub.feedback ?? '');
  };

  const handleSubmitGrade = () => {
    if (!selectedSubmission) return;
    const scoreNum = Number(score);
    if (isNaN(scoreNum)) { toast.error('Invalid score'); return; }
    gradeSubmission({ submissionId: selectedSubmission.id, score: scoreNum, feedback });
  };

  const bulkAdjustMutation = useMutation({
    mutationFn: async (adjustment: number) => {
      for (const id of selectedIds) {
        const sub = submissions?.find((s: Submission) => s.id === id);
        if (!sub || sub.grade == null) continue;
        const newScore = Math.max(0, Math.min(100, Number(sub.grade) + adjustment));
        const { error } = await supabase.from('assignment_submissions').update({ score: newScore }).eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(`Adjusted scores for ${selectedIds.length} submissions`);
      setSelectedIds([]);
      setShowBulkDialog(false);
      queryClient.invalidateQueries({ queryKey: ['instructor-submissions'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const assignment = selectedSubmission
    ? (selectedSubmission as any).assignment ?? null
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Gradebook" 
          description="Review and grade student assignment submissions." 
        />
        <div className="flex items-center gap-2">
          <Select>
            <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="All Courses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export CSV</Button>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by student or ID..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); }}
          />
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {gradedSubmissions.length > 0 && (
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={selectedIds.length === gradedSubmissions.length && gradedSubmissions.length > 0}
                    ref={(el: HTMLInputElement | null) => { if (el) el.indeterminate = selectedIds.length > 0 && selectedIds.length < gradedSubmissions.length; }}
                    onChange={selectAllGraded}
                  />
                </TableHead>
              )}
              <TableHead>Student</TableHead>
              <TableHead>Assignment</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="p-6">
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              </TableCell></TableRow>
            ) : filteredSubmissions.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center h-24 text-muted-foreground">No submissions found.</TableCell></TableRow>
            ) : (
              filteredSubmissions.map((sub: Submission) => (
                <TableRow key={sub.id}>
                  {sub.status === 'graded' && (
                    <TableCell>
                      <input
                        type="checkbox"
                        className="accent-primary"
                        checked={selectedIds.includes(sub.id)}
                        onChange={() => { toggleSelect(sub.id); }}
                      />
                    </TableCell>
                  )}
                  {sub.status !== 'graded' && <TableCell />}
                  <TableCell className="font-medium">User {sub.user_id}</TableCell>
                  <TableCell className="text-muted-foreground">{sub.assignment_id}</TableCell>
                  <TableCell>{new Date(sub.submitted_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={sub.status === 'graded' ? 'default' : 'secondary'}>
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{sub.grade !== null ? `${String(sub.grade)}%` : '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => { handleOpenGrading(sub); }}>
                      {sub.status === 'graded' ? 'Review' : 'Grade'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedIds.length > 0 && (
        <div className="sticky bottom-4 z-10 flex items-center justify-center">
          <div className="bg-primary text-primary-foreground rounded-full shadow-lg px-5 py-3 flex items-center gap-4">
            <span className="text-sm font-medium">{String(selectedIds.length)} selected</span>
            <Button size="sm" variant="secondary" onClick={() => { setShowBulkDialog(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Bulk Adjust Score
            </Button>
            <Button size="sm" variant="ghost" className="text-primary-foreground/80 hover:text-primary-foreground" onClick={() => { setSelectedIds([]); }}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Adjust Scores</DialogTitle>
            <DialogDescription>
              Add or subtract points from all {String(selectedIds.length)} selected graded submissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <label className="text-sm font-medium">Adjustment Amount</label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => { setBulkAdjustAmount(prev => String(Number(prev) - 1)); }} disabled={!bulkAdjustAmount}>
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={bulkAdjustAmount}
                 onChange={e => { setBulkAdjustAmount(e.target.value); }}
                placeholder="e.g. 5"
                className="w-24 text-center"
              />
              <Button variant="outline" size="icon" onClick={() => { setBulkAdjustAmount(prev => String((Number(prev) || 0) + 1)); }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Positive adds points, negative subtracts. Clamped to 0-100.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowBulkDialog(false); }}>Cancel</Button>
            <Button
              onClick={() => {
                const amount = parseInt(bulkAdjustAmount, 10);
                if (isNaN(amount)) return;
                bulkAdjustMutation.mutate(amount);
              }}
              disabled={!bulkAdjustAmount || bulkAdjustMutation.isPending}
            >
              {bulkAdjustMutation.isPending ? 'Adjusting...' : 'Apply Adjustment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grading Drawer / Sheet */}
      <Sheet open={!!selectedSubmission} onOpenChange={(open: boolean) => { if (!open) setSelectedSubmission(null); }}>
        <SheetContent className="sm:max-w-xl w-full overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Grade Submission</SheetTitle>
            <SheetDescription>
              Review student work and provide feedback.
            </SheetDescription>
          </SheetHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">Student</span>
                  <span className="font-medium">User {selectedSubmission.user_id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Submitted</span>
                  <span className="font-medium">{new Date(selectedSubmission.submitted_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Submission Content */}
              <Card>
                <CardHeader className="p-4 bg-muted/30 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Text Response
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div 
                    className="prose dark:prose-invert text-sm" 
                    dangerouslySetInnerHTML={{ __html: selectedSubmission.content || '<p className="text-muted-foreground italic">No text provided.</p>' }} 
                  />
                </CardContent>
              </Card>

              {selectedSubmission.file_urls.length > 0 && (
                <Card>
                  <CardHeader className="p-4 bg-muted/30 border-b">
                    <CardTitle className="text-base flex items-center gap-2">
                      <UploadCloud className="w-4 h-4" />
                      Attached Files
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex gap-2 flex-wrap">
                    {selectedSubmission.file_urls.map((url, i) => (
                      <Button key={i} variant="outline" size="sm" className="w-full justify-start" asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <FileText className="w-4 h-4 mr-2" />
                          Attachment {i + 1}
                        </a>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Grading Form */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Evaluation</h3>
                
                {assignment?.rubric && assignment.rubric.length > 0 && (
                  <div className="space-y-3 bg-muted/20 p-4 rounded-lg border text-sm mb-4">
                    <h4 className="font-semibold flex justify-between">
                      <span>Rubric Criteria</span>
                      <span className="text-muted-foreground">Max {assignment.max_score} pts</span>
                    </h4>
                    {assignment.rubric.map((r, i) => (
                      <div key={i} className="flex justify-between items-start border-t pt-2 mt-2">
                        <div>
                          <p className="font-medium">{r.title}</p>
                          <p className="text-xs text-muted-foreground">{r.description}</p>
                        </div>
                        <span className="text-muted-foreground">{r.max_points} pts</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Final Score / Grade</label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 85" 
                    value={score} 
                    onChange={e => { setScore(e.target.value); }} 
                    className="w-32"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Feedback to Student</label>
                  <Textarea 
                    placeholder="Provide constructive feedback..." 
                    value={feedback} 
                    onChange={e => { setFeedback(e.target.value); }} 
                    className="min-h-[120px]"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={handleSubmitGrade} disabled={isPending}>
                    {isPending ? 'Saving...' : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit Grade
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => { setSelectedSubmission(null); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

    </div>
  );
}
