import type { SupabaseClient } from '@supabase/supabase-js'

import type {
  ImportColumnMapping,
  ImportExecutionResult,
  ImportRow,
  LeadPriority,
  LeadTemperature,
} from './types'

function value(
  row: ImportRow,
  mapping: ImportColumnMapping,
  field: string,
): string {
  const column = mapping[field]

  return column
    ? row.values[column]?.trim() ?? ''
    : ''
}

function normalizePhone(
  phone: string,
): string {
  return phone.replace(/[^\d+]/g, '')
}

function normalizeEmail(
  email: string,
): string {
  return email.trim().toLowerCase()
}

function createDisplayName(
  row: ImportRow,
  mapping: ImportColumnMapping,
): string {
  const explicit = value(
    row,
    mapping,
    'display_name',
  )

  if (explicit) {
    return explicit
  }

  return [
    value(row, mapping, 'first_name'),
    value(row, mapping, 'last_name'),
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
}

function normalizePriority(
  rawValue: string,
): LeadPriority {
  const value = rawValue.trim().toLowerCase()

  const priorityMap: Record<string, LeadPriority> = {
    low: 'low',
    medium: 'normal',
    normal: 'normal',
    high: 'high',
    urgent: 'urgent',
  }

  if (!value) {
    return 'normal'
  }

  const normalized = priorityMap[value]

  if (!normalized) {
    throw new Error(
      `Invalid lead priority: "${rawValue}". Expected low, normal, high, or urgent.`,
    )
  }

  return normalized
}

function normalizeTemperature(
  rawValue: string,
): LeadTemperature {
  const value = rawValue.trim().toLowerCase()

  const temperatureMap: Record<string, LeadTemperature> = {
    cold: 'cold',
    warm: 'warm',
    hot: 'hot',
  }

  if (!value) {
    return 'cold'
  }

  const normalized = temperatureMap[value]

  if (!normalized) {
    throw new Error(
      `Invalid lead temperature: "${rawValue}". Expected cold, warm, or hot.`,
    )
  }

  return normalized
}

export async function executeLeadImport(
  supabase: SupabaseClient,
  rows: ImportRow[],
  mapping: ImportColumnMapping,
  tenantId: string,
  workspaceId: string | null,
): Promise<ImportExecutionResult> {
  let importedRows = 0
  let skippedRows = 0
  let failedRows = 0

  const issues: ImportExecutionResult['issues'] = []

  for (const row of rows) {
    try {
      const displayName = createDisplayName(
        row,
        mapping,
      )

      if (!displayName) {
        throw new Error(
          'A first name, last name, or display name is required.',
        )
      }

      const phone = value(
        row,
        mapping,
        'phone',
      )

      const email = value(
        row,
        mapping,
        'email',
      )

      const normalizedPhone = phone
        ? normalizePhone(phone)
        : null

      const normalizedEmail = email
        ? normalizeEmail(email)
        : null

      let personId: string | null = null

      /*
       * First try to find an existing person by email.
       *
       * We intentionally do not use ON CONFLICT here because the live
       * database uses partial unique indexes on person_emails and
       * person_phones, which cannot be targeted by the simple Supabase
       * onConflict syntax used previously.
       */
      if (normalizedEmail) {
        const {
          data: emailMatch,
          error: emailLookupError,
        } = await supabase
          .from('person_emails')
          .select('person_id')
          .eq('normalized_email', normalizedEmail)
          .limit(1)
          .maybeSingle()

        if (emailLookupError) {
          throw new Error(
            `Unable to find person by email: ${emailLookupError.message}`,
          )
        }

        personId = emailMatch?.person_id ?? null
      }

      /*
       * If email did not identify a person, try phone.
       */
      if (!personId && normalizedPhone) {
        const {
          data: phoneMatch,
          error: phoneLookupError,
        } = await supabase
          .from('person_phones')
          .select('person_id')
          .eq('normalized_phone', normalizedPhone)
          .limit(1)
          .maybeSingle()

        if (phoneLookupError) {
          throw new Error(
            `Unable to find person by phone: ${phoneLookupError.message}`,
          )
        }

        personId = phoneMatch?.person_id ?? null
      }

      /*
       * Create the person when neither email nor phone matched
       * an existing person.
       */
      if (!personId) {
        const {
          data: person,
          error: personError,
        } = await supabase
          .from('people')
          .insert({
            tenant_id: tenantId,
            workspace_id: workspaceId,
            first_name:
              value(
                row,
                mapping,
                'first_name',
              ) || null,
            last_name:
              value(
                row,
                mapping,
                'last_name',
              ) || null,
            display_name: displayName,
            occupation:
              value(
                row,
                mapping,
                'occupation',
              ) || null,
            company_name:
              value(
                row,
                mapping,
                'company_name',
              ) || null,
            preferred_language:
              value(
                row,
                mapping,
                'preferred_language',
              ) || null,
            notes:
              value(
                row,
                mapping,
                'notes',
              ) || null,
          })
          .select('id')
          .single()

        if (personError) {
          throw new Error(
            `Unable to create person: ${personError.message}`,
          )
        }

        personId = person.id
      }

      if (!personId) {
        throw new Error(
          'Unable to resolve a person for this lead.',
        )
      }

      /*
       * Add the email if supplied and if this person does not
       * already have the normalized email.
       *
       * We use lookup + insert instead of upsert because the live
       * database has a partial unique index on this relationship.
       */
      if (normalizedEmail) {
        const {
          data: existingEmail,
          error: existingEmailError,
        } = await supabase
          .from('person_emails')
          .select('id')
          .eq('person_id', personId)
          .eq(
            'normalized_email',
            normalizedEmail,
          )
          .limit(1)
          .maybeSingle()

        if (existingEmailError) {
          throw new Error(
            `Unable to check person email: ${existingEmailError.message}`,
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
              normalized_email: normalizedEmail,
              email_type: 'personal',
              is_primary: true,
            })

          if (emailInsertError) {
            throw new Error(
              `Unable to add person email: ${emailInsertError.message}`,
            )
          }
        }
      }

      /*
       * Add the phone if supplied and if this person does not
       * already have the normalized phone.
       */
      if (normalizedPhone) {
        const {
          data: existingPhone,
          error: existingPhoneError,
        } = await supabase
          .from('person_phones')
          .select('id')
          .eq('person_id', personId)
          .eq(
            'normalized_phone',
            normalizedPhone,
          )
          .limit(1)
          .maybeSingle()

        if (existingPhoneError) {
          throw new Error(
            `Unable to check person phone: ${existingPhoneError.message}`,
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
              normalized_phone: normalizedPhone,
              phone_type: 'mobile',
              is_primary: true,
              is_whatsapp: false,
            })

          if (phoneInsertError) {
            throw new Error(
              `Unable to add person phone: ${phoneInsertError.message}`,
            )
          }
        }
      }

      /*
       * A person can exist without being a lead.
       * Before creating a lead, check whether this person already
       * has one in the current tenant.
       */
      const {
        data: existingLead,
        error: existingLeadError,
      } = await supabase
        .from('leads')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('person_id', personId)
        .limit(1)
        .maybeSingle()

      if (existingLeadError) {
        throw new Error(
          `Unable to check existing lead: ${existingLeadError.message}`,
        )
      }

      if (existingLead) {
        skippedRows++

        issues.push({
          rowNumber: row.rowNumber,
          severity: 'warning',
          message:
            'Lead already exists for this person. Row skipped.',
        })

        continue
      }

      /*
       * Normalize importer values to the actual live CRM enums.
       *
       * Live crm_lead_priority:
       *   low | normal | high | urgent
       *
       * Live crm_lead_temperature:
       *   cold | warm | hot
       *
       * "medium" is accepted from external CSV files and mapped
       * to the database's canonical "normal" value.
       */
      const priority = normalizePriority(
        value(
          row,
          mapping,
          'priority',
        ),
      )

      const temperature =
        normalizeTemperature(
          value(
            row,
            mapping,
            'temperature',
          ),
        )

      /*
       * Lead score is optional, but when supplied it must be
       * a finite non-negative number.
       */
      const scoreValue = value(
        row,
        mapping,
        'lead_score',
      )

      const leadScore = scoreValue
        ? Number(scoreValue)
        : null

      if (
        scoreValue &&
        (
          leadScore === null ||
          !Number.isFinite(leadScore) ||
          leadScore < 0
        )
      ) {
        throw new Error(
          'Lead score must be a non-negative number.',
        )
      }

      /*
       * Create the lead using only fields that are confirmed to
       * exist in the live public.leads table.
       */
      const {
        error: leadError,
      } = await supabase
        .from('leads')
        .insert({
          tenant_id: tenantId,
          workspace_id: workspaceId,
          person_id: personId,
          priority,
          temperature,
          lead_score: leadScore,
          notes:
            value(
              row,
              mapping,
              'notes',
            ) || null,
          metadata: {
            imported: true,
            import_source:
              'import_center',
          },
        })

      if (leadError) {
        throw new Error(
          `Unable to create lead: ${leadError.message}`,
        )
      }

      importedRows++
    } catch (error) {
      failedRows++

      issues.push({
        rowNumber: row.rowNumber,
        severity: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to import row.',
      })
    }
  }

  return {
    importedRows,
    skippedRows,
    failedRows,
    issues,
  }
}