import { Link } from 'expo-router'
import { SafeAreaView, Text, View, Pressable } from 'react-native'

export default function MobileHome() {
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0d10' }}><View style={{ flex: 1, padding: 24, gap: 12 }}>
    <Text style={{ color: '#8f98a3', fontSize: 15 }}>REAL ESTATE CRM</Text><Text style={{ color: '#f5f7fa', fontSize: 34, fontWeight: '700', marginBottom: 8 }}>Field sales, built for mobile.</Text><Text style={{ color: '#a8b0ba', fontSize: 16, lineHeight: 24, marginBottom: 12 }}>Leads, calls, follow-ups, properties and campaign dialer in one mobile workspace.</Text>
    <Link href="/leads" asChild><Pressable style={{ backgroundColor: '#f5f7fa', padding: 14, borderRadius: 10 }}><Text style={{ color: '#0b0d10', textAlign: 'center', fontWeight: '700' }}>Leads</Text></Pressable></Link>
    <Link href="/tasks" asChild><Pressable style={{ borderWidth: 1, borderColor: '#333', padding: 14, borderRadius: 10 }}><Text style={{ color: '#f5f7fa', textAlign: 'center', fontWeight: '700' }}>Tasks</Text></Pressable></Link>
    <Link href="/dialer" asChild><Pressable style={{ borderWidth: 1, borderColor: '#333', padding: 14, borderRadius: 10 }}><Text style={{ color: '#f5f7fa', textAlign: 'center', fontWeight: '700' }}>Campaign dialer</Text></Pressable></Link>
  </View></SafeAreaView>
}
