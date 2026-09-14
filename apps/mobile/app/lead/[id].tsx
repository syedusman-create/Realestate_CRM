import { useEffect, useState } from 'react'
import { Link, useLocalSearchParams } from 'expo-router'
import { Alert, Linking, RefreshControl, SafeAreaView, ScrollView, Text, TextInput, View, Pressable } from 'react-native'
import { supabase } from '../../lib/supabase'

type Lead = { lead_id: string; person_name: string | null; phone: string | null; email: string | null; temperature: string | null; lead_score: number | null; stage_name: string | null; assigned_user_name: string | null; notes: string | null }
type LeadEdit = { priority: string; temperature: string; notes: string; status_id: string | null; pipeline_id: string | null }
type Stage = { id: string; name: string; pipeline_id: string }
type Requirement = { id: string; requirement_type: string; purpose: string | null; bedrooms_min: number | null; bedrooms_max: number | null; budget_min: number | null; budget_max: number | null; area_min_sqft: number | null; area_max_sqft: number | null; bathrooms_min: number | null; furnishing: string | null; preferred_facing: string | null; possession_before: string | null; parking_required: number | null; notes: string | null }
type Task = { id: string; title: string; task_type: string; scheduled_at: string; status: string; priority: string }
type Match = { project_name: string; developer_name: string | null; location_name: string | null; unit_number: string | null; bedrooms: number | null; area_sqft: number | null; price: number | null; total_score: number; rank: number }

