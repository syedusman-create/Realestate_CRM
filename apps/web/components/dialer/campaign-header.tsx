import Link from 'next/link'

import {
  campaignStatusLabel,
  dialerModeLabel,
  type DialerCampaign,
} from '@/lib/crm/dialer/types'

type CampaignHeaderProps = {
  campaign: DialerCampaign | null
}

export function CampaignHeader({
  campaign,
}: CampaignHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Dialer operations
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Campaign Management
        </h1>

        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Configure outbound campaigns, manage their lead queues,
          and control campaign lifecycle.
        </p>

        {campaign && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border px-2.5 py-1">
              {campaignStatusLabel(
                campaign.status as never,
              )}
            </span>

            <span className="rounded-full border px-2.5 py-1">
              {dialerModeLabel(
                campaign.dialing_mode as never,
              )}
            </span>
          </div>
        )}
      </div>

      <Link
        href="/dashboard/dialer?create=1"
        className="bg-brand-gold mt-4 inline-flex rounded-md px-4 py-2 text-sm font-medium text-brand-navy shadow-sm hover:bg-brand-gold-dark"
      >
        New campaign
      </Link>
    </div>
  )
}