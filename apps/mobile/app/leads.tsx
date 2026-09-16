import { useCallback, useEffect, useState } from 'react'
import { Link } from 'expo-router'
import { RefreshControl, SafeAreaView, ScrollView, Text, TextInput, View, Pressable } from 'react-native'
import { supabase } from '../lib/supabase'

type Lead = { lead_id: string; person_name: string | null; phone: string | null; email: string | null; temperature: string | null; lead_score: number | null; stage_name: string | null; assigned_user_name: string | null; last_contact_at: string | null }

export default function LeadsScreen() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    let request = supabase.from('lead_dashboard').select('lead_id, person_name, phone, email, temperature, lead_score, stage_name, assigned_user_name, last_contact_at').order('last_contact_at', { ascending: false, nullsFirst: false }).limit(50)
    const value = query.trim()
    if (value) request = request.or(`person_name.ilike.%${value}%,phone.ilike.%${value}%,email.ilike.%${value}%`)
    const { data } = await request
    setLeads((data ?? []) as Lead[])
    setLoading(false)
  }, [query])

  useEffect(() => { void load() }, [load])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0d10' }}>
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />} contentContainerStyle={{ padding: 20, gap: 12 }}>
        <View style={{ gap: 4 }}><Text style={{ color: '#f5f7fa', fontSize: 30, fontWeight: '700' }}>Leads</Text><Text style={{ color: '#8f98a3' }}>Your assigned customer workspace.</Text></View>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search name, phone or email" placeholderTextColor="#68717c" style={{ backgroundColor: '#15191e', borderColor: '#2a3037', borderWidth: 1, borderRadius: 10, padding: 13, color: '#f5f7fa' }} />
        {leads.map((lead) => <Link key={lead.lead_id} href={{ pathname: '/lead/[id]', params: { id: lead.lead_id } }} asChild><Pressable style={{ backgroundColor: '#11151a', borderWidth: 1, borderColor: '#242a31', borderRadius: 12, padding: 15, gap: 7 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><Text style={{ color: '#f5f7fa', fontSize: 17, fontWeight: '700', flex: 1 }}>{lead.person_name ?? 'Unknown customer'}</Text><Text style={{ color: '#a8b0ba' }}>{lead.temperature ?? 'cold'}</Text></View><Text style={{ color: '#a8b0ba' }}>{lead.phone ?? lead.email ?? 'No contact'}</Text><Text style={{ color: '#68717c' }}>{lead.stage_name ?? 'Unqualified'} · {lead.assigned_user_name ?? 'Unassigned'}{lead.lead_score != null ? ` · Score ${lead.lead_score}` : ''}</Text></Pressable></Link>)}
        {!loading && leads.length === 0 ? <Text style={{ color: '#68717c', textAlign: 'center', padding: 30 }}>No leads found.</Text> : null}
      </ScrollView>
    </SafeAreaView>
  )
}
