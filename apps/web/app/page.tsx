import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 48 }}>
      <p style={{ opacity: 0.6 }}>REAL ESTATE CRM</p>
      <h1 style={{ fontSize: 48, margin: '12px 0' }}>One operating system for real estate sales.</h1>
      <p style={{ maxWidth: 680, lineHeight: 1.7, opacity: 0.75 }}>
        Leads, calling, follow-ups, inventory, property matching and team performance on one tenant-safe platform.
      </p>
      <Link href="/login" style={{ display: 'inline-block', marginTop: 24, padding: '12px 18px', border: '1px solid #333', borderRadius: 10 }}>
        Sign in
      </Link>
    </main>
  )
}
