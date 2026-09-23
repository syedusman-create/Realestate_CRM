'use client'

import {
  ArrowLeft,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      className={[
        'inline-flex h-9 items-center gap-2 rounded-lg',
        'border border-input bg-background px-3',
        'text-sm font-medium text-foreground shadow-xs',
        'transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      ].join(' ')}
      onClick={() => router.back()}
    >
      <ArrowLeft
        className="size-4"
        aria-hidden="true"
      />

      <span className="hidden sm:inline">
        Back
      </span>
    </button>
  )
}