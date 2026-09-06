'use client'

import { useTransition } from 'react'
import { completeTask } from './actions'

export default function CompleteTaskButton({ taskId }: { taskId: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      className="button secondary"
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => completeTask(taskId))}
    >
      {pending ? 'Completing…' : 'Complete'}
    </button>
  )
}
