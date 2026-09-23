import {
  removeCampaignLead,
} from '@/app/dashboard/dialer/admin/actions'

import {
  queueStatusLabel,
  type CampaignQueueItem,
} from '@/lib/crm/dialer/types'

type Props = {
  leads: CampaignQueueItem[]
}

export function CampaignQueue({
  leads,
}: Props) {
  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b p-5">
        <h2 className="font-semibold">
          Campaign queue
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Leads currently assigned to this campaign.
        </p>
      </div>

      {!leads.length ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          The campaign queue is empty.
        </div>
      ) : (
        <div className="divide-y">
          {leads.map(
            (item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {item.person_name}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {item.phone_number}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border px-2 py-1">
                      {queueStatusLabel(
                        item.status,
                      )}
                    </span>

                    <span className="rounded-full bg-muted px-2 py-1">
                      Priority{' '}
                      {item.priority}
                    </span>

                    <span className="rounded-full bg-muted px-2 py-1">
                      Attempts{' '}
                      {item.attempt_count}
                    </span>
                  </div>
                </div>

                <div>
                  {item.claimed_by ? (
                    <span className="text-xs text-muted-foreground">
                      Currently claimed
                    </span>
                  ) : (
                    <form
                      action={async () => {
                        'use server'
                        await removeCampaignLead(
                          item.id,
                        )
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
                      >
                        Remove
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </section>
  )
}