import { useCallback, useEffect, useState } from 'react'
import { Link } from 'expo-router'
import { RefreshControl, SafeAreaView, ScrollView, Text, View } from 'react-native'
import { supabase } from '../lib/supabase'

type Task = { id: string; title: string; task_type: string; scheduled_at: string; due_at: string | null; status: string; priority: string; lead_id: string | null }

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => { setLoading(true); const { data } = await supabase.from('tasks').select('id, title, task_type, scheduled_at, due_at, status, priority, lead_id').in('status', ['pending', 'in_progress']).order('scheduled_at').limit(100); setTasks((data ?? []) as Task[]); setLoading(false) }, [])
  useEffect(() => { void load() }, [load])
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0d10' }}><ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />} contentContainerStyle={{ padding: 20, gap: 12 }}><Text style={{ color: '#f5f7fa', fontSize: 30, fontWeight: '700' }}>Tasks</Text><Text style={{ color: '#8f98a3' }}>Pending calls and follow-ups assigned to you.</Text>{tasks.map((task) => <View key={task.id} style={{ backgroundColor: '#11151a', borderColor: '#242a31', borderWidth: 1, borderRadius: 12, padding: 14, gap: 5 }}><Text style={{ color: '#f5f7fa', fontWeight: '700' }}>{task.title}</Text><Text style={{ color: '#a8b0ba' }}>{task.task_type} · {task.priority} · {new Date(task.scheduled_at).toLocaleString()}</Text>{task.lead_id ? <Link href={{ pathname: '/lead/[id]', params: { id: task.lead_id } }} style={{ color: '#f5f7fa', marginTop: 4 }}>Open lead →</Link> : null}</View>)}{!loading && tasks.length === 0 ? <Text style={{ color: '#68717c', textAlign: 'center', padding: 30 }}>No pending tasks.</Text> : null}</ScrollView></SafeAreaView>
}
