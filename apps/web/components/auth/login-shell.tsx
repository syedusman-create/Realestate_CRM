import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  BarChart3,
  Building2,
  UsersRound,
} from 'lucide-react'

export function LoginShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-brand-cream lg:grid lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative hidden overflow-hidden bg-action text-action-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-brand-gold/15" />
        <div className="absolute -right-16 top-24 h-64 w-64 rounded-full border border-brand-gold/10" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-brand-gold/5 blur-3xl" />

        <div className="relative p-10 xl:p-14">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          >
            <Image
              src="/logo.png"
              alt="Global Enterprises"
              width={52}
              height={52}
              className="h-12 w-12 object-contain"
              priority
            />

            <div>
              <p className="text-sm font-semibold tracking-[0.16em] text-brand-ivory">
                GLOBAL ENTERPRISES
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-brand-gold-light">
                Real Estate CRM
              </p>
            </div>
          </Link>
        </div>

        <div className="relative px-10 pb-14 xl:px-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold-light">
            Your workspace
          </p>

          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight tracking-[-0.035em] text-brand-ivory xl:text-5xl">
            Keep your sales operation connected from lead to closing.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-brand-ivory/55">
            Access leads, opportunities, property inventory, calling,
            matching, imports and reporting from one workspace.
          </p>

          <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
            <LoginFeature
              icon={<UsersRound className="h-4 w-4" />}
              label="Leads"
            />

            <LoginFeature
              icon={<Building2 className="h-4 w-4" />}
              label="Inventory"
            />

            <LoginFeature
              icon={<BarChart3 className="h-4 w-4" />}
              label="Reporting"
            />
          </div>
        </div>
      </section>

      <section className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8 lg:justify-end lg:px-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-navy/60 transition-colors hover:text-brand-navy lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Home
          </Link>

          <p className="text-xs font-medium text-brand-navy/40">
            Secure workspace access
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-12 pt-4 sm:px-8 lg:px-12 lg:py-16">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </section>
    </main>
  )
}

function LoginFeature({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.045] px-3 py-3">
      <span className="text-brand-gold-light">{icon}</span>
      <span className="text-xs font-medium text-brand-ivory/70">{label}</span>
    </div>
  )
}