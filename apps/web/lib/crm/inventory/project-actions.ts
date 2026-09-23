'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createSlug,
  PROJECT_STATUSES,
  PROPERTY_CATEGORIES,
  PROPERTY_TYPES,
  type ProjectActionState,
  type ProjectStatus,
  type PropertyCategory,
  type PropertyType,
} from '@/lib/crm/inventory/project-types'

function text(
  formData: FormData,
  field: string,
) {
  return String(formData.get(field) ?? '').trim()
}

function nullableText(
  formData: FormData,
  field: string,
) {
  const value = text(formData, field)

  return value || null
}

function nullableUuid(
  formData: FormData,
  field: string,
) {
  const value = text(formData, field)

  if (!value) {
    return null
  }

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  return uuidPattern.test(value) ? value : null
}

function nullableNumber(
  formData: FormData,
  field: string,
) {
  const value = text(formData, field)

  if (!value) {
    return null
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : null
}

function nullableInteger(
  formData: FormData,
  field: string,
) {
  const value = text(formData, field)

  if (!value) {
    return null
  }

  const parsed = Number.parseInt(value, 10)

  return Number.isFinite(parsed) ? parsed : null
}

function getProjectEnums(formData: FormData) {
  const propertyCategory =
    text(formData, 'property_category') ||
    'primary_sale'

  const propertyType =
    text(formData, 'property_type') ||
    'apartment'

  const status =
    text(formData, 'status') ||
    'upcoming'

  if (
    !PROPERTY_CATEGORIES.includes(
      propertyCategory as PropertyCategory,
    )
  ) {
    return {
      error: 'Invalid property category.',
    } as const
  }

  if (
    !PROPERTY_TYPES.includes(
      propertyType as PropertyType,
    )
  ) {
    return {
      error: 'Invalid property type.',
    } as const
  }

  if (
    !PROJECT_STATUSES.includes(
      status as ProjectStatus,
    )
  ) {
    return {
      error: 'Invalid project status.',
    } as const
  }

  return {
    propertyCategory:
      propertyCategory as PropertyCategory,
    propertyType:
      propertyType as PropertyType,
    status: status as ProjectStatus,
  } as const
}

async function validateSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string,
  projectId?: string,
) {
  let query = supabase
    .from('projects')
    .select('id')
    .eq('slug', slug)
    .limit(1)

  if (projectId) {
    query = query.neq('id', projectId)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    return {
      error: error.message,
    }
  }

  if (data) {
    return {
      error: 'A project with this slug already exists.',
    }
  }

  return {
    error: null,
  }
}

