import type { SupabaseClient } from '@supabase/supabase-js'

import type {
  ImportColumnMapping,
  ImportExecutionResult,
  ImportRow,
} from './types'

function value(
  row: ImportRow,
  mapping: ImportColumnMapping,
  field: string,
): string {
  const column = mapping[field]

  if (!column) {
    return ''
  }

  return row.values[column]?.trim() ?? ''
}

function nullableNumber(
  valueToParse: string,
): number | null {
  if (!valueToParse) {
    return null
  }

  const parsed = Number(valueToParse)

  return Number.isFinite(parsed)
    ? parsed
    : null
}

function slugify(valueToSlugify: string): string {
  return valueToSlugify
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function executePropertyImport(
  supabase: SupabaseClient,
  rows: ImportRow[],
  mapping: ImportColumnMapping,
): Promise<ImportExecutionResult> {
  let importedRows = 0
  let skippedRows = 0
  let failedRows = 0

  let projectsCreated = 0
  let configurationsCreated = 0
  let unitsCreated = 0

  const issues: ImportExecutionResult['issues'] = []

  for (const row of rows) {
    try {
      const projectName = value(
        row,
        mapping,
        'project_name',
      )

      if (!projectName) {
        throw new Error('Project name is required.')
      }

      const projectSlug =
        value(row, mapping, 'project_slug') ||
        slugify(projectName)

      if (!projectSlug) {
        throw new Error(
          'Unable to generate a project slug.',
        )
      }

      /*
       * Resolve developer when one is supplied.
       *
       * Developers are global inventory entities, so this lookup
       * intentionally does not use a tenant filter.
       */
      let developerId: string | null = null

      const developerName = value(
        row,
        mapping,
        'developer_name',
      )

      if (developerName) {
        const {
          data: developer,
          error: developerError,
        } = await supabase
          .from('developers')
          .select('id')
          .eq('name', developerName)
          .limit(1)
          .maybeSingle()

        if (developerError) {
          throw new Error(
            `Unable to resolve developer: ${developerError.message}`,
          )
        }

        developerId = developer?.id ?? null
      }

      /*
       * Resolve or create project.
       */
      let projectId: string | null = null

      const {
        data: existingProject,
        error: projectLookupError,
      } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', projectSlug)
        .limit(1)
        .maybeSingle()

      if (projectLookupError) {
        throw new Error(
          `Unable to find project: ${projectLookupError.message}`,
        )
      }

      projectId = existingProject?.id ?? null

      if (!projectId) {
        const {
          data: createdProject,
          error: projectError,
        } = await supabase
          .from('projects')
          .insert({
            developer_id: developerId,
            name: projectName,
            slug: projectSlug,
            property_category:
              value(
                row,
                mapping,
                'property_category',
              ) || 'primary_sale',
            property_type:
              value(
                row,
                mapping,
                'property_type',
              ) || 'apartment',
            city:
              value(row, mapping, 'city') || null,
            state:
              value(row, mapping, 'state') || null,
            postal_code:
              value(row, mapping, 'postal_code') || null,
            address_line_1:
              value(
                row,
                mapping,
                'address_line_1',
              ) || null,
            address_line_2:
              value(
                row,
                mapping,
                'address_line_2',
              ) || null,
            status:
              value(
                row,
                mapping,
                'project_status',
              ) || 'upcoming',
            launch_date:
              value(
                row,
                mapping,
                'launch_date',
              ) || null,
            possession_date:
              value(
                row,
                mapping,
                'possession_date',
              ) || null,
            rera_number:
              value(
                row,
                mapping,
                'rera_number',
              ) || null,
            description:
              value(
                row,
                mapping,
                'description',
              ) || null,
            highlights:
              value(
                row,
                mapping,
                'highlights',
              ) || null,
            price_min: nullableNumber(
              value(row, mapping, 'price_min'),
            ),
            price_max: nullableNumber(
              value(row, mapping, 'price_max'),
            ),
          })
          .select('id')
          .single()

        if (projectError) {
          throw new Error(
            `Unable to create project: ${projectError.message}`,
          )
        }

        projectId = createdProject.id
        projectsCreated += 1
      }

      if (!projectId) {
        throw new Error(
          'Unable to resolve the imported project.',
        )
      }

      /*
       * Resolve or create configuration.
       *
       * Configuration is optional. A row can therefore create
       * only a project when configuration_name is absent.
       */
      const configurationName = value(
        row,
        mapping,
        'configuration_name',
      )

      let configurationId: string | null = null

      if (configurationName) {
        const {
          data: existingConfiguration,
          error: configurationLookupError,
        } = await supabase
          .from('project_configurations')
          .select('id')
          .eq('project_id', projectId)
          .eq(
            'configuration_name',
            configurationName,
          )
          .limit(1)
          .maybeSingle()

        if (configurationLookupError) {
          throw new Error(
            `Unable to find configuration: ${configurationLookupError.message}`,
          )
        }

        configurationId =
          existingConfiguration?.id ?? null

        if (!configurationId) {
          const {
            data: createdConfiguration,
            error: configurationError,
          } = await supabase
            .from('project_configurations')
            .insert({
              project_id: projectId,
              configuration_name:
                configurationName,
              bedrooms:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'bedrooms',
                  ),
                ) ?? 0,
              bathrooms:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'bathrooms',
                  ),
                ),
              carpet_area_min:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'carpet_area_min',
                  ),
                ),
              carpet_area_max:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'carpet_area_max',
                  ),
                ),
              builtup_area_min:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'builtup_area_min',
                  ),
                ),
              builtup_area_max:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'builtup_area_max',
                  ),
                ),
              super_builtup_area_min:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'super_builtup_area_min',
                  ),
                ),
              super_builtup_area_max:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'super_builtup_area_max',
                  ),
                ),
              price_min:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'price_min',
                  ),
                ),
              price_max:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'price_max',
                  ),
                ),
              price_per_sqft_min: null,
              price_per_sqft_max: null,
              total_available_units: 0,
            })
            .select('id')
            .single()

          if (configurationError) {
            throw new Error(
              `Unable to create configuration: ${configurationError.message}`,
            )
          }

          configurationId =
            createdConfiguration.id

          configurationsCreated += 1
        }
      }

      /*
       * Resolve or create unit.
       *
       * A property CSV row without unit_number is still useful for
       * project/configuration imports, but it does not create a unit.
       */
      const unitNumber = value(
        row,
        mapping,
        'unit_number',
      )

      if (unitNumber) {
        const {
          data: existingUnit,
          error: unitLookupError,
        } = await supabase
          .from('units')
          .select('id')
          .eq('project_id', projectId)
          .eq('unit_number', unitNumber)
          .limit(1)
          .maybeSingle()

        if (unitLookupError) {
          throw new Error(
            `Unable to find unit: ${unitLookupError.message}`,
          )
        }

        if (existingUnit) {
          skippedRows += 1

          issues.push({
            rowNumber: row.rowNumber,
            severity: 'warning',
            field: 'unit_number',
            message:
              `Unit "${unitNumber}" already exists in this project and was skipped.`,
          })

          continue
        }

        const { error: unitError } =
          await supabase
            .from('units')
            .insert({
              project_id: projectId,
              configuration_id:
                configurationId,
              unit_number: unitNumber,
              floor_number:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'floor_number',
                  ),
                ),
              carpet_area_sqft:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'carpet_area_sqft',
                  ),
                ),
              builtup_area_sqft:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'builtup_area_sqft',
                  ),
                ),
              super_builtup_area_sqft:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'super_builtup_area_sqft',
                  ),
                ),
              balcony_area_sqft:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'balcony_area_sqft',
                  ),
                ),
              bedrooms:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'bedrooms',
                  ),
                ),
              bathrooms:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'bathrooms',
                  ),
                ),
              facing:
                value(
                  row,
                  mapping,
                  'facing',
                ) || null,
              parking_count:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'parking_count',
                  ),
                ),
              asking_price:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'asking_price',
                  ),
                ),
              price_per_sqft:
                nullableNumber(
                  value(
                    row,
                    mapping,
                    'price_per_sqft',
                  ),
                ),
              status:
                value(
                  row,
                  mapping,
                  'unit_status',
                ) || 'available',
            })

        if (unitError) {
          throw new Error(
            `Unable to create unit: ${unitError.message}`,
          )
        }

        unitsCreated += 1
      }

      importedRows += 1
    } catch (error) {
      failedRows += 1

      issues.push({
        rowNumber: row.rowNumber,
        severity: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to import property row.',
      })
    }
  }

  return {
    importedRows,
    skippedRows,
    failedRows,
    issues,
    projectsCreated,
    configurationsCreated,
    unitsCreated,
  }
}