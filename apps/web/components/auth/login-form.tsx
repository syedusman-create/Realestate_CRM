'use client'

import Link from 'next/link'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'

export function LoginForm() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    router.replace('/dashboard')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-8 lg:hidden">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand-gold/25 bg-brand-gold/10">
            <span className="text-sm font-bold text-brand-gold-dark">GE</span>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[0.12em] text-brand-navy">
              GLOBAL ENTERPRISES
            </p>
            <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-brand-gold-dark">
              Real Estate CRM
            </p>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold-dark">
          Workspace access
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-brand-navy">
          Welcome back.
        </h1>

        <p className="mt-3 text-sm leading-6 text-brand-navy/55">
          Sign in to continue to your Global Enterprises workspace.
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-brand-navy"
          >
            Work email
          </label>

          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-navy/35"
              aria-hidden="true"
            />

            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="h-11 border-brand-navy/15 bg-white pl-10 pr-3 text-brand-navy placeholder:text-brand-navy/35 focus-visible:border-brand-gold focus-visible:ring-brand-gold/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-brand-navy"
            >
              Password
            </label>
          </div>

          <div className="relative">
            <LockKeyhole
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-navy/35"
              aria-hidden="true"
            />

            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="h-11 border-brand-navy/15 bg-white pl-10 pr-11 text-brand-navy placeholder:text-brand-navy/35 focus-visible:border-brand-gold focus-visible:ring-brand-gold/20"
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-brand-navy/40 transition-colors hover:bg-action text-action-foreground/5 hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
          >
            {error}
          </div>
        ) : null}

        <button
          disabled={loading}
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-action text-action-foreground px-5 text-sm font-semibold text-brand-ivory shadow-sm transition-all hover:bg-action text-action-foreground-soft hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
        >
          {loading ? 'Signing in…' : 'Sign in to workspace'}
        </button>
      </form>

      <div className="mt-8 border-t border-brand-navy/10 pt-6">
        <p className="text-center text-xs leading-5 text-brand-navy/45">
          Access is managed by your Global Enterprises workspace administrator.
        </p>

        <Link
          href="/"
          className="mt-4 block text-center text-sm font-semibold text-brand-gold-dark transition-colors hover:text-brand-navy"
        >
          Return to Global Enterprises
        </Link>
      </div>
    </div>
  )
}