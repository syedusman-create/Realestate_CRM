'use client'

import { useActionState } from 'react'
import { ensureDefaultSequence, runDueAutomation } from './actions'

type State = { ok: boolean; message: string }
const initial: State = { ok: true, message: '' }

export default function FollowUpAutomationControls() {
  const [sequenceState, sequenceAction, sequencePending] = useActionState(ensureDefaultSequence, initial)
  const [automationState, automationAction, automationPending] = useActionState(runDueAutomation, initial)
  const state = automationState.message ? automationState : sequenceState

  return <>
    <div className="actions-inline" style={{ marginTop: 12 }}>
      <form action={sequenceAction}>
        <button className="button" type="submit" disabled={sequencePending}>
          {sequencePending ? 'Creating…' : 'Create default sequence'}
        </button>
      </form>
      <form action={automationAction}>
        <button className="button secondary" type="submit" disabled={automationPending}>
          {automationPending ? 'Running…' : 'Run due automation now'}
        </button>
      </form>
    </div>
    {state.message ? <p className={state.ok ? 'muted small' : 'error-text'} style={{ marginTop: 10 }}>{state.message}</p> : null}
  </>
}
