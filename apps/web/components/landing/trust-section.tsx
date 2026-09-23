import {
  LockKeyhole,
  ShieldCheck,
  UsersRound,
  Workflow,
} from 'lucide-react'

const principles = [
  {
    icon: ShieldCheck,
    title: 'Workspace-aware',
    description:
      'Your CRM is organized around the teams and workspaces that use it.',
  },
  {
    icon: LockKeyhole,
    title: 'Access-conscious',
    description:
      'Role-based permissions keep operational areas aligned with team responsibilities.',
  },
  {
    icon: Workflow,
    title: 'Connected workflows',
    description:
      'Leads, opportunities, inventory and activity are designed to work together.',
  },
  {
    icon: UsersRound,
    title: 'Built for teams',
    description:
      'Give agents, managers and administrators the tools relevant to their work.',
  },
]

export function TrustSection() {
  return (
    <section id="about" className="bg-action text-action-foreground text-brand-ivory">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold-light">
              Built for operations
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              A clearer way to run your property sales operation.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-brand-ivory/60">
              Global Enterprises brings the core pieces of a real estate sales
              operation into a single workspace, giving teams a shared view of
              customers, opportunities and inventory.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {principles.map((principle) => {
              const Icon = principle.icon

              return (
                <div
                  key={principle.title}
                  className="rounded-xl border border-white/10 bg-white/[0.045] p-6"
                >
                  <Icon
                    className="h-5 w-5 text-brand-gold-light"
                    aria-hidden="true"
                  />

                  <h3 className="mt-5 font-semibold text-brand-ivory">
                    {principle.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-brand-ivory/55">
                    {principle.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}