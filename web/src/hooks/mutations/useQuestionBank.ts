import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useUpsertQuestionBankItem(courseId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      id?: string
      topic: string
      body: string
      question_type: string
      options?: any
      correct_answer?: any
      difficulty: string
      points: number
      explanation?: string
    }) => {
      const payload = { ...data, course_id: courseId }
      if (payload.id) {
        const { error } = await supabase
          .from('question_bank')
          .update(payload)
          .eq('id', payload.id)
        if (error) throw error
        return payload
      } else {
        const { data: inserted, error } = await supabase
          .from('question_bank')
          .insert([payload])
          .select()
          .single()
        if (error) throw error
        return inserted
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank', courseId] })
      queryClient.invalidateQueries({ queryKey: ['question-bank-topics', courseId] })
    }
  })
}

export function useDeleteQuestionBankItem(courseId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('question_bank')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank', courseId] })
    }
  })
}

export function useUpsertCompetencyRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      lesson_id: string
      required_quiz_id: string
      min_score: number
    }) => {
      const { error } = await supabase
        .from('competency_requirements')
        .upsert([data], { onConflict: 'lesson_id,required_quiz_id' })
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['competency-requirements'] })
    }
  })
}

export function useDeleteCompetencyRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('competency_requirements')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competency-requirements'] })
    }
  })
}
