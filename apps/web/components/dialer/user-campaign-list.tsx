import type {
  UserCampaignView,
} from '@/lib/crm/dialer/types'

import UserCampaignCard from './user-campaign-card'

type Props = {
  campaigns: UserCampaignView[]
  activeCampaignId: string | null
}

export default function UserCampaignList({
  campaigns,
  activeCampaignId,
}: Props) {
  if (!campaigns.length) {
    return (
      <section className="rounded-xl border border-dashed p-10 text-center">
        <h2 className="font-semibold">
          No campaigns available
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          There are no running campaigns assigned to you
          right now.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">
          Your campaigns
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Choose a running campaign to start or continue
          your calling session.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {campaigns.map((campaign) => (
          <UserCampaignCard
            key={campaign.id}
            campaign={campaign}
            hasActiveSession={
              campaign.id ===
              activeCampaignId
            }
          />
        ))}
      </div>
    </section>
  )
}