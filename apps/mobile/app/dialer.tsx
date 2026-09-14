import { useState } from 'react'
import { Linking, SafeAreaView, Text, View, Pressable } from 'react-native'
import type { DialerCapabilities, DialerQueueItem } from '@realestate-crm/dialer'

const capabilities: DialerCapabilities = {
  cellularCalling: true,
  callStateEvents: false,
  inboundCallEvents: false,
  continuousAutomaticDialing: false,
  backgroundExecution: false,
}

const demoQueue: DialerQueueItem[] = []

export default function DialerScreen() {
  const [running, setRunning] = useState(false)

  async function startCalling() {
    setRunning(true)
    // The queue/orchestrator will claim the next item from Supabase.
    // Actual continuous cellular automation is supplied by the platform-native transport.
  }

  async function openPhone() {
    await Linking.openURL('tel:')
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0d10' }}>
      <View style={{ flex: 1, padding: 24, gap: 18 }}>
        <Text style={{ color: '#f5f7fa', fontSize: 28, fontWeight: '700' }}>Campaign Dialer</Text>
        <Text style={{ color: '#a8b0ba', lineHeight: 22 }}>
          The CRM owns campaign queues, claiming, retries and call-event recording. The mobile transport handles what the OS and carrier allow.
        </Text>
        <View style={{ padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#242a31', gap: 8 }}>
          <Text style={{ color: '#f5f7fa', fontWeight: '600' }}>{running ? 'Session ready' : 'Session stopped'}</Text>
          <Text style={{ color: '#8f98a3' }}>Queued contacts: {demoQueue.length}</Text>
          <Text style={{ color: '#8f98a3' }}>Continuous automatic dialing: {capabilities.continuousAutomaticDialing ? 'available' : 'requires native transport'}</Text>
          <Text style={{ color: '#8f98a3' }}>Inbound call events: {capabilities.inboundCallEvents ? 'available' : 'requires native transport'}</Text>
        </View>
        <Pressable onPress={startCalling} style={{ backgroundColor: '#f5f7fa', padding: 14, borderRadius: 10 }}>
          <Text style={{ color: '#0b0d10', textAlign: 'center', fontWeight: '700' }}>Start dialer session</Text>
        </Pressable>
        <Pressable onPress={openPhone} style={{ borderWidth: 1, borderColor: '#333', padding: 14, borderRadius: 10 }}>
          <Text style={{ color: '#f5f7fa', textAlign: 'center' }}>Open phone</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
