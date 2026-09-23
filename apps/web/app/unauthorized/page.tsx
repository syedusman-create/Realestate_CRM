import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, LayoutDashboard, ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-brand-cream px-5 py-10 text-brand-navy sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl items-center justify-center">
        <div className="w-full rounded-2xl border border-brand-navy/10 bg-white p-7 text-center shadow-xl shadow-brand-navy/5 sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-gold/25 bg-brand-gold/10">
            <ShieldAlert
              className="h-7 w-7 text-brand-gold-dark"
              aria-hidden="true"
            />
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Image
              src="/logo.png"
              alt="Global Enterprises"
              width={42}
              height={42}
              className="h-10 w-10 object-contain"
            />

            <div className="text-left">
              <p className="text-sm font-semibold tracking-[0.12em] text-brand-navy">
                GLOBAL ENTERPRISES
              </p>
              <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-brand-gold-dark">
                Real Estate CRM
              </p>
            </div>
          </div>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-brand-gold-dark">
            Access restricted
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-brand-navy">
            You don't have access to this workspace.
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-brand-navy/55">
            Your account is authenticated, but it does not currently have the
            role or permissions required to access this area.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-action text-action-foreground px-5 text-sm font-semibold text-brand-ivory transition-colors hover:bg-action text-action-foreground-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              Go to dashboard
            </Link>

            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-brand-navy/15 bg-white px-5 text-sm font-semibold text-brand-navy transition-colors hover:border-brand-gold/40 hover:bg-brand-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Return home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}