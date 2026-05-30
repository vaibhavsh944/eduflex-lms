interface Props {
  updaterName: string
  onViewOther: () => void
  onKeepMine: () => void
}

export function CollabNotesConflictToast({ updaterName, onViewOther, onKeepMine }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm">
        ⚠️ {updaterName} just edited the class notes. Your unsaved changes may be overwritten.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onViewOther}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          View their version
        </button>
        <button
          onClick={onKeepMine}
          className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/90"
        >
          Keep my version
        </button>
      </div>
    </div>
  )
}
