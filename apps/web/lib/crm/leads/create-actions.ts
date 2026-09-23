'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { hasPermission } from '@/lib/auth/permissions'
import {
  normalizeCrmRole,
  type CrmRole,
} from '@/lib/auth/roles'
import type {
  LeadPriority,
  LeadTemperature,
  PersonStatus,
} from '@realestate-crm/database'


export type LeadCreateUser = {
  id: string
  fullName: string
  role: string
}

export type CreateLeadActionState = {
  ok: boolean
  message: string
}

type CurrentUser = {
  id: string
  full_name: string
  role: string
  tenant_code: string
  workspace_id: string | null
  is_active: boolean | null
}

function clean(value: FormDataEntryValue | null) {
  const result = String(value ?? '').trim()
  return result.length > 0 ? result : null
}

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, '')
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function getRole(
  role: string | null | undefined,
): CrmRole | null {
  return normalizeCrmRole(role)
}

async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = await createClient()

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims()

  if (claimsError) {
    throw new Error(
      'Unable to authenticate the current user.',
    )
  }

  const userId = claimsData?.claims?.sub

  if (!userId) {
    throw new Error('Authentication is required.')
  }

  const { data: user, error } = await supabase
    .from('users')
    .select(
      'id, full_name, role, tenant_code, workspace_id, is_active',
    )
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(
      'Unable to load the current user.',
    )
  }

  if (!user) {
    throw new Error(
      'Your CRM user profile could not be found.',
    )
  }

  if (user.is_active === false) {
    throw new Error(
      'Your CRM account is inactive.',
    )
  }

  return user as CurrentUser
}

async function getAuthenticatedUserForCreate() {
  const user = await getCurrentUser()
  const role = getRole(user.role)

  if (
    !role ||
    !hasPermission(role, 'leads.create')
  ) {
    throw new Error(
      'You do not have permission to create leads.',
    )
  }

  return {
    user,
    role,
  }
}

async function resolveTenantId(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  tenantCode: string,
) {
  const { data, error } = await supabase
    .from('tenants')
    .select('id')
    .eq('tenant_code', tenantCode)
    .maybeSingle()

  if (error || !data) {
    throw new Error(
      'Unable to resolve the current tenant.',
    )
  }

  return data.id as string
}

async function validateAssignment(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  user: CurrentUser,
  role: CrmRole,
  requestedUserId: string | null,
) {
  /*
   * Existing lead RLS allows agents/brokers to create leads only
   * when the lead is assigned to themselves.
   */
  if (
    role === 'agent' ||
    role === 'broker'
  ) {
    return user.id
  }

  /*
   * Admin/manager can leave assignment blank, in which case
   * the lead belongs to the creator.
   */
  if (!requestedUserId) {
    return user.id
  }

  let query = supabase
    .from('users')
    .select(
      'id, tenant_code, workspace_id, is_active',
    )
    .eq('id', requestedUserId)
    .eq('tenant_code', user.tenant_code)
    .eq('is_active', true)

  if (user.workspace_id) {
    query = query.eq(
      'workspace_id',
      user.workspace_id,
    )
  }

  const {
    data: assignee,
    error,
  } = await query.maybeSingle()

  if (error) {
    throw new Error(
      'Unable to validate the selected lead owner.',
    )
  }

  if (!assignee) {
    throw new Error(
      'The selected lead owner is not available.',
    )
  }

  return assignee.id as string
}

export async function getLeadCreateUsers() {
  try {
    const {
      user,
      role,
    } = await getAuthenticatedUserForCreate()

    const supabase = await createClient()

    /*
     * Agents and brokers do not need an owner selector.
     */
    if (
      role !== 'admin' &&
      role !== 'manager'
    ) {
      return {
        ok: true,
        currentUserId: user.id,
        canAssign: false,
        users: [] as LeadCreateUser[],
      }
    }

    let query = supabase
      .from('users')
      .select(
        'id, full_name, role, is_active, workspace_id',
      )
      .eq('tenant_code', user.tenant_code)
      .eq('is_active', true)
      .order('full_name', {
        ascending: true,
      })

    if (user.workspace_id) {
      query = query.eq(
        'workspace_id',
        user.workspace_id,
      )
    }

    const {
      data,
      error,
    } = await query

    if (error) {
      return {
        ok: false,
        currentUserId: user.id,
        canAssign: false,
        users: [] as LeadCreateUser[],
        message:
          'Unable to load lead owners.',
      }
    }

    const users: LeadCreateUser[] = (
      data ?? []
    ).map((item) => ({
      id: item.id as string,
      fullName: item.full_name as string,
      role: item.role as string,
    }))

    return {
      ok: true,
      currentUserId: user.id,
      canAssign: true,
      users,
    }
  } catch (error) {
    return {
      ok: false,
      currentUserId: null,
      canAssign: false,
      users: [] as LeadCreateUser[],
      message:
        error instanceof Error
          ? error.message
          : 'Unable to load lead owners.',
    }
  }
}