const buttonStyle = { borderWidth: 1, borderColor: '#303740', borderRadius: 9, paddingVertical: 9, paddingHorizontal: 12 } as const

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [lead, setLead] = useState<Lead | null>(null)
  const [edit, setEdit] = useState<LeadEdit>({ priority: 'normal', temperature: 'cold', notes: '', status_id: null, pipeline_id: null })
  const [stages, setStages] = useState<Stage[]>([])
  const [requirement, setRequirement] = useState<Requirement | null>(null)
  const [req, setReq] = useState<Record<string, string>>({ requirement_type: 'buy', purpose: '', bedrooms_min: '', bedrooms_max: '', budget_min: '', budget_max: '', area_min_sqft: '', area_max_sqft: '', bathrooms_min: '', furnishing: '', preferred_facing: '', possession_before: '', parking_required: '', notes: '' })
  const [tasks, setTasks] = useState<Task[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [saving, setSaving] = useState(false)

  const setReqField = (key: string, value: string) => setReq((current) => ({ ...current, [key]: value }))
  const num = (value: string) => value.trim() ? Number(value) : null

  async function load() {
    if (!id) return
    const [{ data: leadData }, { data: leadRow }, { data: taskData }, { data: matchData }] = await Promise.all([
      supabase.from('lead_dashboard').select('lead_id, person_name, phone, email, temperature, lead_score, stage_name, assigned_user_name, notes').eq('lead_id', id).maybeSingle(),
      supabase.from('leads').select('priority, temperature, notes, status_id, pipeline_id').eq('id', id).maybeSingle(),
      supabase.from('tasks').select('id, title, task_type, scheduled_at, status, priority').eq('lead_id', id).in('status', ['pending', 'in_progress']).order('scheduled_at').limit(10),
      supabase.rpc('get_property_recommendations', { p_lead_id: id, p_limit: 5 }),
    ])
    setLead((leadData as Lead | null) ?? null)
    if (leadRow) setEdit({ priority: leadRow.priority ?? 'normal', temperature: leadRow.temperature ?? 'cold', notes: leadRow.notes ?? '', status_id: leadRow.status_id, pipeline_id: leadRow.pipeline_id })
    const pipelineId = leadRow?.pipeline_id
    if (pipelineId) {
      const { data } = await supabase.from('pipeline_stages').select('id, name, pipeline_id').eq('pipeline_id', pipelineId).order('order_index')
      setStages((data ?? []) as Stage[])
    } else setStages([])
    const { data: requirementData } = await supabase.from('requirements').select('id, requirement_type, purpose, bedrooms_min, bedrooms_max, budget_min, budget_max, area_min_sqft, area_max_sqft, bathrooms_min, furnishing, preferred_facing, possession_before, parking_required, notes').eq('lead_id', id).eq('is_active', true).order('created_at', { ascending: false }).limit(1).maybeSingle()
    const r = requirementData as Requirement | null
    setRequirement(r)
    if (r) setReq({ requirement_type: r.requirement_type, purpose: r.purpose ?? '', bedrooms_min: String(r.bedrooms_min ?? ''), bedrooms_max: String(r.bedrooms_max ?? ''), budget_min: String(r.budget_min ?? ''), budget_max: String(r.budget_max ?? ''), area_min_sqft: String(r.area_min_sqft ?? ''), area_max_sqft: String(r.area_max_sqft ?? ''), bathrooms_min: String(r.bathrooms_min ?? ''), furnishing: r.furnishing ?? '', preferred_facing: r.preferred_facing ?? '', possession_before: r.possession_before ?? '', parking_required: String(r.parking_required ?? ''), notes: r.notes ?? '' })
    setTasks((taskData ?? []) as Task[])
    setMatches((matchData ?? []) as Match[])
  }

  useEffect(() => { void load() }, [id])

  async function saveLead() {
    if (!id || !['low', 'normal', 'high', 'urgent'].includes(edit.priority) || !['cold', 'warm', 'hot'].includes(edit.temperature)) return
    setSaving(true)
    const { error } = await supabase.from('leads').update({ priority: edit.priority, temperature: edit.temperature, notes: edit.notes.trim() || null, status_id: edit.status_id, ...(edit.status_id ? { pipeline_id: edit.pipeline_id } : {}) }).eq('id', id)
    setSaving(false)
    if (error) return Alert.alert('Could not save lead', error.message)
    Alert.alert('Saved', 'Lead details updated.')
    void load()
  }

  async function saveRequirement() {
    if (!id) return
    const bedroomsMin = num(req.bedrooms_min); const bedroomsMax = num(req.bedrooms_max); const budgetMin = num(req.budget_min); const budgetMax = num(req.budget_max); const areaMin = num(req.area_min_sqft); const areaMax = num(req.area_max_sqft)
    if ([bedroomsMin, bedroomsMax, budgetMin, budgetMax, areaMin, areaMax, num(req.bathrooms_min), num(req.parking_required)].some((v) => v != null && (!Number.isFinite(v) || v < 0))) return Alert.alert('Invalid requirement', 'Numeric values must be zero or greater.')
    if (bedroomsMin != null && bedroomsMax != null && bedroomsMin > bedroomsMax) return Alert.alert('Invalid requirement', 'Minimum bedrooms cannot exceed maximum.')
    if (budgetMin != null && budgetMax != null && budgetMin > budgetMax) return Alert.alert('Invalid requirement', 'Minimum budget cannot exceed maximum.')
    if (areaMin != null && areaMax != null && areaMin > areaMax) return Alert.alert('Invalid requirement', 'Minimum area cannot exceed maximum.')
    setSaving(true)
    const payload = { lead_id: id, requirement_type: req.requirement_type, purpose: req.purpose || null, bedrooms_min: bedroomsMin, bedrooms_max: bedroomsMax, budget_min: budgetMin, budget_max: budgetMax, area_min_sqft: areaMin, area_max_sqft: areaMax, bathrooms_min: num(req.bathrooms_min), furnishing: req.furnishing || null, preferred_facing: req.preferred_facing.trim() || null, possession_before: req.possession_before || null, parking_required: num(req.parking_required), notes: req.notes.trim() || null, is_active: true, updated_at: new Date().toISOString() }
    const mutation = requirement ? await supabase.from('requirements').update(payload).eq('id', requirement.id) : await supabase.from('requirements').insert(payload)
    setSaving(false)
    if (mutation.error) return Alert.alert('Could not save requirement', mutation.error.message)
    Alert.alert('Saved', 'Buyer requirement updated.')
    void load()
  }

  if (!lead) return <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0d10', justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#8f98a3' }}>Loading lead…</Text></SafeAreaView>

  const Choice = ({ value, selected, onPress }: { value: string; selected: boolean; onPress: () => void }) => <Pressable onPress={onPress} style={[buttonStyle, selected && { backgroundColor: '#f5f7fa', borderColor: '#f5f7fa' }]}><Text style={{ color: selected ? '#0b0d10' : '#a8b0ba', fontWeight: '600' }}>{value.replace('_', ' ')}</Text></Pressable>
  const Field = ({ label, value, onChange, keyboardType = 'default', placeholder }: { label: string; value: string; onChange: (v: string) => void; keyboardType?: 'default' | 'numeric'; placeholder?: string }) => <View style={{ gap: 5, flex: 1, minWidth: 140 }}><Text style={{ color: '#8f98a3', fontSize: 12 }}>{label}</Text><TextInput value={value} onChangeText={onChange} keyboardType={keyboardType} placeholder={placeholder} placeholderTextColor="#59626d" style={{ color: '#f5f7fa', backgroundColor: '#0d1116', borderColor: '#303740', borderWidth: 1, borderRadius: 9, padding: 11 }} /></View>

  return <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0d10' }}><ScrollView refreshControl={<RefreshControl refreshing={false} onRefresh={load} />} contentContainerStyle={{ padding: 20, gap: 16 }}>
    <Link href="/leads" style={{ color: '#8f98a3' }}>← Leads</Link>
    <View style={{ gap: 5 }}><Text style={{ color: '#f5f7fa', fontSize: 30, fontWeight: '700' }}>{lead.person_name ?? 'Unknown customer'}</Text><Text style={{ color: '#8f98a3' }}>{lead.phone ?? lead.email ?? 'No contact'} · {lead.assigned_user_name ?? 'Unassigned'}</Text></View>
    <View style={{ flexDirection: 'row', gap: 8 }}><Pressable disabled={!lead.phone} onPress={() => lead.phone && Linking.openURL(`tel:${lead.phone}`)} style={{ flex: 1, backgroundColor: '#f5f7fa', padding: 13, borderRadius: 10 }}><Text style={{ textAlign: 'center', fontWeight: '700' }}>Call</Text></Pressable><Pressable disabled={!lead.phone} onPress={() => lead.phone && Linking.openURL(`https://wa.me/${lead.phone.replace(/\D/g, '')}`)} style={{ flex: 1, borderWidth: 1, borderColor: '#333', padding: 13, borderRadius: 10 }}><Text style={{ color: '#f5f7fa', textAlign: 'center', fontWeight: '700' }}>WhatsApp</Text></Pressable></View>

    <View style={{ backgroundColor: '#11151a', borderColor: '#242a31', borderWidth: 1, borderRadius: 12, padding: 15, gap: 12 }}><Text style={{ color: '#f5f7fa', fontSize: 20, fontWeight: '700' }}>Lead details</Text><Text style={{ color: '#8f98a3', fontSize: 12 }}>Pipeline stage</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7 }}>{stages.map((stage) => <Choice key={stage.id} value={stage.name} selected={edit.status_id === stage.id} onPress={() => setEdit((v) => ({ ...v, status_id: stage.id, pipeline_id: stage.pipeline_id }))} />)}</ScrollView><Text style={{ color: '#8f98a3', fontSize: 12 }}>Temperature</Text><View style={{ flexDirection: 'row', gap: 7 }}><Choice value="cold" selected={edit.temperature === 'cold'} onPress={() => setEdit((v) => ({ ...v, temperature: 'cold' }))} /><Choice value="warm" selected={edit.temperature === 'warm'} onPress={() => setEdit((v) => ({ ...v, temperature: 'warm' }))} /><Choice value="hot" selected={edit.temperature === 'hot'} onPress={() => setEdit((v) => ({ ...v, temperature: 'hot' }))} /></View><Text style={{ color: '#8f98a3', fontSize: 12 }}>Priority</Text><View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap' }}>{['low', 'normal', 'high', 'urgent'].map((v) => <Choice key={v} value={v} selected={edit.priority === v} onPress={() => setEdit((x) => ({ ...x, priority: v }))} />)}</View><TextInput value={edit.notes} onChangeText={(notes) => setEdit((v) => ({ ...v, notes }))} multiline numberOfLines={4} placeholder="Customer context, objections, preferred projects..." placeholderTextColor="#59626d" style={{ color: '#f5f7fa', backgroundColor: '#0d1116', borderColor: '#303740', borderWidth: 1, borderRadius: 9, padding: 11, minHeight: 90, textAlignVertical: 'top' }} /><Pressable onPress={saveLead} disabled={saving} style={{ backgroundColor: '#f5f7fa', padding: 13, borderRadius: 10 }}><Text style={{ textAlign: 'center', fontWeight: '700' }}>{saving ? 'Saving…' : 'Save lead'}</Text></Pressable></View>

    <View style={{ backgroundColor: '#11151a', borderColor: '#242a31', borderWidth: 1, borderRadius: 12, padding: 15, gap: 12 }}><Text style={{ color: '#f5f7fa', fontSize: 20, fontWeight: '700' }}>Buyer requirement</Text><Text style={{ color: '#8f98a3', fontSize: 12 }}>Type</Text><View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap' }}>{['buy', 'rent', 'resale', 'lease'].map((v) => <Choice key={v} value={v} selected={req.requirement_type === v} onPress={() => setReqField('requirement_type', v)} />)}</View><Text style={{ color: '#8f98a3', fontSize: 12 }}>Purpose</Text><View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap' }}>{['', 'end_use', 'investment', 'rental_income', 'resale'].map((v) => <Choice key={v || 'any'} value={v || 'not specified'} selected={req.purpose === v} onPress={() => setReqField('purpose', v)} />)}</View><View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}><Field label="Bedrooms min" value={req.bedrooms_min} onChange={(v) => setReqField('bedrooms_min', v)} keyboardType="numeric" /><Field label="Bedrooms max" value={req.bedrooms_max} onChange={(v) => setReqField('bedrooms_max', v)} keyboardType="numeric" /><Field label="Bathrooms" value={req.bathrooms_min} onChange={(v) => setReqField('bathrooms_min', v)} keyboardType="numeric" /></View><View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}><Field label="Budget min (₹)" value={req.budget_min} onChange={(v) => setReqField('budget_min', v)} keyboardType="numeric" /><Field label="Budget max (₹)" value={req.budget_max} onChange={(v) => setReqField('budget_max', v)} keyboardType="numeric" /></View><View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}><Field label="Area min (sq ft)" value={req.area_min_sqft} onChange={(v) => setReqField('area_min_sqft', v)} keyboardType="numeric" /><Field label="Area max (sq ft)" value={req.area_max_sqft} onChange={(v) => setReqField('area_max_sqft', v)} keyboardType="numeric" /><Field label="Parking" value={req.parking_required} onChange={(v) => setReqField('parking_required', v)} keyboardType="numeric" /></View><Text style={{ color: '#8f98a3', fontSize: 12 }}>Furnishing</Text><View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap' }}>{['', 'unfurnished', 'semi_furnished', 'fully_furnished'].map((v) => <Choice key={v || 'any'} value={v || 'any'} selected={req.furnishing === v} onPress={() => setReqField('furnishing', v)} />)}</View><Field label="Facing" value={req.preferred_facing} onChange={(v) => setReqField('preferred_facing', v)} placeholder="East, West..." /><Field label="Possession before" value={req.possession_before} onChange={(v) => setReqField('possession_before', v)} placeholder="YYYY-MM-DD" /><TextInput value={req.notes} onChangeText={(v) => setReqField('notes', v)} multiline placeholder="Location preferences, floor, amenities, constraints..." placeholderTextColor="#59626d" style={{ color: '#f5f7fa', backgroundColor: '#0d1116', borderColor: '#303740', borderWidth: 1, borderRadius: 9, padding: 11, minHeight: 80, textAlignVertical: 'top' }} /><Pressable onPress={saveRequirement} disabled={saving} style={{ backgroundColor: '#f5f7fa', padding: 13, borderRadius: 10 }}><Text style={{ textAlign: 'center', fontWeight: '700' }}>{saving ? 'Saving…' : 'Save requirement'}</Text></Pressable></View>

    <View style={{ gap: 8 }}><Text style={{ color: '#f5f7fa', fontSize: 20, fontWeight: '700' }}>Next actions</Text>{tasks.map((task) => <View key={task.id} style={{ padding: 13, backgroundColor: '#11151a', borderRadius: 10 }}><Text style={{ color: '#f5f7fa', fontWeight: '600' }}>{task.title}</Text><Text style={{ color: '#68717c' }}>{task.task_type} · {new Date(task.scheduled_at).toLocaleString()}</Text></View>)}{tasks.length === 0 ? <Text style={{ color: '#68717c' }}>No pending tasks.</Text> : null}</View>
    <View style={{ gap: 8 }}><Text style={{ color: '#f5f7fa', fontSize: 20, fontWeight: '700' }}>Property matches</Text>{matches.map((match) => <View key={`${match.project_name}-${match.unit_number}-${match.rank}`} style={{ padding: 13, backgroundColor: '#11151a', borderRadius: 10, gap: 4 }}><Text style={{ color: '#f5f7fa', fontWeight: '700' }}>#{match.rank} · {match.project_name}</Text><Text style={{ color: '#a8b0ba' }}>{match.unit_number ?? 'Matched unit'} · {match.bedrooms ?? '—'} BHK · {match.area_sqft ?? '—'} sq ft</Text><Text style={{ color: '#68717c' }}>{match.location_name ?? 'Location pending'} · Score {Number(match.total_score).toFixed(0)}%</Text></View>)}{matches.length === 0 ? <Text style={{ color: '#68717c' }}>No matches available.</Text> : null}</View>
  </ScrollView></SafeAreaView>
}
