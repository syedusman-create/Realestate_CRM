'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

type Props = { value: 'table' | 'matrix' }

export function InventoryViewSwitcher({ value }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setView(view: 'table' | 'matrix') {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', view)
    router.push(\`/dashboard/inventory?\${params.toString()}\`)
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
      <Button type="button" size="sm" variant={value === 'table' ? 'default' : 'ghost'} onClick={() => setView('table')}>
        Table
      </Button>
      <Button type="button" size="sm" variant={value === 'matrix' ? 'default' : 'ghost'} onClick={() => setView('matrix')}>
        Floor matrix
      </Button>
    </div>
  )
}
