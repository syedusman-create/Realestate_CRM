import { useEffect, useState } from 'react'
import { Link, useLocalSearchParams } from 'expo-router'
import { Linking, RefreshControl, SafeAreaView, ScrollView, Text, View, Pressable } from 'react-native'
import { supabase } from '../../lib/supabase'

type Lead = { lead_id: string; person_name: string | null; phone: string | null; email: string | null; temperature: string | null; lead_score: number | null; stage_name: string | null; assigned_user_name: string | null; notes: string | null }
type Task = { id: string; title: string; task_type: string; scheduled_at: string; status: string; priority: string }
type Match = { project_name: string; developer_name: string | null; location_name: string | null; unit_number: string | null; bedrooms: number | null; area_sqft: number | null; price: number | null; total_score: number; rank: number }

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [lead, setLead] = useState<Lead | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [matches, setMatches] = useState<Match[]>([])

  async function load() {
    if (!id) return
    const [{ data: leadData }, { data: taskData }, { data: matchData }] = await Promise.all([
      supabase.from('lead_dashboard').select('lead_id, person_name, phone, email, temperature, lead_score, stage_name, assigned_user_name, notes').eq('lead_id', id).maybeSingle(),
      supabase.from('tasks').select('id, title, task_type, scheduled_at, status, priority').eq('lead_id', id).in('status', ['pending', 'in_progress']).order('scheduled_at').limit(10),
      supabase.rpc('get_property_recommendations', { p_lead_id: id, p_limit: 5 }),
    ])
    setLead((leadData as Lead | null) ?? null)
    setTasks((taskData ?? []) as Task[])
    setMatches((matchData ?? []) as Match[])
  }

  useEffect(() => { void load() }, [id])

  if (!lead) return <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0d10', justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#8f98a3' }}>Loading lead…</Text></SafeAreaView>

  return <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0d10' }}><ScrollView refreshControl={<RefreshControl refreshing={false} onRefresh={load} />} contentContainerStyle={{ padding: 20, gap: 14 }}>
    <Link href="/leads" style={{ color: '#8f98a3' }}>← Leads</Link>
    <View style={{ gap: 5 }}><Text style={{ color: '#f5f7fa', fontSize: 30, fontWeight: '700' }}>{lead.person_name ?? 'Unknown customer'}</Text><Text style={{ color: '#8f98a3' }}>{lead.phone ?? lead.email ?? 'No contact'} · {lead.assigned_user_name ?? 'Unassigned'}</Text></View>
    <View style={{ flexDirection: 'row', gap: 8 }}><Pressable disabled={!lead.phone} onPress={() => lead.phone && Linking.openURL(`tel:${lead.phone}`)} style={{ flex: 1, backgroundColor: '#f5f7fa', padding: 13, borderRadius: 10 }}><Text style={{ textAlign: 'center', fontWeight: '700' }}>Call</Text></Pressable><Pressable disabled={!lead.phone} onPress={() => lead.phone && Linking.openURL(`https://wa.me/${lead.phone.replace(/\D/g, '')}`)} style={{ flex: 1, borderWidth: 1, borderColor: '#333', padding: 13, borderRadius: 10 }}><Text style={{ color: '#f5f7fa', textAlign: 'center', fontWeight: '700' }}>WhatsApp</Text></Pressable></View>
    <View style={{ backgroundColor: '#11151a', borderColor: '#242a31', borderWidth: 1, borderRadius: 12, padding: 15, gap: 8 }}><Text style={{ color: '#f5f7fa', fontWeight: '700' }}>Lead status</Text><Text style={{ color: '#a8b0ba' }}>{lead.temperature ?? 'cold'} · {lead.stage_name ?? 'Unqualified'}{lead.lead_score != null ? ` · Score ${lead.lead_score}` : ''}</Text><Text style={{ color: '#68717c' }}>{lead.notes || 'No notes'}</Text></View>
    <View style={{ gap: 8 }}><Text style={{ color: '#f5f7fa', fontSize: 20, fontWeight: '700' }}>Next actions</Text>{tasks.map((task) => <View key={task.id} style={{ padding: 13, backgroundColor: '#11151a', borderRadius: 10 }}><Text style={{ color: '#f5f7fa', fontWeight: '600' }}>{task.title}</Text><Text style={{ color: '#68717c' }}>{task.task_type} · {new Date(task.scheduled_at).toLocaleString()}</Text></View>)}{tasks.length === 0 ? <Text style={{ color: '#68717c' }}>No pending tasks.</Text> : null}</View>
    <View style={{ gap: 8 }}><Text style={{ color: '#f5f7fa', fontSize: 20, fontWeight: '700' }}>Property matches</Text>{matches.map((match) => <View key={`${match.project_name}-${match.unit_number}-${match.rank}`} style={{ padding: 13, backgroundColor: '#11151a', borderRadius: 10, gap: 4 }}><Text style={{ color: '#f5f7fa', fontWeight: '700' }}>#{match.rank} · {match.project_name}</Text><Text style={{ color: '#a8b0ba' }}>{match.unit_number ?? 'Matched unit'} · {match.bedrooms ?? '—'} BHK · {match.area_sqft ?? '—'} sq ft</Text><Text style={{ color: '#68717c' }}>{match.location_name ?? 'Location pending'} · Score {Number(match.total_score).toFixed(0)}%</Text></View>)}{matches.length === 0 ? <Text style={{ color: '#68717c' }}>No matches available.</Text> : null}</View>
  </ScrollView></SafeAreaView>
}
