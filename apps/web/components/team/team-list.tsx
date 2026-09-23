import Link from 'next/link'

import { Badge } from '@/components/ui/badge'

import type { TeamMember } from '@/lib/crm/team/types'

type TeamListProps = {
  members: TeamMember[]
  selectedMemberId?: string
}

export function TeamList({
  members,
  selectedMemberId,
}: TeamListProps) {
  if (members.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-10 text-center">
        <h3 className="font-medium">
          No team members found
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Try changing the filters or add a new
          team member.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="hidden border-b px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[2fr_1.2fr_1fr_1fr_80px] md:gap-4">
        <div>Name</div>
        <div>Contact</div>
        <div>Role</div>
        <div>Status</div>
        <div />
      </div>

      <div className="divide-y">
        {members.map((member) => {
          const selected =
            selectedMemberId ===
            member.id

          return (
            <Link
              key={member.id}
              href={`/dashboard/team?member=${member.id}`}
              className={[
                'block px-5 py-4 transition-colors hover:bg-muted/50',
                selected
                  ? 'bg-muted/50'
                  : '',
              ].join(' ')}
            >
              <div className="grid gap-3 md:grid-cols-[2fr_1.2fr_1fr_1fr_80px] md:items-center md:gap-4">
                <div>
                  <p className="font-medium">
                    {member.full_name}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground md:hidden">
                    {member.email ??
                      member.phone ??
                      'No contact details'}
                  </p>
                </div>

                <div className="hidden text-sm text-muted-foreground md:block">
                  <p>
                    {member.email ??
                      'No email'}
                  </p>

                  <p className="mt-1">
                    {member.phone ??
                      'No phone'}
                  </p>
                </div>

                <div className="capitalize text-sm">
                  {member.role.replaceAll(
                    '_',
                    ' ',
                  )}
                </div>

                <div>
                  <Badge
                    variant={
                      member.is_active
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {member.is_active
                      ? 'Active'
                      : 'Inactive'}
                  </Badge>
                </div>

                <div className="text-sm font-medium">
                  View
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}