export async function createProject(
  _previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  try {
    const supabase = await createClient()

    const name = text(formData, 'name')

    if (!name) {
      return {
        ok: false,
        message: 'Project name is required.',
      }
    }

    const slug = createSlug(
      text(formData, 'slug') || name,
    )

    if (!slug) {
      return {
        ok: false,
        message: 'A valid project slug is required.',
      }
    }

    const enumValues = getProjectEnums(formData)

    if ('error' in enumValues) {
      return {
        ok: false,
        message: enumValues.error,
      }
    }

    const slugValidation = await validateSlug(
      supabase,
      slug,
    )

    if (slugValidation.error) {
      return {
        ok: false,
        message: slugValidation.error,
      }
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        developer_id: nullableUuid(
          formData,
          'developer_id',
        ),
        name,
        slug,
        property_category:
          enumValues.propertyCategory,
        property_type:
          enumValues.propertyType,
        location_id: nullableUuid(
          formData,
          'location_id',
        ),
        address_line_1: nullableText(
          formData,
          'address_line_1',
        ),
        address_line_2: nullableText(
          formData,
          'address_line_2',
        ),
        city: nullableText(formData, 'city'),
        state: nullableText(formData, 'state'),
        postal_code: nullableText(
          formData,
          'postal_code',
        ),
        latitude: nullableNumber(
          formData,
          'latitude',
        ),
        longitude: nullableNumber(
          formData,
          'longitude',
        ),
        land_area_sqft: nullableNumber(
          formData,
          'land_area_sqft',
        ),
        total_units: nullableInteger(
          formData,
          'total_units',
        ),
        total_towers: nullableInteger(
          formData,
          'total_towers',
        ),
        total_floors: nullableInteger(
          formData,
          'total_floors',
        ),
        status: enumValues.status,
        launch_date: nullableText(
          formData,
          'launch_date',
        ),
        possession_date: nullableText(
          formData,
          'possession_date',
        ),
        rera_number: nullableText(
          formData,
          'rera_number',
        ),
        description: nullableText(
          formData,
          'description',
        ),
        highlights: nullableText(
          formData,
          'highlights',
        ),
        price_min: nullableNumber(
          formData,
          'price_min',
        ),
        price_max: nullableNumber(
          formData,
          'price_max',
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

    revalidatePath('/dashboard/inventory')
    revalidatePath(
      '/dashboard/inventory/projects',
    )

    return {
      ok: true,
      message: 'Project created successfully.',
      projectId: data.id,
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to create project.',
    }
  }
}

export async function updateProject(
  projectId: string,
  _previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  try {
    const supabase = await createClient()

    if (!projectId) {
      return {
        ok: false,
        message: 'Project ID is required.',
      }
    }

    const name = text(formData, 'name')

    if (!name) {
      return {
        ok: false,
        message: 'Project name is required.',
      }
    }

    const slug = createSlug(
      text(formData, 'slug') || name,
    )

    if (!slug) {
      return {
        ok: false,
        message: 'A valid project slug is required.',
      }
    }

    const enumValues = getProjectEnums(formData)

    if ('error' in enumValues) {
      return {
        ok: false,
        message: enumValues.error,
      }
    }

    const slugValidation = await validateSlug(
      supabase,
      slug,
      projectId,
    )

    if (slugValidation.error) {
      return {
        ok: false,
        message: slugValidation.error,
      }
    }

    const { error } = await supabase
      .from('projects')
      .update({
        developer_id: nullableUuid(
          formData,
          'developer_id',
        ),
        name,
        slug,
        property_category:
          enumValues.propertyCategory,
        property_type:
          enumValues.propertyType,
        location_id: nullableUuid(
          formData,
          'location_id',
        ),
        address_line_1: nullableText(
          formData,
          'address_line_1',
        ),
        address_line_2: nullableText(
          formData,
          'address_line_2',
        ),
        city: nullableText(formData, 'city'),
        state: nullableText(formData, 'state'),
        postal_code: nullableText(
          formData,
          'postal_code',
        ),
        latitude: nullableNumber(
          formData,
          'latitude',
        ),
        longitude: nullableNumber(
          formData,
          'longitude',
        ),
        land_area_sqft: nullableNumber(
          formData,
          'land_area_sqft',
        ),
        total_units: nullableInteger(
          formData,
          'total_units',
        ),
        total_towers: nullableInteger(
          formData,
          'total_towers',
        ),
        total_floors: nullableInteger(
          formData,
          'total_floors',
        ),
        status: enumValues.status,
        launch_date: nullableText(
          formData,
          'launch_date',
        ),
        possession_date: nullableText(
          formData,
          'possession_date',
        ),
        rera_number: nullableText(
          formData,
          'rera_number',
        ),
        description: nullableText(
          formData,
          'description',
        ),
        highlights: nullableText(
          formData,
          'highlights',
        ),
        price_min: nullableNumber(
          formData,
          'price_min',
        ),
        price_max: nullableNumber(
          formData,
          'price_max',
        ),
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)

    if (error) {
      return {
        ok: false,
        message: error.message,
      }
    }

    revalidatePath('/dashboard/inventory')
    revalidatePath(
      '/dashboard/inventory/projects',
    )
    revalidatePath(
      `/dashboard/inventory/projects/${projectId}`,
    )

    return {
      ok: true,
      message: 'Project updated successfully.',
      projectId,
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to update project.',
    }
  }
}

export async function deleteProject(
  projectId: string,
): Promise<ProjectActionState> {
  try {
    const supabase = await createClient()

    if (!projectId) {
      return {
        ok: false,
        message: 'Project ID is required.',
      }
    }

    const { count, error: unitError } =
      await supabase
        .from('units')
        .select('*', {
          count: 'exact',
          head: true,
        })
        .eq('project_id', projectId)

    if (unitError) {
      return {
        ok: false,
        message: unitError.message,
      }
    }

    if ((count ?? 0) > 0) {
      return {
        ok: false,
        message:
          'This project has units attached to it and cannot be deleted.',
      }
    }

    const {
      count: configurationCount,
      error: configurationError,
    } = await supabase
      .from('project_configurations')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('project_id', projectId)

    if (configurationError) {
      return {
        ok: false,
        message: configurationError.message,
      }
    }

    if ((configurationCount ?? 0) > 0) {
      return {
        ok: false,
        message:
          'This project has configurations attached to it and cannot be deleted.',
      }
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      return {
        ok: false,
        message: error.message,
      }
    }

    revalidatePath('/dashboard/inventory')
    revalidatePath(
      '/dashboard/inventory/projects',
    )

    return {
      ok: true,
      message: 'Project deleted successfully.',
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to delete project.',
    }
  }
}