'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  UserPlus,
} from 'lucide-react'

import { Input } from '@/components/ui/input'
import {
  createLead,
  type LeadCreateUser,
} from '@/lib/crm/leads/create-actions'

type LeadCreateFormProps = {
  currentUserId: string
  canAssign: boolean
  users: LeadCreateUser[]
}

type FormState = {
  ok: boolean
  message: string
}

const initialState: FormState = {
  ok: false,
  message: '',
}

export function LeadCreateForm({
  currentUserId,
  canAssign,
  users,
}: LeadCreateFormProps) {
  const [state, formAction, pending] = useActionState(
    async (
      previousState: FormState,
      formData: FormData,
    ): Promise<FormState> => {
      return createLead(previousState, formData)
    },
    initialState,
  )

  return (
    <form action={formAction} className="space-y-8">
      {state.message ? (
        <div
          className={[
            'rounded-xl border px-4 py-3 text-sm',
            state.ok
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-destructive/20 bg-destructive/5 text-destructive',
          ].join(' ')}
        >
          {state.message}
        </div>
      ) : null}

      {/* Contact details */}
      <section className="rounded-2xl border border-border/70 bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-5">
          <h2 className="text-base font-semibold text-foreground">
            Contact details
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Add the basic information for the new lead.
          </p>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <Field label="First name">
            <Input
              name="first_name"
              placeholder="e.g. Rahul"
              autoComplete="given-name"
            />
          </Field>

          <Field label="Last name">
            <Input
              name="last_name"
              placeholder="e.g. Sharma"
              autoComplete="family-name"
            />
          </Field>

          <Field
            label="Display name"
            hint="Leave blank to generate it from first and last name."
          >
            <Input
              name="display_name"
              placeholder="e.g. Rahul Sharma"
              autoComplete="name"
            />
          </Field>

          <Field label="Phone">
            <Input
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              autoComplete="tel"
            />
          </Field>

          <Field label="Email">
            <Input
              name="email"
              type="email"
              placeholder="rahul@example.com"
              autoComplete="email"
            />
          </Field>

          <Field label="Preferred language">
            <Input
              name="preferred_language"
              placeholder="e.g. English"
            />
          </Field>

          <Field label="Occupation">
            <Input
              name="occupation"
              placeholder="e.g. Entrepreneur"
            />
          </Field>

          <Field label="Company">
            <Input
              name="company_name"
              placeholder="e.g. Acme Technologies"
            />
          </Field>
        </div>
      </section>

      {/* Qualification */}
      <section className="rounded-2xl border border-border/70 bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-5">
          <h2 className="text-base font-semibold text-foreground">
            Lead qualification
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Set the initial sales priority and temperature.
          </p>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-3">
          <Field label="Priority">
            <select
              name="priority"
              defaultValue="normal"
              className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </Field>

          <Field label="Temperature">
            <select
              name="temperature"
              defaultValue="cold"
              className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
              <option value="cold">Cold</option>
              <option value="warm">Warm</option>
              <option value="hot">Hot</option>
            </select>
          </Field>

          <Field
            label="Lead score"
            hint="Optional score from 0 to 100."
          >
            <Input
              name="lead_score"
              type="number"
              min={0}
              max={100}
              step={1}
              placeholder="e.g. 65"
            />
          </Field>
        </div>
      </section>

      {/* Ownership */}
      <section className="rounded-2xl border border-border/70 bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-5">
          <h2 className="text-base font-semibold text-foreground">
            Ownership
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Choose who should own the lead.
          </p>
        </div>

        <div className="p-6">
          {canAssign ? (
            <Field
              label="Lead owner"
              hint="Only active users in your current workspace are shown."
            >
              <select
                name="assigned_user_id"
                defaultValue={currentUserId}
                className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} — {formatRole(user.role)}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <>
              <input
                type="hidden"
                name="assigned_user_id"
                value={currentUserId}
              />

              <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                <p className="text-sm font-medium text-foreground">
                  Assigned to you
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  New leads created from your account are assigned to
                  you.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Notes */}
      <section className="rounded-2xl border border-border/70 bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-5">
          <h2 className="text-base font-semibold text-foreground">
            Notes
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Capture anything useful for the sales team.
          </p>
        </div>

        <div className="p-6">
          <textarea
            name="notes"
            rows={5}
            placeholder="Add lead notes, source information, preferences, or context..."
            className="w-full resize-y rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/leads"
          className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="mr-2 size-4" />
          Cancel
        </Link>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 min-w-40 items-center justify-center rounded-md bg-action px-4 text-sm font-semibold text-action-foreground shadow-sm transition-colors hover:bg-action-hover disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              <UserPlus className="mr-2 size-4" />
              Create lead
            </>
          )}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>

      {children}

      {hint ? (
        <p className="text-xs leading-5 text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

function formatRole(role: string) {
  return role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}