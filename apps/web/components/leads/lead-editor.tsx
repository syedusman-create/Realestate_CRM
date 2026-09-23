'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import type {
    LeadActionState,
    LeadRow,
    PipelineStageRow,
    Requirement,
} from '@/lib/crm/leads/types'

type Action = (
    state: LeadActionState,
    formData: FormData,
) => Promise<LeadActionState>

type Props = {
    lead: LeadRow
    requirement: Requirement | null
    stages: PipelineStageRow[]
    agents: Array<{
        id: string
        full_name: string
        role: string
    }>
    canManage: boolean
    updateLead: Action
    updateRequirement: Action
    reassignLead: Action
}

const initialState: LeadActionState = {
    ok: true,
    message: '',
}

export default function LeadEditor({
    lead,
    requirement,
    stages,
    agents,
    canManage,
    updateLead,
    updateRequirement,
    reassignLead,
}: Props) {
    const [leadState, leadAction, leadPending] =
        useActionState(updateLead, initialState)

    const [requirementState, requirementAction, requirementPending] =
        useActionState(updateRequirement, initialState)

    const [assignmentState, assignmentAction, assignmentPending] =
        useActionState(reassignLead, initialState)

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Lead details</CardTitle>
                </CardHeader>

                <CardContent>
                    <form
                        action={leadAction}
                        className="grid gap-4 md:grid-cols-2"
                    >
                        <input
                            type="hidden"
                            name="lead_id"
                            value={lead.id}
                        />

                        <label className="space-y-2">
                            <span className="text-sm font-medium">
                                Temperature
                            </span>

                            <select
                                name="temperature"
                                defaultValue={lead.temperature}
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                            >
                                <option value="cold">Cold</option>
                                <option value="warm">Warm</option>
                                <option value="hot">Hot</option>
                            </select>
                        </label>

                        <label className="space-y-2">
                            <span className="text-sm font-medium">
                                Priority
                            </span>

                            <select
                                name="priority"
                                defaultValue={lead.priority}
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                            >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </label>

                        <label className="space-y-2 md:col-span-2">
                            <span className="text-sm font-medium">
                                Pipeline stage
                            </span>

                            <select
                                name="status_id"
                                defaultValue={lead.status_id ?? ''}
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                            >
                                <option value="">New / no stage</option>

                                {stages.map((stage) => (
                                    <option
                                        key={stage.id}
                                        value={stage.id}
                                    >
                                        {stage.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="space-y-2 md:col-span-2">
                            <span className="text-sm font-medium">
                                Notes
                            </span>

                            <textarea
                                name="notes"
                                defaultValue={lead.notes ?? ''}
                                rows={5}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            />
                        </label>

                        <div className="md:col-span-2 flex items-center justify-between gap-4">
                            {leadState.message && (
                                <p
                                    className={
                                        leadState.ok
                                            ? 'text-sm text-muted-foreground'
                                            : 'text-sm text-destructive'
                                    }
                                >
                                    {leadState.message}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={leadPending}
                                className="ml-auto"
                            >
                                {leadPending ? 'Saving…' : 'Save lead'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Buyer requirement</CardTitle>
                </CardHeader>

                <CardContent>
                    <form
                        action={requirementAction}
                        className="grid gap-4 md:grid-cols-2"
                    >
                        <input
                            type="hidden"
                            name="lead_id"
                            value={lead.id}
                        />

                        <label className="space-y-2">
                            <span className="text-sm font-medium">
                                Requirement
                            </span>

                            <select
                                name="requirement_type"
                                defaultValue={requirement?.requirement_type ?? 'buy'}
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                            >
                                <option value="buy">Buy</option>
                                <option value="rent">Rent</option>
                                <option value="resale">Resale</option>
                                <option value="lease">Lease</option>
                            </select>
                        </label>

                        <label className="space-y-2">
                            <span className="text-sm font-medium">
                                Purpose
                            </span>

                            <select
                                name="purpose"
                                defaultValue={requirement?.purpose ?? ''}
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                            >
                                <option value="">Not specified</option>
                                <option value="end_use">End use</option>
                                <option value="investment">Investment</option>
                                <option value="rental_income">Rental income</option>
                                <option value="resale">Resale</option>
                            </select>
                        </label>

                        <InputField
                            label="Minimum budget"
                            name="budget_min"
                            type="number"
                            defaultValue={requirement?.budget_min ?? ''}
                        />

                        <InputField
                            label="Maximum budget"
                            name="budget_max"
                            type="number"
                            defaultValue={requirement?.budget_max ?? ''}
                        />

                        <InputField
                            label="Minimum bedrooms"
                            name="bedrooms_min"
                            type="number"
                            defaultValue={requirement?.bedrooms_min ?? ''}
                        />

                        <InputField
                            label="Maximum bedrooms"
                            name="bedrooms_max"
                            type="number"
                            defaultValue={requirement?.bedrooms_max ?? ''}
                        />

                        <InputField
                            label="Minimum bathrooms"
                            name="bathrooms_min"
                            type="number"
                            defaultValue={requirement?.bathrooms_min ?? ''}
                        />

                        <InputField
                            label="Minimum area (sq ft)"
                            name="area_min_sqft"
                            type="number"
                            defaultValue={requirement?.area_min_sqft ?? ''}
                        />

                        <InputField
                            label="Maximum area (sq ft)"
                            name="area_max_sqft"
                            type="number"
                            defaultValue={requirement?.area_max_sqft ?? ''}
                        />

                        <InputField
                            label="Parking required"
                            name="parking_required"
                            type="number"
                            defaultValue={requirement?.parking_required ?? ''}
                        />

                        <label className="space-y-2">
                            <span className="text-sm font-medium">
                                Furnishing
                            </span>

                            <select
                                name="furnishing"
                                defaultValue={requirement?.furnishing ?? ''}
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                            >
                                <option value="">Not specified</option>
                                <option value="unfurnished">Unfurnished</option>
                                <option value="semi_furnished">
                                    Semi furnished
                                </option>
                                <option value="fully_furnished">
                                    Fully furnished
                                </option>
                            </select>
                        </label>

                        <InputField
                            label="Preferred facing"
                            name="preferred_facing"
                            defaultValue={requirement?.preferred_facing ?? ''}
                        />

                        <InputField
                            label="Possession before"
                            name="possession_before"
                            type="date"
                            defaultValue={requirement?.possession_before ?? ''}
                        />

                        <label className="space-y-2 md:col-span-2">
                            <span className="text-sm font-medium">
                                Requirement notes
                            </span>

                            <textarea
                                name="notes"
                                defaultValue={requirement?.notes ?? ''}
                                rows={4}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            />
                        </label>

                        <div className="md:col-span-2 flex items-center justify-between gap-4">
                            {requirementState.message && (
                                <p
                                    className={
                                        requirementState.ok
                                            ? 'text-sm text-muted-foreground'
                                            : 'text-sm text-destructive'
                                    }
                                >
                                    {requirementState.message}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={requirementPending}
                                className="ml-auto"
                            >
                                {requirementPending
                                    ? 'Saving…'
                                    : 'Save requirement'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {canManage && (
                <Card>
                    <CardHeader>
                        <CardTitle>Assignment</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form
                            action={assignmentAction}
                            className="grid gap-3 md:grid-cols-[minmax(220px,0.8fr)_minmax(280px,1.8fr)_auto]"
                        >
                            <input
                                type="hidden"
                                name="lead_id"
                                value={lead.id}
                            />

                            <select
                                name="assigned_user_id"
                                defaultValue={lead.assigned_user_id ?? ''}
                                className={[
                                    'h-10 min-w-0 w-full',
                                    'rounded-md border border-input',
                                    'bg-card text-foreground',
                                    'px-3 pr-10 text-sm',
                                    'outline-none',
                                    'transition-colors',
                                    'focus:border-ring',
                                    'focus:ring-2 focus:ring-ring/20',
                                ].join(' ')}
                            >
                                <option
                                    value=""
                                    className="bg-card text-foreground"
                                >
                                    Select an active agent
                                </option>

                                {agents.map((agent) => (
                                    <option
                                        key={agent.id}
                                        value={agent.id}
                                        className="bg-card text-foreground"
                                    >
                                        {agent.full_name} — {agent.role}
                                    </option>
                                ))}
                            </select>

                            <Input
                                name="reason"
                                placeholder="Reason (optional)"
                                className="w-full"
                            />

                            <Button
                                type="submit"
                                disabled={assignmentPending}
                            >
                                {assignmentPending
                                    ? 'Assigning…'
                                    : 'Assign'}
                            </Button>
                        </form>

                        {assignmentState.message && (
                            <p
                                className={
                                    assignmentState.ok
                                        ? 'mt-3 text-sm text-muted-foreground'
                                        : 'mt-3 text-sm text-destructive'
                                }
                            >
                                {assignmentState.message}
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

function InputField({
    label,
    name,
    type = 'text',
    defaultValue,
}: {
    label: string
    name: string
    type?: string
    defaultValue: string | number
}) {
    return (
        <label className="space-y-2">
            <span className="text-sm font-medium">
                {label}
            </span>

            <Input
                name={name}
                type={type}
                defaultValue={defaultValue}
                min={type === 'number' ? 0 : undefined}
            />
        </label>
    )
}