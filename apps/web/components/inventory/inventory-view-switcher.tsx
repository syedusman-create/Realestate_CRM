'use client'

import {
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation'

type ViewMode = 'table' | 'matrix'

type Props = {
  currentView: ViewMode
}

export function InventoryViewSwitcher({
  currentView,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function changeView(view: ViewMode) {
    const params = new URLSearchParams(
      searchParams.toString(),
    )

    params.set('view', view)

    router.push(
      `${pathname}?${params.toString()}`,
    )
  }

  return (
    <div className="inline-flex rounded-md border bg-card p-1">
      <button
        type="button"
        onClick={() => changeView('table')}
        className={`rounded px-3 py-1.5 text-sm ${
          currentView === 'table'
            ? 'bg-muted font-medium'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Table
      </button>

      <button
        type="button"
        onClick={() => changeView('matrix')}
        className={`rounded px-3 py-1.5 text-sm ${
          currentView === 'matrix'
            ? 'bg-muted font-medium'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Matrix
      </button>
    </div>
  )
}