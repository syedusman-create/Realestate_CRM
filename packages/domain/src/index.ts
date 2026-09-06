export type EntityId = string

export interface LeadSummary {
  id: EntityId
  personId: EntityId
  assignedUserId: EntityId | null
  temperature: 'cold' | 'warm' | 'hot'
  priority: 'low' | 'normal' | 'high' | 'urgent'
}

export interface RequirementSummary {
  bedroomsMin: number | null
  bedroomsMax: number | null
  budgetMin: number | null
  budgetMax: number | null
  areaMinSqft: number | null
  areaMaxSqft: number | null
}

export interface PropertyRecommendation {
  projectId: EntityId
  unitId: EntityId
  listingId: EntityId | null
  rank: number
  totalScore: number
  reasons: unknown
}
