'use client'

import {
  useActionState,
  useState,
} from 'react'

import {
  createCampaign,
  updateCampaign,
} from '@/app/dashboard/dialer/admin/actions'

import {
  Button,
} from '@/components/ui/button'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  Input,
} from '@/components/ui/input'

import {
  distributionModeDescription,
  distributionModeLabel,
  type CampaignDistributionMode,
  type CampaignMemberUser,
  type DialerMode,
} from '@/lib/crm/dialer/types'

type Campaign = {
  id: string
  name: string
  description: string | null
  distribution_mode: CampaignDistributionMode
  round_robin_cursor: number
  dialing_mode: DialerMode
  max_attempts: number
  retry_after_minutes: number
  allow_callbacks: boolean
  allow_voicemail: boolean
  member_user_ids: string[]
}

type CampaignEditorProps = {
  campaign?: Campaign
  users: CampaignMemberUser[]
}

type FormState = {
  ok: boolean
  message: string
  id?: string
}

const initialState: FormState = {
  ok: true,
  message: '',
}

export default function CampaignEditor({
  campaign,
  users,
}: CampaignEditorProps) {
  const [
    distributionMode,
    setDistributionMode,
  ] = useState<CampaignDistributionMode>(
    campaign?.distribution_mode ??
      'on_demand',
  )

  const [
    selectedUsers,
    setSelectedUsers,
  ] = useState<Set<string>>(
    new Set(
      campaign?.member_user_ids ??
        [],
    ),
  )

  const [state, formAction, pending] =
    useActionState(
      async (
        _previousState: FormState,
        formData: FormData,
      ): Promise<FormState> => {
        const result = campaign
          ? await updateCampaign(
              formData,
            )
          : await createCampaign(
              formData,
            )

        return {
          ok: result.ok,
          message: result.message,
          id: result.id,
        }
      },
      initialState,
    )

  function toggleUser(
    userId: string,
  ) {
    setSelectedUsers(
      (current) => {
        const next =
          new Set(current)

        if (next.has(userId)) {
          next.delete(userId)
        } else {
          next.add(userId)
        }

        return next
      },
    )
  }

  return (
    <form
      action={formAction}
      className="space-y-6"
    >
      {campaign ? (
        <input
          type="hidden"
          name="campaign_id"
          value={campaign.id}
        />
      ) : null}

      {Array.from(selectedUsers).map(
        (userId) => (
          <input
            key={userId}
            type="hidden"
            name="member_user_id"
            value={userId}
          />
        ),
      )}

      <input
        type="hidden"
        name="distribution_mode"
        value={distributionMode}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            Campaign details
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium"
            >
              Campaign name
            </label>

            <Input
              id="name"
              name="name"
              required
              defaultValue={
                campaign?.name ?? ''
              }
              placeholder="e.g. Bangalore Warm Leads"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              defaultValue={
                campaign?.description ?? ''
              }
              placeholder="Describe the purpose of this campaign..."
              className="min-h-28 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Campaign members
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <p className="text-sm text-muted-foreground">
              Select the users who are allowed to work
              this campaign. A campaign can have multiple
              members.
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => {
                const selected =
                  selectedUsers.has(
                    user.id,
                  )

                return (
                  <label
                    key={user.id}
                    className={[
                      'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                      selected
                        ? 'border-brand-gold bg-brand-gold/10'
                        : 'border-border hover:bg-muted/50',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        toggleUser(
                          user.id,
                        )
                      }
                      className="size-4 shrink-0 accent-[color:var(--brand-gold)]"
                    />

                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {user.full_name}
                      </span>

                      <span className="block text-xs capitalize text-muted-foreground">
                        {user.role}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>

            {!users.length ? (
              <p className="mt-4 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No active users are available in this workspace.
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="distribution_mode_select"
              className="mb-2 block text-sm font-medium"
            >
              Lead distribution
            </label>

            <select
              id="distribution_mode_select"
              value={distributionMode}
              onChange={(event) =>
                setDistributionMode(
                  event.target
                    .value as CampaignDistributionMode,
                )
              }
              className="h-10 w-full rounded-md border border-input bg-card px-3 pr-10 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
              <option
                value="equal_split"
                className="bg-card text-foreground"
              >
                {distributionModeLabel(
                  'equal_split',
                )}
              </option>

              <option
                value="round_robin"
                className="bg-card text-foreground"
              >
                {distributionModeLabel(
                  'round_robin',
                )}
              </option>

              <option
                value="on_demand"
                className="bg-card text-foreground"
              >
                {distributionModeLabel(
                  'on_demand',
                )}
              </option>
            </select>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {distributionModeDescription(
                distributionMode,
              )}
            </p>
          </div>

          <div className="rounded-lg border border-brand-gold/30 bg-brand-gold/5 p-4">
            <p className="text-sm font-medium text-brand-navy">
              {selectedUsers.size} member
              {selectedUsers.size === 1
                ? ''
                : 's'} selected
            </p>

            {distributionMode ===
              'on_demand' ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Leads remain available in the shared
                queue until a member claims one.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Calling options
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="dialing_mode"
                className="mb-2 block text-sm font-medium"
              >
                Dialing mode
              </label>

              <select
                id="dialing_mode"
                name="dialing_mode"
                defaultValue={
                  campaign?.dialing_mode ??
                  'assisted'
                }
                className="h-10 w-full rounded-md border border-input bg-card px-3 pr-10 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              >
                <option value="assisted">
                  Assisted
                </option>

                <option value="preview">
                  Preview
                </option>

                <option value="power">
                  Power
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="max_attempts"
                className="mb-2 block text-sm font-medium"
              >
                Maximum attempts
              </label>

              <Input
                id="max_attempts"
                name="max_attempts"
                type="number"
                min={1}
                max={20}
                defaultValue={
                  campaign?.max_attempts ??
                  3
                }
              />
            </div>

            <div>
              <label
                htmlFor="retry_after_minutes"
                className="mb-2 block text-sm font-medium"
              >
                Retry after minutes
              </label>

              <Input
                id="retry_after_minutes"
                name="retry_after_minutes"
                type="number"
                min={1}
                max={10080}
                defaultValue={
                  campaign?.retry_after_minutes ??
                  60
                }
              />
            </div>
          </div>

          <div>
            <div className="mb-3 text-sm font-medium">
              Calling options
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                <input
                  type="checkbox"
                  name="allow_callbacks"
                  value="true"
                  defaultChecked={
                    campaign?.allow_callbacks ??
                    true
                  }
                  className="size-4 shrink-0 accent-[color:var(--brand-gold)]"
                />

                <span className="text-sm">
                  Allow callback outcomes
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                <input
                  type="checkbox"
                  name="allow_voicemail"
                  value="true"
                  defaultChecked={
                    campaign?.allow_voicemail ??
                    true
                  }
                  className="size-4 shrink-0 accent-[color:var(--brand-gold)]"
                />

                <span className="text-sm">
                  Allow voicemail outcomes
                </span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {state.message ? (
        <p
          className={
            state.ok
              ? 'text-sm text-muted-foreground'
              : 'text-sm text-destructive'
          }
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={
            pending ||
            (distributionMode !==
              'on_demand' &&
              selectedUsers.size === 0)
          }
        >
          {pending
            ? campaign
              ? 'Saving…'
              : 'Creating…'
            : campaign
              ? 'Save campaign'
              : 'Create campaign'}
        </Button>
      </div>
    </form>
  )
}