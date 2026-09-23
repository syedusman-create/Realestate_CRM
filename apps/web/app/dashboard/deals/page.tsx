import { createClient } from '../../../lib/supabase/server'
import type {
  DealPipelineRow,
  DealMetrics,
  DealStage,
  DealStatus,
} from '../../../lib/crm/deals/types'
import { DealHeader } from '@/components/deals/deal-header'
import { DealFilters } from '@/components/deals/deal-filters'
import { DealMetrics as DealMetricsView } from '@/components/deals/deal-metrics'
import { DealList } from '@/components/deals/deal-list'
import { DealStageBoard } from '@/components/deals/deal-stage-board'

const statuses = [
  'all',
  'open',
  'won',
  'lost',
  'paused',
] as const

type SearchParams = {
  q?: string
  status?: string
}

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  const queryText =
    typeof params.q === 'string'
      ? params.q.trim()
      : ''

  const status = statuses.includes(
    params.status as (typeof statuses)[number],
  )
    ? params.status!
    : 'all'

  const supabase = await createClient()

  const { data: claims } =
    await supabase.auth.getClaims()

  if (!claims?.claims.sub) {
    return (
      <main className="page">
        <div className="notice">
          Please sign in to view the sales pipeline.
        </div>
      </main>
    )
  }

  const db = supabase as any

  let query = db
    .from('deal_pipeline')
    .select('*')
    .order('updated_at', {
      ascending: false,
    })
    .limit(200)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  if (queryText) {
    query = query.or(
      `deal_name.ilike.%${queryText}%,person_name.ilike.%${queryText}%`,
    )
  }

  const [
    { data: deals, error },
    { data: stages },
  ] = await Promise.all([
    query as Promise<{
      data: DealPipelineRow[] | null
      error: { message: string } | null
    }>,

    db
      .from('pipeline_stages')
      .select('*')
      .order('display_order', {
        ascending: true,
      }) as Promise<{
      data: DealStage[] | null
      error: { message: string } | null
    }>,
  ])

  const rows = deals ?? []

  const metrics: DealMetrics = {
    total: rows.length,

    open: rows.filter(
      (deal) => deal.status === 'open',
    ).length,

    won: rows.filter(
      (deal) => deal.status === 'won',
    ).length,

    lost: rows.filter(
      (deal) => deal.status === 'lost',
    ).length,

    paused: rows.filter(
      (deal) => deal.status === 'paused',
    ).length,

    openValue: rows
      .filter(
        (deal) => deal.status === 'open',
      )
      .reduce(
        (sum, deal) =>
          sum + Number(deal.deal_value ?? 0),
        0,
      ),

    weightedValue: rows
      .filter(
        (deal) => deal.status === 'open',
      )
      .reduce((sum, deal) => {
        const probability =
          Number(
            deal.probability ??
              deal.stage_probability ??
              0,
          ) / 100

        return (
          sum +
          Number(deal.deal_value ?? 0) *
            probability
        )
      }, 0),

    wonValue: rows
      .filter(
        (deal) => deal.status === 'won',
      )
      .reduce(
        (sum, deal) =>
          sum + Number(deal.deal_value ?? 0),
        0,
      ),
  }

  const visibleStages =
    (stages ?? []).filter(
      (stage) =>
        stage.stage_type !==
        'closed_lost',
    )

  return (
    <main className="page">
      <DealHeader
        query={queryText}
        status={status}
      />

      {error ? (
        <div className="notice error">
          Unable to load opportunities:{' '}
          {error.message}
        </div>
      ) : null}

      <DealMetricsView
        metrics={metrics}
      />

      <DealFilters />

      <DealStageBoard
        stages={visibleStages}
        deals={rows}
      />

      <DealList deals={rows} />
    </main>
  )
}