'use client'

import { useActionState } from 'react'
import { saveDealForm } from '@/app/dashboard/deals/actions'
import type {
  DealEditorData,
  DealStatus,
} from '@/lib/crm/deals/types'
import { Input } from '@/components/ui/input'

type DealEditorProps = {
  data: DealEditorData
}

const statuses: DealStatus[] = [
  'open',
  'won',
  'lost',
  'paused',
]

export function DealEditor({
  data,
}: DealEditorProps) {
  const [state, action, pending] = useActionState(
    saveDealForm,
    {
      ok: true,
      message: '',
    },
  )

  return (
    <form
      action={action}
      className="panel form-stack"
    >
      <input
        type="hidden"
        name="deal_id"
        value={data.deal.id}
      />

      <div className="section-title">
        <div>
          <h2>Edit opportunity</h2>

          <span className="muted small">
            Update commercial details, ownership and stage.
          </span>
        </div>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Opportunity name</span>

          <Input
            name="deal_name"
            defaultValue={data.deal.deal_name}
            required
          />
        </label>

        <label className="field">
          <span>Deal value</span>

          <Input
            name="deal_value"
            type="number"
            min="0"
            step="1000"
            defaultValue={
              data.deal.deal_value ?? ''
            }
          />
        </label>

        <label className="field">
          <span>Expected close</span>

          <Input
            name="expected_close_date"
            type="date"
            defaultValue={
              data.deal.expected_close_date ?? ''
            }
          />
        </label>

        <label className="field">
          <span>Probability</span>

          <Input
            name="probability"
            type="number"
            min="0"
            max="100"
            defaultValue={
              data.deal.probability ?? ''
            }
          />
        </label>

        <label className="field">
          <span>Status</span>

          <select
            name="status"
            defaultValue={data.deal.status}
            className="input"
          >
            {statuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Pipeline stage</span>

          <select
            name="stage_id"
            defaultValue={data.deal.stage_id ?? ''}
            className="input"
          >
            <option value="">
              No stage
            </option>

            {data.stages.map((stage) => (
              <option
                key={stage.id}
                value={stage.id}
              >
                {stage.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Owner</span>

          <select
            name="owner_user_id"
            defaultValue={
              data.deal.owner_user_id ?? ''
            }
            className="input"
          >
            <option value="">
              Unassigned
            </option>

            {data.agents.map((agent) => (
              <option
                key={agent.id}
                value={agent.id}
              >
                {agent.full_name}
              </option>
            ))}
          </select>
        </label>

        <label className="field field-wide">
          <span>Lost reason</span>

          <Input
            name="lost_reason"
            defaultValue={
              data.deal.lost_reason ?? ''
            }
            placeholder="Required when marking the deal lost"
          />
        </label>

        <label className="field field-wide">
          <span>Notes</span>

          <textarea
            name="notes"
            defaultValue={data.deal.notes ?? ''}
            className="input textarea"
            rows={5}
          />
        </label>
      </div>

      {state.message ? (
        <div
          className={
            state.ok
              ? 'notice success'
              : 'notice error'
          }
        >
          {state.message}
        </div>
      ) : null}

      <div className="form-actions">
        <button
          type="submit"
          className="button primary"
          disabled={pending}
        >
          {pending
            ? 'Saving…'
            : 'Save opportunity'}
        </button>
      </div>
    </form>
  )
}