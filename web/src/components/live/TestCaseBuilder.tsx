import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TestCase {
  id: string
  input: string
  expected: string
  weight: number
}

interface TestCaseBuilderProps {
  testCases: TestCase[]
  onChange: (testCases: TestCase[]) => void
}

function SortableTestCaseRow({
  testCase,
  onUpdate,
  onRemove,
}: {
  testCase: TestCase
  onUpdate: (id: string, field: keyof TestCase, value: string | number) => void
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: testCase.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg border bg-card',
        isDragging && 'opacity-50 shadow-lg',
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <Input
        placeholder="Input"
        value={testCase.input}
        onChange={(e) => onUpdate(testCase.id, 'input', e.target.value)}
        className="h-8 flex-1 min-w-0 font-mono text-xs"
      />

      <Input
        placeholder="Expected"
        value={testCase.expected}
        onChange={(e) => onUpdate(testCase.id, 'expected', e.target.value)}
        className="h-8 flex-1 min-w-0 font-mono text-xs"
      />

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-muted-foreground">W:</span>
        <Input
          type="number"
          min={0}
          value={testCase.weight}
          onChange={(e) => onUpdate(testCase.id, 'weight', Number(e.target.value))}
          className="h-8 w-16 text-xs"
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive shrink-0"
        onClick={() => onRemove(testCase.id)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}

export function TestCaseBuilder({ testCases, onChange }: TestCaseBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleAdd = useCallback(() => {
    const newCase: TestCase = {
      id: crypto.randomUUID(),
      input: '',
      expected: '',
      weight: 1,
    }
    onChange([...testCases, newCase])
  }, [testCases, onChange])

  const handleUpdate = useCallback(
    (id: string, field: keyof TestCase, value: string | number) => {
      onChange(
        testCases.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)),
      )
    },
    [testCases, onChange],
  )

  const handleRemove = useCallback(
    (id: string) => {
      onChange(testCases.filter((tc) => tc.id !== id))
    },
    [testCases, onChange],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = testCases.findIndex((tc) => tc.id === active.id)
      const newIndex = testCases.findIndex((tc) => tc.id === over.id)

      if (oldIndex === -1 || newIndex === -1) return

      const reordered = [...testCases]
      const [removed] = reordered.splice(oldIndex, 1)
      reordered.splice(newIndex, 0, removed)
      onChange(reordered)
    },
    [testCases, onChange],
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Test Cases</span>
        <Button variant="outline" size="sm" onClick={handleAdd} type="button">
          <Plus className="w-4 h-4 mr-1" />
          Add Test Case
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={testCases.map((tc) => tc.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {testCases.map((tc) => (
              <SortableTestCaseRow
                key={tc.id}
                testCase={tc}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {testCases.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          No test cases yet. Click &quot;Add Test Case&quot; to create one.
        </p>
      )}
    </div>
  )
}
