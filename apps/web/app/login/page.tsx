'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (signInError) {
      setError(signInError.message)
      return
    }
    router.replace('/dashboard')
    router.refresh()
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 420, display: 'grid', gap: 14 }}>
        <div>
          <p style={{ opacity: 0.6 }}>REAL ESTATE CRM</p>
          <h1>Sign in</h1>
        </div>
        <input aria-label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email" style={{ padding: 12, borderRadius: 8, border: '1px solid #333', background: '#11151a', color: 'inherit' }} />
        <input aria-label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={{ padding: 12, borderRadius: 8, border: '1px solid #333', background: '#11151a', color: 'inherit' }} />
        {error && <p style={{ color: '#ff8b8b' }}>{error}</p>}
        <button disabled={loading} type="submit" style={{ padding: 12, borderRadius: 8, border: 0, background: '#f5f7fa', color: '#0b0d10', cursor: 'pointer' }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
