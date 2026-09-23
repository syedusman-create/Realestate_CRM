import { useEffect, useState } from 'react'
import { Link, useLocalSearchParams } from 'expo-router'
import { Alert, Linking, RefreshControl, SafeAreaView, ScrollView, Text, TextInput, View, Pressable } from 'react-native'
import { supabase } from '../../lib/supabase'

type Lead = { lead_id: string; person_name: string | null; phone: string | null; email: string | null; temperature: string | null; lead_score: number | null; stage_name: string | null; assigned_user_name: string | null; notes: string | null }
type Stage = { id: string; name: string; pipeline_id: string }
type Requirement = { id: string; requirement_type: string; purpose: string | null; bedrooms_min: number | null; bedrooms_max: number | null; budget_min: number | null; budget_max: number | null; area_min_sqft: number | null; area_max_sqft: number | null; bathrooms_min: number | null; furnishing: string | null; preferred_facing: string | null; possession_before: string | null; parking_required: number | null; notes: string | null }
type Task = { id: string; title: string; task_type: string; scheduled_at: string; status: string; priority: string }
type Match = { project_name: string; location_name: string | null; unit_number: string | null; bedrooms: number | null; area_sqft: number | null; total_score: number; rank: number }
type RequirementKey = 'bedrooms_min' | 'bedrooms_max' | 'budget_min' | 'budget_max' | 'area_min_sqft' | 'area_max_sqft' | 'bathrooms_min' | 'parking_required'

const numericKeys: RequirementKey[] = ['bedrooms_min', 'bedrooms_max', 'budget_min', 'budget_max', 'area_min_sqft', 'area_max_sqft', 'bathrooms_min', 'parking_required']

const field = (label: string, value: string, onChange: (value: string) => void, numeric = false, placeholder = '') => (
  <View style={{ flex: 1, minWidth: 135, gap: 5 }}>
    <Text style={{ color: '#8f98a3', fontSize: 12 }}>{label}</Text>
    <TextInput value={value} onChangeText={onChange} keyboardType={numeric ? 'numeric' : 'default'} placeholder={placeholder} placeholderTextColor="#59626d" style={{ color: '#f5f7fa', backgroundColor: '#0d1116', borderColor: '#303740', borderWidth: 1, borderRadius: 9, padding: 11 }} />
  </View>
)

