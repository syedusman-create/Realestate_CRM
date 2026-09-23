import {
  BarChart3,
  Building2,
  FileSpreadsheet,
  GitBranch,
  PhoneCall,
  Sparkles,
} from 'lucide-react'

const features = [
  {
    icon: GitBranch,
    title: 'Lead management',
    description:
      'Organize prospects, ownership, priorities and follow-up activity in one focused sales workflow.',
  },
  {
    icon: Building2,
    title: 'Property inventory',
    description:
      'Keep projects, configurations and units structured so your sales team can work from reliable inventory.',
  },
  {
    icon: BarChart3,
    title: 'Deal pipeline',
    description:
      'Track opportunities through the sales process with clear ownership and pipeline visibility.',
  },
  {
    icon: Sparkles,
    title: 'Smart property matching',
    description:
      'Connect buyer preferences with relevant property inventory to help teams move conversations forward.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Import center',
    description:
      'Bring existing lead and property data into the workspace through structured, validated imports.',
  },
  {
    icon: PhoneCall,
    title: 'Calling & follow-up',
    description:
      'Keep conversations and sales activity connected to the people and opportunities your team manages.',
  },
]

export function FeatureGrid() {
  return (
    <section id="capabilities" className="border-b border-brand-navy/10 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold-dark">
            One connected platform
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-brand-navy sm:text-4xl">
            Everything your real estate sales team needs in one place.
          </h2>

          <p className="mt-5 text-base leading-7 text-brand-navy/60">
            Designed around the actual flow of real estate sales, from the
            first lead conversation through inventory discovery and opportunity
            management.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-brand-navy/10 bg-action text-action-foreground/10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <article
                key={feature.title}
                className="bg-white p-7 transition-colors hover:bg-brand-cream/70 sm:p-8"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand-gold/25 bg-brand-gold/10 text-brand-gold-dark">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>

                <h3 className="mt-6 text-lg font-semibold text-brand-navy">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-brand-navy/60">
                  {feature.description}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}