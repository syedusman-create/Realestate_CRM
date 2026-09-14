import { Link } from 'expo-router'
import { SafeAreaView, Text, View } from 'react-native'

export default function MobileHome() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0d10' }}>
      <View style={{ flex: 1, padding: 24, gap: 18 }}>
        <Text style={{ color: '#f5f7fa', fontSize: 16, opacity: 0.6 }}>REAL ESTATE CRM</Text>
        <Text style={{ color: '#f5f7fa', fontSize: 34, fontWeight: '700' }}>Field sales, built for mobile.</Text>
        <Text style={{ color: '#a8b0ba', fontSize: 16, lineHeight: 24 }}>
          Leads, calls, follow-ups, properties and the campaign dialer from one mobile workspace.
        </Text>
        <Link href="/dialer" style={{ color: '#0b0d10', backgroundColor: '#f5f7fa', padding: 14, borderRadius: 10, textAlign: 'center', marginTop: 12 }}>
          Open campaign dialer
        </Link>
      </View>
    </SafeAreaView>
  )
}
