'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import {
  ArrowLeft,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toggleTeamMemberStatus } from '@/lib/crm/team/actions'
import type { TeamActionState, TeamMember } from '@/lib/crm/team/types'

type TeamMemberDetailProps = {
  member: TeamMember
}

const initialActionState: TeamActionState = {
  ok: false,
  message: '',
}

function formatRole(role: string) {
  return role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatDate(value: string | null) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

const backLinkClassName =
  'inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-input bg-background text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'

export function TeamMemberDetail({
  member,
}: TeamMemberDetailProps) {
  const [statusState, statusAction, isPending] = useActionState(
    toggleTeamMemberStatus,
    initialActionState,
  )

  const isActive = member.is_active !== false

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/team"
            aria-label="Back to team"
            className={backLinkClassName}
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Team member
            </p>

            <h1 className="text-2xl font-bold tracking-tight">
              {member.full_name}
            </h1>
          </div>
        </div>

        <Badge
          variant={isActive ? 'default' : 'secondary'}
          className="w-fit"
        >
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {statusState.message ? (
        <div
          className={[
            'rounded-lg border px-4 py-3 text-sm',
            statusState.ok
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-destructive/30 bg-destructive/5 text-destructive',
          ].join(' ')}
        >
          {statusState.message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRound className="size-7" />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">
                  {member.full_name}
                </h2>

                <p className="text-sm text-muted-foreground">
                  {formatRole(member.role)}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email
                </p>

                {member.email ? (
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-2 text-sm font-medium hover:underline"
                  >
                    <Mail className="size-4 shrink-0 text-muted-foreground" />
                    <span className="break-all">{member.email}</span>
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Not provided
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Phone
                </p>

                {member.phone ? (
                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center gap-2 text-sm font-medium hover:underline"
                  >
                    <Phone className="size-4 shrink-0 text-muted-foreground" />
                    <span>{member.phone}</span>
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Not provided
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Role
                </p>

                <div className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="size-4 text-muted-foreground" />
                  <span>{formatRole(member.role)}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Joined
                </p>

                <p className="text-sm">
                  {formatDate(member.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account status</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {isActive
                      ? 'Active account'
                      : 'Inactive account'}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {isActive
                      ? 'This team member can access the workspace according to their role.'
                      : 'This team member is currently inactive.'}
                  </p>
                </div>

                <Badge
                  variant={isActive ? 'default' : 'secondary'}
                  className="shrink-0"
                >
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <form action={statusAction}>
              <input
                type="hidden"
                name="member_id"
                value={member.id}
              />

              <input
                type="hidden"
                name="is_active"
                value={String(!isActive)}
              />

              <Button
                type="submit"
                variant={isActive ? 'outline' : 'default'}
                className="w-full"
                disabled={isPending}
              >
                {isPending
                  ? 'Updating...'
                  : isActive
                    ? 'Deactivate member'
                    : 'Activate member'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TeamMemberDetail