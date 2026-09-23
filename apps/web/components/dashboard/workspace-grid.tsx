import WorkspaceCard from './workspace-card'

type WorkspaceGridProps = {
  items: Array<{
    title: string
    description: string
    href: string
  }>
}

export default function WorkspaceGrid({
  items,
}: WorkspaceGridProps) {
  return (
    <section
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      aria-label="CRM workspaces"
    >
      {items.map((item) => (
        <WorkspaceCard
          key={item.href}
          title={item.title}
          description={item.description}
          href={item.href}
        />
      ))}
    </section>
  )
}