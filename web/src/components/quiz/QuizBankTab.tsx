import React, { useState } from 'react'
import { useQuestionBank } from '@/hooks/queries/useQuestionBank'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Search, Plus, RotateCcw } from 'lucide-react'

interface QuizBankTabProps {
  courseId: string
  onAddQuestions: (questionIds: string[]) => void
  onPickRandom: (topic: string, count: number) => void
}

export function QuizBankTab({ courseId, onAddQuestions, onPickRandom }: QuizBankTabProps) {
  const { data: questions } = useQuestionBank(courseId)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [randomTopic, setRandomTopic] = useState('')
  const [randomCount, setRandomCount] = useState(5)

  const topics = questions ? [...new Set(questions.map(q => q.topic))].sort() : []

  const filtered = (questions || []).filter(q => {
    if (search && !q.body.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== 'all' && q.question_type !== typeFilter) return false
    if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false
    return true
  })

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleAddSelected = () => {
    if (selectedIds.size > 0) {
      onAddQuestions(Array.from(selectedIds))
      setSelectedIds(new Set())
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="mcq">MCQ</SelectItem>
            <SelectItem value="true_false">True/False</SelectItem>
            <SelectItem value="short_answer">Short Answer</SelectItem>
            <SelectItem value="fill_blank">Fill Blank</SelectItem>
            <SelectItem value="drag_match">Drag Match</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={(v) => v && setDifficultyFilter(v)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Random pick */}
      <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30">
        <RotateCcw className="w-4 h-4 text-muted-foreground" />
        <Select value={randomTopic} onValueChange={(v) => v && setRandomTopic(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Pick topic" />
          </SelectTrigger>
          <SelectContent>
            {topics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input
          type="number"
          min={1}
          max={50}
          value={randomCount}
          onChange={(e) => setRandomCount(Number(e.target.value))}
          className="w-20"
        />
        <span className="text-xs text-muted-foreground">random from topic</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!randomTopic}
          onClick={() => onPickRandom(randomTopic, randomCount)}
        >
          <Plus className="w-4 h-4 mr-1" /> Add Random
        </Button>
      </div>

      {/* Question list */}
      <div className="max-h-96 overflow-y-auto border rounded-lg divide-y">
        {filtered.map((q) => (
          <div key={q.id} className="flex items-start gap-3 p-3 hover:bg-muted/50">
            <Checkbox
              checked={selectedIds.has(q.id)}
              onCheckedChange={() => toggleSelect(q.id)}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{q.body}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-1.5 py-0.5 rounded bg-secondary">{q.question_type.replace('_', ' ')}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  q.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>{q.difficulty}</span>
                <span className="text-xs text-muted-foreground">{q.points} pts</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="p-4 text-center text-sm text-muted-foreground">No questions found</p>
        )}
      </div>

      {selectedIds.size > 0 && (
        <Button onClick={handleAddSelected} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add {selectedIds.size} selected question{selectedIds.size > 1 ? 's' : ''}
        </Button>
      )}
    </div>
  )
}
