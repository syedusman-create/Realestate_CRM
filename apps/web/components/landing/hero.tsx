import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  PhoneCall,
  Sparkles,
} from 'lucide-react'

export function Hero() {
  return (
    <section
      id="platform"
      className="relative overflow-hidden border-b border-brand-navy/10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(198,161,91,0.16),transparent_34%)]" />
      <div className="absolute -right-32 top-20 h-80 w-80 rounded-full border border-brand-gold/20" />
      <div className="absolute -right-20 top-32 h-56 w-56 rounded-full border border-brand-gold/15" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-28">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-white/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold-dark">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Real estate sales platform
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-brand-navy sm:text-5xl lg:text-6xl">
            One operating system for{' '}
            <span className="text-brand-gold-dark">real estate sales.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-brand-navy/65 sm:text-lg">
            Bring leads, conversations, opportunities, property inventory,
            matching and team performance into one connected workspace built
            for modern real estate teams.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-md bg-action text-action-foreground px-6 text-sm font-semibold text-brand-ivory shadow-lg shadow-brand-navy/10 transition-all hover:-translate-y-0.5 hover:bg-action text-action-foreground-soft hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
            >
              Enter your workspace
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>

            <a
              href="#capabilities"
              className="inline-flex h-12 items-center justify-center rounded-md border border-brand-navy/15 bg-white/60 px-6 text-sm font-semibold text-brand-navy transition-colors hover:border-brand-gold/50 hover:bg-white"
            >
              Explore the platform
            </a>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-brand-navy/60">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2
                className="h-4 w-4 text-brand-gold-dark"
                aria-hidden="true"
              />
              Tenant-aware workspace
            </span>

            <span className="inline-flex items-center gap-2">
              <CheckCircle2
                className="h-4 w-4 text-brand-gold-dark"
                aria-hidden="true"
              />
              Sales-focused workflows
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-2xl border border-brand-navy/10 bg-action text-action-foreground p-5 shadow-2xl shadow-brand-navy/15 sm:p-7">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-brand-gold/10 blur-3xl" />

            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-gold-light">
                    Sales workspace
                  </p>
                  <p className="mt-1 text-lg font-semibold text-brand-ivory">
                    Today's overview
                  </p>
                </div>

                <Image
                  src="/logo.png"
                  alt=""
                  width={44}
                  height={44}
                  className="h-10 w-10 object-contain opacity-90"
                  aria-hidden="true"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard
                  icon={<Building2 className="h-4 w-4" />}
                  label="Active inventory"
                  value="124"
                />

                <MetricCard
                  icon={<PhoneCall className="h-4 w-4" />}
                  label="Conversations"
                  value="68"
                />

                <MetricCard
                  icon={<BarChart3 className="h-4 w-4" />}
                  label="Open opportunities"
                  value="31"
                />

                <MetricCard
                  icon={<Sparkles className="h-4 w-4" />}
                  label="Matches generated"
                  value="47"
                />
              </div>

              <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-brand-ivory/50">
                      Pipeline activity
                    </p>
                    <p className="mt-1 text-sm font-semibold text-brand-ivory">
                      Strong activity this week
                    </p>
                  </div>

                  <span className="rounded-full bg-brand-gold/15 px-2.5 py-1 text-[11px] font-semibold text-brand-gold-light">
                    Live
                  </span>
                </div>

                <div className="mt-5 flex h-24 items-end gap-2">
                  {[35, 48, 42, 64, 58, 76, 88, 70, 94, 82, 100, 91].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t-sm bg-brand-gold/70 transition-all"
                        style={{ height: `${height}%` }}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-brand-gold/20 bg-brand-cream px-4 py-3 shadow-xl sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-gold-dark">
              Connected workspace
            </p>
            <p className="mt-1 text-sm font-semibold text-brand-navy">
              Leads → Deals → Inventory
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.055] p-4">
      <div className="flex items-center gap-2 text-brand-gold-light">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-brand-ivory/45">
          {label}
        </span>
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-brand-ivory">
        {value}
      </p>
    </div>
  )
}