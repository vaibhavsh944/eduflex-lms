import React, { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useQuestionBank, useQuestionBankTopics } from '@/hooks/queries/useQuestionBank'
import { useUpsertQuestionBankItem, useDeleteQuestionBankItem } from '@/hooks/mutations/useQuestionBank'
import { QuestionEditDrawer } from '@/components/quiz/QuestionEditDrawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SkeletonPage } from '@/components/common/SkeletonPage'
import { ErrorState } from '@/components/common/ErrorState'
import { toast } from 'sonner'
import { Search, Plus, Edit2, Copy, Trash2, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react'
import type { QuestionBankItem } from '@/lib/types'

export default function QuestionBankPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { data: questions, isLoading, error } = useQuestionBank(courseId)
  const { data: topics } = useQuestionBankTopics(courseId)
  const upsertMutation = useUpsertQuestionBankItem(courseId!)
  const deleteMutation = useDeleteQuestionBankItem(courseId!)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [topicFilter, setTopicFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<string>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<QuestionBankItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<QuestionBankItem | null>(null)
  const [newTopicName, setNewTopicName] = useState('')
  const [showAddTopic, setShowAddTopic] = useState(false)
  const [collapsedTopics, setCollapsedTopics] = useState<Set<string>>(new Set())

  const perPage = 25

  const topicCounts = useMemo(() => {
    if (!questions) return {}
    const counts: Record<string, number> = {}
    questions.forEach(q => { counts[q.topic] = (counts[q.topic] || 0) + 1 })
    return counts
  }, [questions])

  const filtered = useMemo(() => {
    if (!questions) return []
    return questions.filter(q => {
      if (search && !q.body.toLowerCase().includes(search.toLowerCase())) return false
      if (typeFilter !== 'all' && q.question_type !== typeFilter) return false
      if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false
      if (topicFilter !== 'all' && q.topic !== topicFilter) return false
      return true
    }).sort((a, b) => {
      let cmp = 0
      if (sortField === 'topic') cmp = a.topic.localeCompare(b.topic)
      else if (sortField === 'question_type') cmp = a.question_type.localeCompare(b.question_type)
      else if (sortField === 'difficulty') cmp = a.difficulty.localeCompare(b.difficulty)
      else if (sortField === 'usage_count') cmp = a.usage_count - b.usage_count
      else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [questions, search, typeFilter, difficultyFilter, topicFilter, sortField, sortDir])

  const paginated = filtered.slice(page * perPage, (page + 1) * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const handleSave = (data: any) => {
    upsertMutation.mutate(data, {
      onSuccess: () => {
        toast.success(editingItem ? 'Question updated' : 'Question created')
        setDrawerOpen(false)
        setEditingItem(null)
      },
      onError: (err) => toast.error(err.message)
    })
  }

  const handleEdit = (item: QuestionBankItem) => {
    setEditingItem(item)
    setDrawerOpen(true)
  }

  const handleDuplicate = (item: QuestionBankItem) => {
    upsertMutation.mutate({
      topic: item.topic,
      body: item.body,
      question_type: item.question_type,
      options: item.options,
      correct_answer: item.correct_answer,
      difficulty: item.difficulty,
      points: item.points,
      explanation: item.explanation || '',
    }, {
      onSuccess: () => toast.success('Question duplicated'),
      onError: (err) => toast.error(err.message)
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate({ id: deleteTarget.id }, {
      onSuccess: () => {
        toast.success('Question deleted')
        setDeleteTarget(null)
      },
      onError: (err) => toast.error(err.message)
    })
  }

  const handleAddTopic = () => {
    if (newTopicName.trim()) {
      setTopicFilter(newTopicName.trim())
      setNewTopicName('')
      setShowAddTopic(false)
    }
  }

  const toggleTopic = (topic: string) => {
    const next = new Set(collapsedTopics)
    if (next.has(topic)) next.delete(topic)
    else next.add(topic)
    setCollapsedTopics(next)
  }

  if (isLoading) return <SkeletonPage />
  if (error) return <ErrorState title="Failed to load question bank" message={error.message} />

  return (
    <div className="flex gap-0 h-[calc(100vh-4rem)]">
      {/* Left panel: Topic tree */}
      <div className="w-60 shrink-0 border-r bg-muted/20 p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Topics</h3>
        <div className="space-y-0.5">
          <button
            onClick={() => setTopicFilter('all')}
            className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 ${topicFilter === 'all' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
          >
            <FolderOpen className="w-4 h-4" />
            All Questions
            <span className="ml-auto text-xs text-muted-foreground">{questions?.length || 0}</span>
          </button>
          {(topics || []).map(topic => (
            <div key={topic}>
              <button
                onClick={() => {
                  toggleTopic(topic)
                  setTopicFilter(topic)
                }}
                className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 ${topicFilter === topic ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
              >
                {collapsedTopics.has(topic) ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {topic}
                <span className="ml-auto text-xs text-muted-foreground">{topicCounts[topic] || 0}</span>
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4">
          {showAddTopic ? (
            <div className="flex gap-1">
              <Input
                placeholder="Topic name"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTopic() }}
                className="h-8 text-xs"
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={() => setShowAddTopic(false)}>X</Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setShowAddTopic(true)}>
              <Plus className="w-3 h-3 mr-1" /> Add Topic
            </Button>
          )}
        </div>
      </div>

      {/* Right panel: Question table */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                className="pl-8"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => { if (v) { setTypeFilter(v); setPage(0) } }}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="mcq">MCQ</SelectItem>
                <SelectItem value="true_false">True/False</SelectItem>
                <SelectItem value="short_answer">Short Answer</SelectItem>
                <SelectItem value="fill_blank">Fill Blank</SelectItem>
                <SelectItem value="drag_match">Drag Match</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={(v) => { if (v) { setDifficultyFilter(v); setPage(0) } }}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Difficulty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => { setEditingItem(null); setDrawerOpen(true) }}>
              <Plus className="w-4 h-4 mr-1" /> New Question
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('topic')}>
                  Topic {sortField === 'topic' && (sortDir === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Question</TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('question_type')}>
                  Type {sortField === 'question_type' && (sortDir === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('difficulty')}>
                  Difficulty {sortField === 'difficulty' && (sortDir === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('usage_count')}>
                  Usage {sortField === 'usage_count' && (sortDir === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((q, idx) => (
                <TableRow key={q.id}>
                  <TableCell className="text-muted-foreground">{page * perPage + idx + 1}</TableCell>
                  <TableCell><span className="text-xs px-1.5 py-0.5 rounded bg-secondary">{q.topic}</span></TableCell>
                  <TableCell className="max-w-xs truncate">{q.body}</TableCell>
                  <TableCell><span className="text-xs capitalize">{q.question_type.replace('_', ' ')}</span></TableCell>
                  <TableCell>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      q.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      q.difficulty === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>{q.difficulty}</span>
                  </TableCell>
                  <TableCell><span className="text-xs text-muted-foreground">{q.usage_count}</span></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(q)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDuplicate(q)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        disabled={q.usage_count > 0}
                        onClick={() => setDeleteTarget(q)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No questions found. Create your first question!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <span className="text-sm text-muted-foreground">
              Showing {page * perPage + 1}-{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Question Edit Drawer */}
      <QuestionEditDrawer
        open={drawerOpen}
        onOpenChange={(open) => { setDrawerOpen(open); if (!open) setEditingItem(null) }}
        onSave={handleSave}
        topics={topics || []}
        editingItem={editingItem}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