const choice = (value: string, selected: boolean, onPress: () => void) => (
  <Pressable onPress={onPress} style={{ borderWidth: 1, borderColor: selected ? '#f5f7fa' : '#303740', backgroundColor: selected ? '#f5f7fa' : 'transparent', borderRadius: 9, padding: 9 }}>
    <Text style={{ color: selected ? '#0b0d10' : '#a8b0ba', fontWeight: '600' }}>{value.replaceAll('_', ' ') || 'Any'}</Text>
  </Pressable>
)

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [lead, setLead] = useState<Lead | null>(null)
  const [stages, setStages] = useState<Stage[]>([])
  const [edit, setEdit] = useState({ priority: 'normal', temperature: 'cold', notes: '', status_id: null as string | null, pipeline_id: null as string | null })
  const [requirement, setRequirement] = useState<Requirement | null>(null)
  const [req, setReq] = useState<Record<string, string>>({ requirement_type: 'buy', purpose: '', bedrooms_min: '', bedrooms_max: '', budget_min: '', budget_max: '', area_min_sqft: '', area_max_sqft: '', bathrooms_min: '', furnishing: '', preferred_facing: '', possession_before: '', parking_required: '', notes: '' })
  const [tasks, setTasks] = useState<Task[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [saving, setSaving] = useState(false)

  const setR = (key: string, value: string) => setReq((current) => ({ ...current, [key]: value }))
  const numberValue = (value: string) => (value.trim() ? Number(value) : null)

  async function load() {
    if (!id) return
    const [{ data: leadData }, { data: leadRow }, { data: taskData }, { data: matchData }] = await Promise.all([
      supabase.from('lead_dashboard').select('lead_id, person_name, phone, email, temperature, lead_score, stage_name, assigned_user_name, notes').eq('lead_id', id).maybeSingle(),
      supabase.from('leads').select('priority, temperature, notes, status_id, pipeline_id').eq('id', id).maybeSingle(),
      supabase.from('tasks').select('id, title, task_type, scheduled_at, status, priority').eq('lead_id', id).in('status', ['pending', 'in_progress']).order('scheduled_at').limit(10),
      supabase.rpc('get_property_recommendations', { p_lead_id: id, p_limit: 5 }),
    ])

    setLead(leadData as Lead | null)
    if (leadRow) {
      setEdit({ priority: leadRow.priority ?? 'normal', temperature: leadRow.temperature ?? 'cold', notes: leadRow.notes ?? '', status_id: leadRow.status_id, pipeline_id: leadRow.pipeline_id })
      if (leadRow.pipeline_id) {
        const { data: stageData } = await supabase.from('pipeline_stages').select('id, name, pipeline_id').eq('pipeline_id', leadRow.pipeline_id).order('display_order')
        setStages((stageData ?? []) as Stage[])
      } else {
        setStages([])
      }
    }
    setTasks((taskData ?? []) as Task[])
    setMatches((matchData ?? []) as Match[])

    const { data: requirementData } = await supabase.from('requirements').select('id, requirement_type, purpose, bedrooms_min, bedrooms_max, budget_min, budget_max, area_min_sqft, area_max_sqft, bathrooms_min, furnishing, preferred_facing, possession_before, parking_required, notes').eq('lead_id', id).eq('is_active', true).order('created_at', { ascending: false }).limit(1).maybeSingle()
    const currentRequirement = requirementData as Requirement | null
    setRequirement(currentRequirement)
    if (currentRequirement) {
      setReq({ requirement_type: currentRequirement.requirement_type, purpose: currentRequirement.purpose ?? '', bedrooms_min: String(currentRequirement.bedrooms_min ?? ''), bedrooms_max: String(currentRequirement.bedrooms_max ?? ''), budget_min: String(currentRequirement.budget_min ?? ''), budget_max: String(currentRequirement.budget_max ?? ''), area_min_sqft: String(currentRequirement.area_min_sqft ?? ''), area_max_sqft: String(currentRequirement.area_max_sqft ?? ''), bathrooms_min: String(currentRequirement.bathrooms_min ?? ''), furnishing: currentRequirement.furnishing ?? '', preferred_facing: currentRequirement.preferred_facing ?? '', possession_before: currentRequirement.possession_before ?? '', parking_required: String(currentRequirement.parking_required ?? ''), notes: currentRequirement.notes ?? '' })
    }
  }

  useEffect(() => { void load() }, [id])

  async function saveLead() {
    if (!id) return
    setSaving(true)
    const { error } = await supabase.from('leads').update({ priority: edit.priority, temperature: edit.temperature, notes: edit.notes.trim() || null, status_id: edit.status_id, pipeline_id: edit.status_id ? edit.pipeline_id : null }).eq('id', id)
    setSaving(false)
    if (error) { Alert.alert('Could not save lead', error.message); return }
    Alert.alert('Saved', 'Lead details updated.')
    void load()
  }

  async function saveRequirement() {
    if (!id) return
    const values = numericKeys.map((key) => numberValue(req[key]))
    if (values.some((value) => value != null && (!Number.isFinite(value) || value < 0))) { Alert.alert('Invalid requirement', 'Numeric values must be zero or greater.'); return }
    const bedroomsMin = numberValue(req.bedrooms_min)
    const bedroomsMax = numberValue(req.bedrooms_max)
    const budgetMin = numberValue(req.budget_min)
    const budgetMax = numberValue(req.budget_max)
    const areaMin = numberValue(req.area_min_sqft)
    const areaMax = numberValue(req.area_max_sqft)
    if (bedroomsMin != null && bedroomsMax != null && bedroomsMin > bedroomsMax) { Alert.alert('Invalid requirement', 'Minimum bedrooms cannot exceed maximum.'); return }
    if (budgetMin != null && budgetMax != null && budgetMin > budgetMax) { Alert.alert('Invalid requirement', 'Minimum budget cannot exceed maximum.'); return }
    if (areaMin != null && areaMax != null && areaMin > areaMax) { Alert.alert('Invalid requirement', 'Minimum area cannot exceed maximum.'); return }
    const payload = { lead_id: id, requirement_type: req.requirement_type, purpose: req.purpose || null, bedrooms_min: bedroomsMin, bedrooms_max: bedroomsMax, budget_min: budgetMin, budget_max: budgetMax, area_min_sqft: areaMin, area_max_sqft: areaMax, bathrooms_min: numberValue(req.bathrooms_min), furnishing: req.furnishing || null, preferred_facing: req.preferred_facing.trim() || null, possession_before: req.possession_before || null, parking_required: numberValue(req.parking_required), notes: req.notes.trim() || null, is_active: true, updated_at: new Date().toISOString() }
    setSaving(true)
    const result = requirement ? await supabase.from('requirements').update(payload).eq('id', requirement.id) : await supabase.from('requirements').insert(payload)
    setSaving(false)
    if (result.error) { Alert.alert('Could not save requirement', result.error.message); return }
    Alert.alert('Saved', 'Buyer requirement updated.')
    void load()
  }

  if (!lead) return <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0d10', justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#8f98a3' }}>Loading lead…</Text></SafeAreaView>

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0d10' }}>
      <ScrollView refreshControl={<RefreshControl refreshing={false} onRefresh={load} />} contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Link href="/leads" style={{ color: '#8f98a3' }}>← Leads</Link>
        <Text style={{ color: '#f5f7fa', fontSize: 30, fontWeight: '700' }}>{lead.person_name ?? 'Unknown customer'}</Text>
        <Text style={{ color: '#8f98a3' }}>{lead.phone ?? lead.email ?? 'No contact'} · {lead.assigned_user_name ?? 'Unassigned'}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable disabled={!lead.phone} onPress={() => lead.phone && Linking.openURL(`tel:${lead.phone}`)} style={{ flex: 1, backgroundColor: '#f5f7fa', padding: 13, borderRadius: 10 }}><Text style={{ textAlign: 'center', fontWeight: '700' }}>Call</Text></Pressable>
          <Pressable disabled={!lead.phone} onPress={() => lead.phone && Linking.openURL(`https://wa.me/${lead.phone.replace(/\D/g, '')}`)} style={{ flex: 1, borderWidth: 1, borderColor: '#333', padding: 13, borderRadius: 10 }}><Text style={{ color: '#f5f7fa', textAlign: 'center', fontWeight: '700' }}>WhatsApp</Text></Pressable>
        </View>

        <View style={{ backgroundColor: '#11151a', borderColor: '#242a31', borderWidth: 1, borderRadius: 12, padding: 15, gap: 11 }}>
          <Text style={{ color: '#f5f7fa', fontSize: 20, fontWeight: '700' }}>Lead details</Text>
          <Text style={{ color: '#8f98a3', fontSize: 12 }}>Pipeline stage</Text>
          <ScrollView horizontal contentContainerStyle={{ gap: 7 }}>
            {stages.map((stage) => choice(stage.name, edit.status_id === stage.id, () => setEdit((current) => ({ ...current, status_id: stage.id, pipeline_id: stage.pipeline_id })),))}
          </ScrollView>
          <Text style={{ color: '#8f98a3', fontSize: 12 }}>Temperature</Text>
          <View style={{ flexDirection: 'row', gap: 7 }}>
            {['cold', 'warm', 'hot'].map((value) => choice(value, edit.temperature === value, () => setEdit((current) => ({ ...current, temperature: value })),))}
          </View>
          <Text style={{ color: '#8f98a3', fontSize: 12 }}>Priority</Text>
          <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap' }}>
            {['low', 'normal', 'high', 'urgent'].map((value) => choice(value, edit.priority === value, () => setEdit((current) => ({ ...current, priority: value })),))}
          </View>
          <TextInput value={edit.notes} onChangeText={(value) => setEdit((current) => ({ ...current, notes: value }))} multiline placeholder="Customer context, objections, preferred projects..." placeholderTextColor="#59626d" style={{ color: '#f5f7fa', backgroundColor: '#0d1116', borderColor: '#303740', borderWidth: 1, borderRadius: 9, padding: 11, minHeight: 90, textAlignVertical: 'top' }} />
          <Pressable onPress={saveLead} disabled={saving} style={{ backgroundColor: '#f5f7fa', padding: 13, borderRadius: 10 }}><Text style={{ textAlign: 'center', fontWeight: '700' }}>{saving ? 'Saving…' : 'Save lead'}</Text></Pressable>
        </View>

        <View style={{ backgroundColor: '#11151a', borderColor: '#242a31', borderWidth: 1, borderRadius: 12, padding: 15, gap: 11 }}>
          <Text style={{ color: '#f5f7fa', fontSize: 20, fontWeight: '700' }}>Buyer requirement</Text>
          <Text style={{ color: '#8f98a3', fontSize: 12 }}>Type</Text>
          <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap' }}>{['buy', 'rent', 'resale', 'lease'].map((value) => choice(value, req.requirement_type === value, () => setR('requirement_type', value)))}</View>
          <Text style={{ color: '#8f98a3', fontSize: 12 }}>Purpose</Text>
          <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap' }}>{['', 'end_use', 'investment', 'rental_income', 'resale'].map((value) => choice(value || 'Any', req.purpose === value, () => setR('purpose', value)))}</View>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{numericKeys.map((key) => field(key.replaceAll('_', ' '), req[key], (value) => setR(key, value), true))}</View>
          <Text style={{ color: '#8f98a3', fontSize: 12 }}>Furnishing</Text>
          <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap' }}>{['', 'unfurnished', 'semi_furnished', 'fully_furnished'].map((value) => choice(value || 'Any', req.furnishing === value, () => setR('furnishing', value)))}</View>
          {field('Facing', req.preferred_facing, (value) => setR('preferred_facing', value), false, 'East, West...')}
          {field('Possession before', req.possession_before, (value) => setR('possession_before', value), false, 'YYYY-MM-DD')}
          <TextInput value={req.notes} onChangeText={(value) => setR('notes', value)} multiline placeholder="Location preferences, floor, amenities, constraints..." placeholderTextColor="#59626d" style={{ color: '#f5f7fa', backgroundColor: '#0d1116', borderColor: '#303740', borderWidth: 1, borderRadius: 9, padding: 11, minHeight: 80, textAlignVertical: 'top' }} />
          <Pressable onPress={saveRequirement} disabled={saving} style={{ backgroundColor: '#f5f7fa', padding: 13, borderRadius: 10 }}><Text style={{ textAlign: 'center', fontWeight: '700' }}>{saving ? 'Saving…' : 'Save requirement'}</Text></Pressable>
        </View>

        <Text style={{ color: '#f5f7fa', fontSize: 20, fontWeight: '700' }}>Next actions</Text>
        {tasks.map((task) => <View key={task.id} style={{ padding: 13, backgroundColor: '#11151a', borderRadius: 10 }}><Text style={{ color: '#f5f7fa', fontWeight: '600' }}>{task.title}</Text><Text style={{ color: '#68717c' }}>{task.task_type} · {new Date(task.scheduled_at).toLocaleString()}</Text></View>)}
        {tasks.length === 0 && <Text style={{ color: '#68717c' }}>No pending tasks.</Text>}
        <Text style={{ color: '#f5f7fa', fontSize: 20, fontWeight: '700' }}>Property matches</Text>
        {matches.map((match) => <View key={`${match.project_name}-${match.unit_number}-${match.rank}`} style={{ padding: 13, backgroundColor: '#11151a', borderRadius: 10, gap: 4 }}><Text style={{ color: '#f5f7fa', fontWeight: '700' }}>#{match.rank} · {match.project_name}</Text><Text style={{ color: '#a8b0ba' }}>{match.unit_number ?? 'Matched unit'} · {match.bedrooms ?? '—'} BHK · {match.area_sqft ?? '—'} sq ft</Text><Text style={{ color: '#68717c' }}>{match.location_name ?? 'Location pending'} · Score {Number(match.total_score).toFixed(0)}%</Text></View>)}
      </ScrollView>
    </SafeAreaView>
  )
}
