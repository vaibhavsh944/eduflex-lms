import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

interface QuestionInput {
  id: string
  type: 'mcq' | 'true_false' | 'short_answer'
  body: string
  points: number
  explanation?: string
  options?: { text: string; is_correct: boolean }[]
  correct_answer?: boolean
  sample_answer?: string
}

interface SaveQuizInput {
  lessonId: string
  courseId: string
  title: string
  passing_score: number
  max_attempts: number
  randomize_questions: boolean
  time_limit_minutes: number
  questions: QuestionInput[]
}

export function useSaveQuiz() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: SaveQuizInput) => {
      const { lessonId, courseId, questions, ...quizData } = input

      await supabase.from('lessons').update({ content_type: 'quiz' }).eq('id', lessonId)

      const { data: existingQuiz } = await supabase
        .from('quizzes')
        .select('id')
        .eq('lesson_id', lessonId)
        .maybeSingle()

      const quizPayload = {
        lesson_id: lessonId,
        course_id: courseId,
        title: quizData.title,
        pass_score: quizData.passing_score,
        max_attempts: quizData.max_attempts,
        time_limit_secs: quizData.time_limit_minutes > 0 ? quizData.time_limit_minutes * 60 : null,
        randomise_questions: quizData.randomize_questions,
      }

      let quizId: string
      if (existingQuiz) {
        await supabase.from('quizzes').update(quizPayload).eq('id', existingQuiz.id)
        quizId = existingQuiz.id
      } else {
        const { data } = await supabase.from('quizzes').insert(quizPayload).select('id').single()
        quizId = data!.id
      }

      const existingQuestionIds = (await supabase
        .from('quiz_questions')
        .select('id')
        .eq('lesson_id', lessonId)).data ?? []

      if (existingQuestionIds.length > 0) {
        await supabase.from('quiz_options').delete().in('question_id', existingQuestionIds.map(q => q.id))
        await supabase.from('quiz_questions').delete().eq('lesson_id', lessonId)
      }

      if (questions.length > 0) {
        const questionRows = questions.map((q, i) => ({
          lesson_id: lessonId,
          course_id: courseId,
          question: q.body,
          type: q.type,
          points: q.points,
          explanation: q.explanation || null,
          order_index: i,
        }))

        const { data: insertedQuestions } = await supabase
          .from('quiz_questions')
          .insert(questionRows)
          .select('id, order_index')

        if (insertedQuestions && questions.some(q => q.options && q.options.length > 0 || q.type === 'true_false' || q.type === 'short_answer')) {
          const optionRows: any[] = []
          for (const q of questions) {
            const inserted = insertedQuestions.find((iq: any) => iq.order_index === questions.indexOf(q))
            if (!inserted) continue

            if (q.type === 'mcq' && q.options) {
              q.options.forEach((opt, oi) => {
                optionRows.push({
                  question_id: inserted.id,
                  option_text: opt.text,
                  is_correct: opt.is_correct,
                  order_index: oi,
                })
              })
            } else if (q.type === 'true_false') {
              optionRows.push(
                { question_id: inserted.id, option_text: 'True', is_correct: q.correct_answer === true, order_index: 0 },
                { question_id: inserted.id, option_text: 'False', is_correct: q.correct_answer === false, order_index: 1 },
              )
            } else if (q.type === 'short_answer' && q.sample_answer) {
              optionRows.push({
                question_id: inserted.id,
                option_text: q.sample_answer,
                is_correct: true,
                order_index: 0,
              })
            }
          }

          if (optionRows.length > 0) {
            await supabase.from('quiz_options').insert(optionRows)
          }
        }
      }
    },
    onSuccess: (_, input) => {
      qc.invalidateQueries({ queryKey: ['quiz', input.lessonId] })
    },
  })
}
