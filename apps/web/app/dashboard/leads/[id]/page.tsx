import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import LeadCallHistory from '@/components/leads/lead-call-history'
import LeadEditor from '@/components/leads/lead-editor'
import LeadHeader from '@/components/leads/lead-header'
import LeadMetrics from '@/components/leads/lead-metrics'
import LeadNextActions from '@/components/leads/lead-next-actions'
import LeadPropertyMatches from '@/components/leads/lead-property-matches'
import LeadTimeline from '@/components/leads/lead-timeline'
import ShareMatches from '@/components/leads/share-matches'

import {
  refreshRecommendations,
  reassignLead,
  updateLead,
  updateRequirement,
} from './actions'
import { shareMatchedProperties } from './share-actions'

type Params = {
  id: string
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { id } = await params
  const supabase = await createClient()

  /*
   * Load the lead first.
   *
   * RLS remains the security boundary. If the current user cannot
   * access the lead, this query returns no row.
   */
  const {
    data: lead,
    error: leadError,
  } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (leadError || !lead) {
    notFound()
  }

  const [
    personResult,
    phoneResult,
    requirementResult,
    callsResult,
    tasksResult,
    stagesResult,
    activityResult,
    recommendationsResult,
    agentsResult,
    assignedUserResult,
    manageResult,
  ] = await Promise.all([
    supabase
      .from('people')
      .select('*')
      .eq('id', lead.person_id)
      .maybeSingle(),

    supabase
      .from('person_phones')
      .select('*')
      .eq('person_id', lead.person_id)
      .order('is_primary', {
        ascending: false,
      })
      .order('created_at', {
        ascending: true,
      })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('requirements')
      .select('*')
      .eq('lead_id', id)
      .eq('is_active', true)
      .order('created_at', {
        ascending: false,
      })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('calls')
      .select('*')
      .eq('lead_id', id)
      .order('started_at', {
        ascending: false,
      })
      .limit(30),

    supabase
      .from('tasks')
      .select('*')
      .eq('lead_id', id)
      .order('scheduled_at', {
        ascending: true,
      })
      .limit(30),

    lead.pipeline_id
      ? supabase
          .from('pipeline_stages')
          .select('*')
          .eq(
            'pipeline_id',
            lead.pipeline_id,
          )
          .order('display_order', {
            ascending: true,
          })
      : Promise.resolve({
          data: [],
          error: null,
        }),

    supabase
      .from('lead_activity_timeline')
      .select('*')
      .eq('lead_id', id)
      .order('occurred_at', {
        ascending: false,
      })
      .limit(100),

    supabase.rpc(
      'get_property_recommendations',
      {
        p_lead_id: id,
        p_limit: 20,
      },
    ),

    supabase
      .from('users')
      .select('id, full_name, role')
      .eq('is_active', true)
      .order('full_name', {
        ascending: true,
      }),

    lead.assigned_user_id
      ? supabase
          .from('users')
          .select('id, full_name, role')
          .eq(
            'id',
            lead.assigned_user_id,
          )
          .maybeSingle()
      : Promise.resolve({
          data: null,
          error: null,
        }),

    supabase.rpc(
      'crm_can_manage_tenant',
    ),
  ])

  if (
    personResult.error ||
    !personResult.data
  ) {
    notFound()
  }

  if (phoneResult.error) {
    throw new Error(
      phoneResult.error.message,
    )
  }

  if (requirementResult.error) {
    throw new Error(
      requirementResult.error.message,
    )
  }

  if (callsResult.error) {
    throw new Error(
      callsResult.error.message,
    )
  }

  if (tasksResult.error) {
    throw new Error(
      tasksResult.error.message,
    )
  }

  if (stagesResult.error) {
    throw new Error(
      stagesResult.error.message,
    )
  }

  if (activityResult.error) {
    throw new Error(
      activityResult.error.message,
    )
  }

  if (recommendationsResult.error) {
    throw new Error(
      recommendationsResult.error.message,
    )
  }

  if (agentsResult.error) {
    throw new Error(
      agentsResult.error.message,
    )
  }

  if (assignedUserResult.error) {
    throw new Error(
      assignedUserResult.error.message,
    )
  }

  if (manageResult.error) {
    throw new Error(
      manageResult.error.message,
    )
  }

  const person = personResult.data
  const primaryPhone =
    phoneResult.data ?? null

  const requirement =
    requirementResult.data ?? null

  const calls =
    callsResult.data ?? []

  const tasks =
    tasksResult.data ?? []

  const stages =
    stagesResult.data ?? []

  const activities =
    activityResult.data ?? []

  const recommendations =
    recommendationsResult.data ?? []

  const agents =
    agentsResult.data ?? []

  const assignedUser =
    assignedUserResult.data ?? null

  const canManage =
    manageResult.data === true

  const currentStage =
    stages.find(
      (stage) =>
        stage.id === lead.status_id,
    ) ?? null

  return (
    <div className="space-y-6">
      <LeadHeader
        name={person.display_name}
        phone={
          primaryPhone?.phone_number ??
          null
        }
        email={null}
        temperature={lead.temperature}
        priority={lead.priority}
        stage={currentStage?.name ?? null}
        owner={
          assignedUser?.full_name ??
          null
        }
      />

      <LeadMetrics
        score={lead.lead_score}
        calls={calls.length}
        lastContact={
          lead.last_contact_at
        }
        nextFollowup={
          lead.next_followup_at
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
        <div className="space-y-6">
          <LeadEditor
            lead={lead}
            requirement={requirement}
            stages={stages}
            agents={agents}
            canManage={canManage}
            updateLead={updateLead}
            updateRequirement={
              updateRequirement
            }
            reassignLead={reassignLead}
          />

          <LeadPropertyMatches
            matches={recommendations}
          />

          <LeadCallHistory
            calls={calls}
          />

          <LeadTimeline
            activities={activities}
          />
        </div>

        <div className="space-y-6">
          <LeadNextActions
            tasks={tasks}
          />

          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold">
                  Recommendations
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Refresh property matches using the current requirement.
                </p>
              </div>

              <form
                action={async () => {
                  'use server'

                  await refreshRecommendations(
                    id,
                  )
                }}
              >
                <button
                  type="submit"
                  className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  Refresh
                </button>
              </form>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 font-semibold">
              Share properties
            </h2>

            <ShareMatches
              leadId={id}
              phone={
                primaryPhone?.normalized_phone ??
                null
              }
              matches={recommendations}
              action={
                shareMatchedProperties
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}