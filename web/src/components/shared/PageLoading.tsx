import { Loader2 } from 'lucide-react'

export function PageLoading() {
  return (
    <main role="main" className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" aria-hidden="true" />
        <h1 className="sr-only">EduFlow LMS</h1>
        <p className="text-sm text-muted-foreground" role="status">Loading...</p>
      </div>
    </main>
  )
}
