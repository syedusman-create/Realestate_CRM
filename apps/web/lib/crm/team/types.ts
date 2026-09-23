export const TEAM_ROLES = [
  'admin',
  'team_lead',
  'agent',
  'broker',
] as const

export type TeamRole = (typeof TEAM_ROLES)[number]

export type TeamMember = {
  id: string
  tenant_code: string
  full_name: string
  email: string | null
  phone: string | null
  role: string
  is_active: boolean | null
  workspace_id: string | null
  created_at: string | null
  updated_at: string | null
}

export type TeamFilters = {
  search?: string
  role?: string
  status?: 'all' | 'active' | 'inactive'
}

export type TeamActionState = {
  ok: boolean
  message: string
  memberId?: string
}