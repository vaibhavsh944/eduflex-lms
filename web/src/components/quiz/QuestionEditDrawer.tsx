import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuestionBankItem, QuestionBankType, Difficulty } from '@/lib/types'

const questionSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  body: z.string().min(10, 'Question must be at least 10 characters'),
  question_type: z.enum(['mcq', 'true_false', 'short_answer', 'fill_blank', 'drag_match']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  points: z.coerce.number().int().min(1).max(100),
  explanation: z.string().optional(),
})

type QuestionFormValues = z.infer<typeof questionSchema>

interface QuestionEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: any) => void
  topics: string[]
  editingItem?: QuestionBankItem | null
}

export function QuestionEditDrawer({
  open,
  onOpenChange,
  onSave,
  topics,
  editingItem
}: QuestionEditDrawerProps) {
  const [questionType, setQuestionType] = useState<QuestionBankType>('mcq')
  const [mcqOptions, setMcqOptions] = useState<{ text: string; isCorrect: boolean }[]>(
    Array.from({ length: 4 }, () => ({ text: '', isCorrect: false }))
  )
  const [trueFalseCorrect, setTrueFalseCorrect] = useState<'true' | 'false'>('true')
  const [shortAnswerKeywords, setShortAnswerKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [fillBlankSentence, setFillBlankSentence] = useState('')
  const [fillBlankAnswers, setFillBlankAnswers] = useState<string[][]>([])
  const [dragPairs, setDragPairs] = useState<{ item: string; match: string }[]>(
    Array.from({ length: 3 }, () => ({ item: '', match: '' }))
  )
  const [allowMultipleCorrect, setAllowMultipleCorrect] = useState(false)
  const [newTopic, setNewTopic] = useState('')

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema) as any,
    defaultValues: {
      topic: '',
      body: '',
      question_type: 'mcq',
      difficulty: 'medium',
      points: 1,
      explanation: '',
    }
  })

  useEffect(() => {
    if (editingItem) {
      form.reset({
        topic: editingItem.topic,
        body: editingItem.body,
        question_type: editingItem.question_type,
        difficulty: editingItem.difficulty,
        points: editingItem.points,
        explanation: editingItem.explanation || '',
      })
      setQuestionType(editingItem.question_type)
      if (editingItem.options?.mcqOptions) {
        setMcqOptions(editingItem.options.mcqOptions)
      }
      if (editingItem.correct_answer?.trueFalse) {
        setTrueFalseCorrect(editingItem.correct_answer.trueFalse)
      }
      if (editingItem.correct_answer?.keywords) {
        setShortAnswerKeywords(editingItem.correct_answer.keywords)
      }
      if (editingItem.correct_answer?.blanks) {
        setFillBlankAnswers(editingItem.correct_answer.blanks.map((b: any) => b.accepted || []))
      }
      if (editingItem.correct_answer?.sentence) {
        setFillBlankSentence(editingItem.correct_answer.sentence)
      }
      if (editingItem.correct_answer?.pairs) {
        setDragPairs(editingItem.correct_answer.pairs)
      }
    } else {
      form.reset()
      setQuestionType('mcq')
      setMcqOptions(Array.from({ length: 4 }, () => ({ text: '', isCorrect: false })))
      setTrueFalseCorrect('true')
      setShortAnswerKeywords([])
      setKeywordInput('')
      setFillBlankSentence('')
      setFillBlankAnswers([])
      setDragPairs(Array.from({ length: 3 }, () => ({ item: '', match: '' })))
      setAllowMultipleCorrect(false)
    }
  }, [editingItem, open])

  const handleAddOption = () => {
    if (mcqOptions.length < 6) {
      setMcqOptions([...mcqOptions, { text: '', isCorrect: false }])
    }
  }

  const handleRemoveOption = (index: number) => {
    if (mcqOptions.length > 2) {
      setMcqOptions(mcqOptions.filter((_, i) => i !== index))
    }
  }

  const handleMcqOptionChange = (index: number, text: string) => {
    const updated = [...mcqOptions]
    updated[index].text = text
    setMcqOptions(updated)
  }

  const handleCorrectChange = (index: number) => {
    if (allowMultipleCorrect) {
      const updated = [...mcqOptions]
      updated[index].isCorrect = !updated[index].isCorrect
      setMcqOptions(updated)
    } else {
      const updated = mcqOptions.map((opt, i) => ({
        ...opt,
        isCorrect: i === index
      }))
      setMcqOptions(updated)
    }
  }

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !shortAnswerKeywords.includes(keywordInput.trim())) {
      setShortAnswerKeywords([...shortAnswerKeywords, keywordInput.trim()])
      setKeywordInput('')
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setShortAnswerKeywords(shortAnswerKeywords.filter(k => k !== keyword))
  }

  const handleFillBlankChange = (sentence: string) => {
    setFillBlankSentence(sentence)
    const matches = sentence.match(/\{\{blank\}\}/g)
    if (matches) {
      setFillBlankAnswers(Array.from({ length: matches.length }, (_, i) => fillBlankAnswers[i] || []))
    } else {
      setFillBlankAnswers([])
    }
  }

  const handleAddPair = () => {
    setDragPairs([...dragPairs, { item: '', match: '' }])
  }

  const handleRemovePair = (index: number) => {
    if (dragPairs.length > 1) {
      setDragPairs(dragPairs.filter((_, i) => i !== index))
    }
  }

  const handlePairChange = (index: number, field: 'item' | 'match', value: string) => {
    const updated = [...dragPairs]
    updated[index][field] = value
    setDragPairs(updated)
  }

  const buildCorrectAnswer = () => {
    switch (questionType) {
      case 'mcq':
        return mcqOptions.map((o, i) => o.isCorrect ? i : -1).filter(i => i >= 0)
      case 'true_false':
        return trueFalseCorrect
      case 'short_answer':
        return { keywords: shortAnswerKeywords } 
      case 'fill_blank':
        return { sentence: fillBlankSentence, blanks: fillBlankAnswers.map(accepted => ({ accepted })) }
      case 'drag_match':
        return { pairs: dragPairs.filter(p => p.item && p.match) }
      default:
        return null
    }
  }

  const handleSubmit = (formData: QuestionFormValues) => {
    const options = questionType === 'mcq'
      ? { mcqOptions: mcqOptions.map(o => ({ text: o.text, isCorrect: o.isCorrect })) }
      : null

    onSave({
      id: editingItem?.id,
      ...formData,
      question_type: questionType,
      options,
      correct_answer: buildCorrectAnswer(),
      mcqOptions,
      trueFalseCorrect,
      shortAnswerKeywords,
      fillBlankSentence,
      fillBlankAnswers,
      dragPairs,
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editingItem ? 'Edit Question' : 'Create Question'}</SheetTitle>
          <SheetDescription>
            {editingItem ? 'Edit the question details below.' : 'Add a new question to the question bank.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-6">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          if (val === '__new__') return
                          field.onChange(val)
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select topic" />
                        </SelectTrigger>
                        <SelectContent>
                          {topics.map((topic) => (
                            <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                          ))}
                          <SelectItem value="__new__">+ New Topic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  {field.value === '' && newTopic && (
                    <Input
                      placeholder="New topic name"
                      value={newTopic}
                      onChange={(e) => {
                        setNewTopic(e.target.value)
                        field.onChange(e.target.value)
                      }}
                      className="mt-2"
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Body</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your question..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="question_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={questionType}
                      onValueChange={(val) => {
                        setQuestionType(val as QuestionBankType)
                        field.onChange(val)
                      }}
                      className="flex flex-wrap gap-2"
                    >
                      {(['mcq', 'true_false', 'short_answer', 'fill_blank', 'drag_match'] as const).map((type) => (
                        <div key={type} className="flex items-center space-x-1">
                          <RadioGroupItem value={type} id={`type-${type}`} />
                          <Label htmlFor={`type-${type}`} className="text-xs capitalize">
                            {type.replace('_', ' ')}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex gap-2"
                    >
                      {(['easy', 'medium', 'hard'] as const).map((d) => (
                        <div key={d} className="flex items-center space-x-1">
                          <RadioGroupItem value={d} id={`diff-${d}`} />
                          <Label htmlFor={`diff-${d}`} className="text-xs capitalize">{d}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={100} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type-Specific Options */}
            {questionType === 'mcq' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="multi-correct" className="text-xs">Allow multiple correct</Label>
                    <Checkbox
                      id="multi-correct"
                      checked={allowMultipleCorrect}
                      onCheckedChange={(v) => setAllowMultipleCorrect(!!v)}
                    />
                  </div>
                </div>
                {mcqOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <Input
                      placeholder={`Option ${idx + 1}`}
                      value={opt.text}
                      onChange={(e) => handleMcqOptionChange(idx, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant={opt.isCorrect ? "default" : "outline"}
                      size="sm"
                      className="min-w-[80px]"
                      onClick={() => handleCorrectChange(idx)}
                    >
                      {opt.isCorrect ? 'Correct' : 'Wrong'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(idx)}
                      disabled={mcqOptions.length <= 2}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={mcqOptions.length >= 6}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Option
                </Button>
              </div>
            )}

            {questionType === 'true_false' && (
              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <RadioGroup
                  value={trueFalseCorrect}
                  onValueChange={(v) => setTrueFalseCorrect(v as 'true' | 'false')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="tf-true" />
                    <Label htmlFor="tf-true">True</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="tf-false" />
                    <Label htmlFor="tf-false">False</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {questionType === 'short_answer' && (
              <div className="space-y-3">
                <Label>Keywords (for auto-grading)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add keyword..."
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddKeyword() } }}
                  />
                  <Button type="button" variant="outline" onClick={handleAddKeyword}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {shortAnswerKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-xs"
                    >
                      {kw}
                      <button type="button" onClick={() => handleRemoveKeyword(kw)} className="hover:text-destructive">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {questionType === 'fill_blank' && (
              <div className="space-y-3">
                <Label>Sentence (use {'{'}blank{'}'} for gaps)</Label>
                <Textarea
                  placeholder={`The {{blank}} is the capital of France.`}
                  value={fillBlankSentence}
                  onChange={(e) => handleFillBlankChange(e.target.value)}
                />
                {fillBlankAnswers.map((accepted, idx) => (
                  <div key={idx} className="p-3 border rounded-lg">
                    <Label className="text-xs">Blank {idx + 1} accepted answers</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {accepted.map((ans, ai) => (
                        <span key={ai} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary text-xs">
                          {ans}
                          <button type="button" onClick={() => {
                            const updated = [...fillBlankAnswers]
                            updated[idx] = accepted.filter((_, i) => i !== ai)
                            setFillBlankAnswers(updated)
                          }} className="hover:text-destructive">&times;</button>
                        </span>
                      ))}
                      <Input
                        className="w-24 h-7 text-xs"
                        placeholder="Add..."
                        onKeyDown={(e: any) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            const updated = [...fillBlankAnswers]
                            updated[idx] = [...(updated[idx] || []), e.target.value.trim()]
                            setFillBlankAnswers(updated)
                            e.target.value = ''
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {questionType === 'drag_match' && (
              <div className="space-y-3">
                <Label>Items & Matches</Label>
                {dragPairs.map((pair, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="Item"
                      value={pair.item}
                      onChange={(e) => handlePairChange(idx, 'item', e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-muted-foreground">&harr;</span>
                    <Input
                      placeholder="Match"
                      value={pair.match}
                      onChange={(e) => handlePairChange(idx, 'match', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePair(idx)}
                      disabled={dragPairs.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={handleAddPair}>
                  <Plus className="w-4 h-4 mr-1" /> Add Pair
                </Button>
              </div>
            )}

            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Explanation (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explanation shown after submission..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? 'Save Changes' : 'Create Question'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
