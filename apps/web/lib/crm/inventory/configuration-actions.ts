'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import type {
  ConfigurationActionState,
} from '@/lib/crm/inventory/project-types'

function requiredText(formData: FormData, name: string): string {
  const value = formData.get(name)

  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${name} is required`)
  }

  return value.trim()
}

function nullableText(
  formData: FormData,
  name: string,
): string | null {
  const value = formData.get(name)

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed || null
}

function requiredUuid(formData: FormData, name: string): string {
  const value = requiredText(formData, name)

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    throw new Error(`${name} must be a valid UUID`)
  }

  return value
}

function nullableUuid(
  formData: FormData,
  name: string,
): string | null {
  const value = nullableText(formData, name)

  if (!value) {
    return null
  }

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    throw new Error(`${name} must be a valid UUID`)
  }

  return value
}

function nullableNumber(
  formData: FormData,
  name: string,
): number | null {
  const value = nullableText(formData, name)

  if (value === null) {
    return null
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative number`)
  }

  return parsed
}

function requiredInteger(
  formData: FormData,
  name: string,
): number {
  const value = nullableText(formData, name)

  if (value === null) {
    return 0
  }

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer`)
  }

  return parsed
}

function validateRange(
  minimum: number | null,
  maximum: number | null,
  label: string,
) {
  if (
    minimum !== null &&
    maximum !== null &&
    minimum > maximum
  ) {
    throw new Error(`${label} minimum cannot exceed maximum`)
  }
}

function revalidateConfigurationPaths(
  projectId: string,
) {
  revalidatePath('/dashboard/inventory')
  revalidatePath('/dashboard/inventory/projects')
  revalidatePath(`/dashboard/inventory/projects/${projectId}`)
}

export async function createConfiguration(
  _previousState: ConfigurationActionState,
  formData: FormData,
): Promise<ConfigurationActionState> {
  try {
    const supabase = await createClient()

    const projectId = requiredUuid(formData, 'project_id')
    const configurationName = requiredText(
      formData,
      'configuration_name',
    )

    const bedrooms = nullableNumber(formData, 'bedrooms')
    const bathrooms = nullableNumber(formData, 'bathrooms')

    const carpetAreaMin = nullableNumber(
      formData,
      'carpet_area_min',
    )
    const carpetAreaMax = nullableNumber(
      formData,
      'carpet_area_max',
    )

    const builtupAreaMin = nullableNumber(
      formData,
      'builtup_area_min',
    )
    const builtupAreaMax = nullableNumber(
      formData,
      'builtup_area_max',
    )

    const superBuiltupAreaMin = nullableNumber(
      formData,
      'super_builtup_area_min',
    )
    const superBuiltupAreaMax = nullableNumber(
      formData,
      'super_builtup_area_max',
    )

    const priceMin = nullableNumber(
      formData,
      'price_min',
    )
    const priceMax = nullableNumber(
      formData,
      'price_max',
    )

    const pricePerSqftMin = nullableNumber(
      formData,
      'price_per_sqft_min',
    )
    const pricePerSqftMax = nullableNumber(
      formData,
      'price_per_sqft_max',
    )

    validateRange(
      carpetAreaMin,
      carpetAreaMax,
      'Carpet area',
    )

    validateRange(
      builtupAreaMin,
      builtupAreaMax,
      'Built-up area',
    )

    validateRange(
      superBuiltupAreaMin,
      superBuiltupAreaMax,
      'Super built-up area',
    )

    validateRange(
      priceMin,
      priceMax,
      'Price',
    )

    validateRange(
      pricePerSqftMin,
      pricePerSqftMax,
      'Price per sqft',
    )

    const phaseId = nullableUuid(formData, 'phase_id')

    const { data, error } = await supabase
      .from('project_configurations')
      .insert({
        project_id: projectId,
        phase_id: phaseId,
        configuration_name: configurationName,
        bedrooms,
        bathrooms,
        carpet_area_min: carpetAreaMin,
        carpet_area_max: carpetAreaMax,
        builtup_area_min: builtupAreaMin,
        builtup_area_max: builtupAreaMax,
        super_builtup_area_min: superBuiltupAreaMin,
        super_builtup_area_max: superBuiltupAreaMax,
        price_min: priceMin,
        price_max: priceMax,
        price_per_sqft_min: pricePerSqftMin,
        price_per_sqft_max: pricePerSqftMax,
        total_available_units: requiredInteger(
          formData,
          'total_available_units',
        ),
      })
      .select('id')
      .single()

    if (error) {
      return {
        ok: false,
        message: error.message,
      }
    }

    revalidateConfigurationPaths(projectId)

    return {
      ok: true,
      message: 'Configuration created successfully.',
      configurationId: data.id,
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to create configuration.',
    }
  }
}

export async function updateConfiguration(
  configurationId: string,
  projectId: string,
  _previousState: ConfigurationActionState,
  formData: FormData,
): Promise<ConfigurationActionState> {
  try {
    const supabase = await createClient()

    const configurationName = requiredText(
      formData,
      'configuration_name',
    )

    const bedrooms = nullableNumber(formData, 'bedrooms')
    const bathrooms = nullableNumber(formData, 'bathrooms')

    const carpetAreaMin = nullableNumber(
      formData,
      'carpet_area_min',
    )
    const carpetAreaMax = nullableNumber(
      formData,
      'carpet_area_max',
    )

    const builtupAreaMin = nullableNumber(
      formData,
      'builtup_area_min',
    )
    const builtupAreaMax = nullableNumber(
      formData,
      'builtup_area_max',
    )

    const superBuiltupAreaMin = nullableNumber(
      formData,
      'super_builtup_area_min',
    )
    const superBuiltupAreaMax = nullableNumber(
      formData,
      'super_builtup_area_max',
    )

    const priceMin = nullableNumber(
      formData,
      'price_min',
    )
    const priceMax = nullableNumber(
      formData,
      'price_max',
    )

    const pricePerSqftMin = nullableNumber(
      formData,
      'price_per_sqft_min',
    )
    const pricePerSqftMax = nullableNumber(
      formData,
      'price_per_sqft_max',
    )

    validateRange(
      carpetAreaMin,
      carpetAreaMax,
      'Carpet area',
    )

    validateRange(
      builtupAreaMin,
      builtupAreaMax,
      'Built-up area',
    )

    validateRange(
      superBuiltupAreaMin,
      superBuiltupAreaMax,
      'Super built-up area',
    )

    validateRange(
      priceMin,
      priceMax,
      'Price',
    )

    validateRange(
      pricePerSqftMin,
      pricePerSqftMax,
      'Price per sqft',
    )

    const phaseId = nullableUuid(formData, 'phase_id')

    const { error } = await supabase
      .from('project_configurations')
      .update({
        phase_id: phaseId,
        configuration_name: configurationName,
        bedrooms,
        bathrooms,
        carpet_area_min: carpetAreaMin,
        carpet_area_max: carpetAreaMax,
        builtup_area_min: builtupAreaMin,
        builtup_area_max: builtupAreaMax,
        super_builtup_area_min: superBuiltupAreaMin,
        super_builtup_area_max: superBuiltupAreaMax,
        price_min: priceMin,
        price_max: priceMax,
        price_per_sqft_min: pricePerSqftMin,
        price_per_sqft_max: pricePerSqftMax,
        total_available_units: requiredInteger(
          formData,
          'total_available_units',
        ),
        updated_at: new Date().toISOString(),
      })
      .eq('id', configurationId)
      .eq('project_id', projectId)

    if (error) {
      return {
        ok: false,
        message: error.message,
      }
    }

    revalidateConfigurationPaths(projectId)
    revalidatePath(
      `/dashboard/inventory/projects/${projectId}/configurations/${configurationId}/edit`,
    )

    return {
      ok: true,
      message: 'Configuration updated successfully.',
      configurationId,
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to update configuration.',
    }
  }
}

export async function deleteConfiguration(
  configurationId: string,
  projectId: string,
): Promise<ConfigurationActionState> {
  try {
    const supabase = await createClient()

    const { count, error: countError } = await supabase
      .from('units')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('configuration_id', configurationId)

    if (countError) {
      return {
        ok: false,
        message: countError.message,
      }
    }

    if ((count ?? 0) > 0) {
      return {
        ok: false,
        message:
          'This configuration cannot be deleted because units are linked to it.',
      }
    }

    const { error } = await supabase
      .from('project_configurations')
      .delete()
      .eq('id', configurationId)
      .eq('project_id', projectId)

    if (error) {
      return {
        ok: false,
        message: error.message,
      }
    }

    revalidateConfigurationPaths(projectId)

    return {
      ok: true,
      message: 'Configuration deleted successfully.',
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to delete configuration.',
    }
  }
}