export async function createLead(
  _previousState: CreateLeadActionState,
  formData: FormData,
): Promise<CreateLeadActionState> {
  try {
    const {
      user,
      role,
    } = await getAuthenticatedUserForCreate()

    const supabase = await createClient()

    const firstName = clean(
      formData.get('first_name'),
    )

    const lastName = clean(
      formData.get('last_name'),
    )

    const displayNameInput = clean(
      formData.get('display_name'),
    )

    const phone = clean(
      formData.get('phone'),
    )

    const email = clean(
      formData.get('email'),
    )

    const occupation = clean(
      formData.get('occupation'),
    )

    const companyName = clean(
      formData.get('company_name'),
    )

    const preferredLanguage = clean(
      formData.get('preferred_language'),
    )

    const notes = clean(
      formData.get('notes'),
    )

    const priorityInput =
      clean(formData.get('priority')) ??
      'normal'

    const temperatureInput =
      clean(formData.get('temperature')) ??
      'cold'

    const leadScoreInput = clean(
      formData.get('lead_score'),
    )

    const requestedAssignee = clean(
      formData.get('assigned_user_id'),
    )

    if (
      !firstName &&
      !lastName &&
      !displayNameInput
    ) {
      return {
        ok: false,
        message:
          'Enter at least a first name, last name, or display name.',
      }
    }

    if (!phone && !email) {
      return {
        ok: false,
        message:
          'Enter at least a phone number or email address.',
      }
    }

    const validPriorities: LeadPriority[] = [
      'low',
      'normal',
      'high',
      'urgent',
    ]

    const validTemperatures: LeadTemperature[] = [
      'cold',
      'warm',
      'hot',
    ]

    if (
      !validPriorities.includes(
        priorityInput as LeadPriority,
      )
    ) {
      return {
        ok: false,
        message:
          'Select a valid lead priority.',
      }
    }

    if (
      !validTemperatures.includes(
        temperatureInput as LeadTemperature,
      )
    ) {
      return {
        ok: false,
        message:
          'Select a valid lead temperature.',
      }
    }

    let leadScore: number | null = null

    if (leadScoreInput) {
      const parsedScore =
        Number(leadScoreInput)

      if (
        !Number.isFinite(parsedScore) ||
        parsedScore < 0 ||
        parsedScore > 100
      ) {
        return {
          ok: false,
          message:
            'Lead score must be between 0 and 100.',
        }
      }

      leadScore =
        Math.round(parsedScore)
    }

    const assignedUserId =
      await validateAssignment(
        supabase,
        user,
        role,
        requestedAssignee,
      )

    const displayName =
      displayNameInput ||
      [firstName, lastName]
        .filter(Boolean)
        .join(' ')
        .trim()

    if (!displayName) {
      return {
        ok: false,
        message:
          'Enter a valid lead name.',
      }
    }

    /*
     * Resolve the UUID tenant_id used by people/leads.
     */
    const tenantId =
      await resolveTenantId(
        supabase,
        user.tenant_code,
      )

    /*
     * Try to find an existing person by email.
     */
    let personId: string | null = null

    if (email) {
      const normalizedEmail =
        normalizeEmail(email)

      const {
        data: existingEmail,
        error: emailLookupError,
      } = await supabase
        .from('person_emails')
        .select('person_id')
        .eq(
          'normalized_email',
          normalizedEmail,
        )
        .maybeSingle()

      if (emailLookupError) {
        throw new Error(
          'Unable to check the email address.',
        )
      }

      if (existingEmail?.person_id) {
        const {
          data: existingPerson,
          error: personLookupError,
        } = await supabase
          .from('people')
          .select('id')
          .eq(
            'id',
            existingEmail.person_id,
          )
          .eq(
            'tenant_id',
            tenantId,
          )
          .maybeSingle()

        if (
          !personLookupError &&
          existingPerson?.id
        ) {
          personId =
            existingPerson.id as string
        }
      }
    }

    /*
     * If email didn't identify a person, try phone.
     */
    if (phone && !personId) {
      const normalizedPhone =
        normalizePhone(phone)

      const {
        data: existingPhone,
        error: phoneLookupError,
      } = await supabase
        .from('person_phones')
        .select('person_id')
        .eq(
          'normalized_phone',
          normalizedPhone,
        )
        .maybeSingle()

      if (phoneLookupError) {
        throw new Error(
          'Unable to check the phone number.',
        )
      }

      if (existingPhone?.person_id) {
        const {
          data: existingPerson,
          error: personLookupError,
        } = await supabase
          .from('people')
          .select('id')
          .eq(
            'id',
            existingPhone.person_id,
          )
          .eq(
            'tenant_id',
            tenantId,
          )
          .maybeSingle()

        if (
          !personLookupError &&
          existingPerson?.id
        ) {
          personId =
            existingPerson.id as string
        }
      }
    }

    /*
     * Create a new person when no matching contact exists.
     */
    if (!personId) {
      const personStatus: PersonStatus =
        'active'

      const {
        data: person,
        error: personError,
      } = await supabase
        .from('people')
        .insert({
          tenant_id: tenantId,
          workspace_id:
            user.workspace_id,
          first_name: firstName,
          last_name: lastName,
          display_name: displayName,
          occupation,
          company_name: companyName,
          preferred_language:
            preferredLanguage,
          notes,
          status: personStatus,
        })
        .select('id')
        .single()

      if (personError || !person) {
        throw new Error(
          personError?.message ||
            'Unable to create the lead contact.',
        )
      }

      personId = person.id as string
    } else {
      /*
       * Refresh supplied person information without
       * overwriting fields that weren't supplied.
       */
      const personUpdate: Record<
        string,
        unknown
      > = {}

      if (firstName) {
        personUpdate.first_name =
          firstName
      }

      if (lastName) {
        personUpdate.last_name =
          lastName
      }

      if (displayName) {
        personUpdate.display_name =
          displayName
      }

      if (occupation) {
        personUpdate.occupation =
          occupation
      }

      if (companyName) {
        personUpdate.company_name =
          companyName
      }

      if (preferredLanguage) {
        personUpdate.preferred_language =
          preferredLanguage
      }

      if (notes) {
        personUpdate.notes = notes
      }

      if (
        Object.keys(personUpdate).length > 0
      ) {
        const {
          error: updatePersonError,
        } = await supabase
          .from('people')
          .update(personUpdate)
          .eq('id', personId)
          .eq(
            'tenant_id',
            tenantId,
          )

        if (updatePersonError) {
          throw new Error(
            updatePersonError.message ||
              'Unable to update the contact details.',
          )
        }
      }
    }

    /*
     * Add the supplied phone if it does not already exist
     * for this person.
     */
    if (phone && personId) {
      const normalizedPhone =
        normalizePhone(phone)

      const {
        data: existingPhone,
        error: existingPhoneError,
      } = await supabase
        .from('person_phones')
        .select('id')
        .eq(
          'person_id',
          personId,
        )
        .eq(
          'normalized_phone',
          normalizedPhone,
        )
        .maybeSingle()

      if (existingPhoneError) {
        throw new Error(
          'Unable to check the phone number.',
        )
      }

      if (!existingPhone) {
        const {
          error: phoneInsertError,
        } = await supabase
          .from('person_phones')
          .insert({
            person_id: personId,
            phone_number: phone,
            normalized_phone:
              normalizedPhone,
            phone_type: 'mobile',
            is_primary: true,
            is_whatsapp: false,
          })

        if (phoneInsertError) {
          throw new Error(
            phoneInsertError.message ||
              'Unable to save the phone number.',
          )
        }
      }
    }

    /*
     * Add the supplied email if it does not already exist
     * for this person.
     */
    if (email && personId) {
      const normalizedEmail =
        normalizeEmail(email)

      const {
        data: existingEmail,
        error: existingEmailError,
      } = await supabase
        .from('person_emails')
        .select('id')
        .eq(
          'person_id',
          personId,
        )
        .eq(
          'normalized_email',
          normalizedEmail,
        )
        .maybeSingle()

      if (existingEmailError) {
        throw new Error(
          'Unable to check the email address.',
        )
      }

      if (!existingEmail) {
        const {
          error: emailInsertError,
        } = await supabase
          .from('person_emails')
          .insert({
            person_id: personId,
            email,
            normalized_email:
              normalizedEmail,
            email_type: 'personal',
            is_primary: true,
          })

        if (emailInsertError) {
          throw new Error(
            emailInsertError.message ||
              'Unable to save the email address.',
          )
        }
      }
    }

    /*
     * Prevent multiple simultaneously open leads for the same person.
     */
    const {
      data: existingLead,
      error: existingLeadError,
    } = await supabase
      .from('leads')
      .select('id')
      .eq(
        'tenant_id',
        tenantId,
      )
      .eq(
        'person_id',
        personId,
      )
      .is('closed_at', null)
      .limit(1)
      .maybeSingle()

    if (existingLeadError) {
      throw new Error(
        'Unable to check for an existing lead.',
      )
    }

    if (existingLead?.id) {
      return {
        ok: false,
        message:
          'This contact already has an open lead. Open the existing lead instead of creating another one.',
      }
    }

    /*
     * Create the actual lead.
     */
    const {
      data: lead,
      error: leadError,
    } = await supabase
      .from('leads')
      .insert({
        tenant_id: tenantId,
        workspace_id:
          user.workspace_id,
        person_id: personId,
        assigned_user_id:
          assignedUserId,
        priority:
          priorityInput as LeadPriority,
        temperature:
          temperatureInput as LeadTemperature,
        lead_score: leadScore,
        notes,
      })
      .select('id')
      .single()

    if (leadError || !lead) {
      return {
        ok: false,
        message:
          leadError?.message ||
          'Unable to create the lead.',
      }
    }

    revalidatePath(
      '/dashboard/leads',
    )

    revalidatePath(
      `/dashboard/leads/${lead.id}`,
    )

    redirect(
      `/dashboard/leads/${lead.id}`,
    )
  } catch (error) {
    /*
     * Next.js redirect() uses an internal thrown
     * control-flow exception. It must be allowed through.
     */
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.startsWith(
        'NEXT_REDIRECT',
      )
    ) {
      throw error
    }

    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to create the lead.',
    }
  }
}