import { createClient } from '../../lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub as string | undefined

  if (!userId) {
    return <main style={{ padding: 48 }}><h1>Unauthorized</h1><Link href="/login">Sign in</Link></main>
  }

  const { data: profile } = await supabase.from('users').select('full_name, role').eq('id', userId).maybeSingle()

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: 32 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><p style={{ opacity: 0.6 }}>DASHBOARD</p><h1 style={{ margin: 0 }}>Welcome, {profile?.full_name ?? 'there'}</h1></div>
        <span style={{ opacity: 0.65 }}>{profile?.role ?? 'authenticated'}</span>
      </header>
      <section style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          ['Leads', 'Lead workspace'],
          ['Calls', 'Calling activity'],
          ['Properties', 'Inventory'],
          ['Tasks', 'Today & overdue'],
        ].map(([title, subtitle]) => <div key={title} style={{ padding: 20, border: '1px solid #242a31', borderRadius: 12, background: '#11151a' }}><strong>{title}</strong><p style={{ opacity: 0.6 }}>{subtitle}</p></div>)}
      </section>
      <section style={{ marginTop: 32, padding: 20, border: '1px solid #242a31', borderRadius: 12 }}>
        <h2>Foundation</h2>
        <p style={{ opacity: 0.7 }}>Supabase authentication and tenant-aware data access are connected. The next application slice is Leads + Calling + the mobile dialer.</p>
      </section>
    </main>
  )
}
