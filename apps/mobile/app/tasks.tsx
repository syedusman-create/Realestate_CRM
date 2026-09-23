import { useCallback, useEffect, useState } from 'react'
import { Link } from 'expo-router'
import { Alert, RefreshControl, SafeAreaView, ScrollView, Text, View, Pressable } from 'react-native'
import { supabase } from '../lib/supabase'

type Task = { id: string; title: string; task_type: string; scheduled_at: string; due_at: string | null; status: string; priority: string; lead_id: string | null }

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const load = useCallback(async () => { setLoading(true); const { data, error } = await supabase.from('tasks').select('id, title, task_type, scheduled_at, due_at, status, priority, lead_id').in('status', ['pending', 'in_progress']).order('scheduled_at').limit(100); if (error) Alert.alert('Could not load tasks', error.message); setTasks((data ?? []) as Task[]); setLoading(false) }, [])
  useEffect(() => { void load() }, [load])
  async function completeTask(taskId: string) { setBusyId(taskId); const { error } = await supabase.from('tasks').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', taskId); setBusyId(null); if (error) { Alert.alert('Could not complete task', error.message); return }; setTasks((current) => current.filter((task) => task.id !== taskId)) }
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0d10' }}><ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />} contentContainerStyle={{ padding: 20, gap: 12 }}><Text style={{ color: '#f5f7fa', fontSize: 30, fontWeight: '700' }}>Tasks</Text><Text style={{ color: '#8f98a3' }}>Pending calls and follow-ups assigned to you.</Text>{tasks.map((task) => <View key={task.id} style={{ backgroundColor: '#11151a', borderColor: '#242a31', borderWidth: 1, borderRadius: 12, padding: 14, gap: 7 }}><Text style={{ color: '#f5f7fa', fontWeight: '700' }}>{task.title}</Text><Text style={{ color: '#a8b0ba' }}>{task.task_type} · {task.priority} · {new Date(task.scheduled_at).toLocaleString()}</Text><View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>{task.lead_id ? <Link href={{ pathname: '/lead/[id]', params: { id: task.lead_id } }} style={{ color: '#f5f7fa', marginTop: 4, flex: 1 }}>Open lead →</Link> : <View style={{ flex: 1 }} />}<Pressable disabled={busyId === task.id} onPress={() => void completeTask(task.id)} style={{ backgroundColor: '#f5f7fa', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 8, opacity: busyId === task.id ? 0.5 : 1 }}><Text style={{ color: '#0b0d10', fontWeight: '700' }}>{busyId === task.id ? 'Saving…' : 'Complete'}</Text></Pressable></View></View>)}{!loading && tasks.length === 0 ? <Text style={{ color: '#68717c', textAlign: 'center', padding: 30 }}>No pending tasks.</Text> : null}</ScrollView></SafeAreaView>
}
