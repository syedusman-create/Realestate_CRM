import type { ReactNode } from 'react'

type NavSectionProps = {
  title: string
  children: ReactNode
}

export default function NavSection({
  title,
  children,
}: NavSectionProps) {
  return (
    <section className="px-2 py-3">
      <div
        className={[
          'mb-2 px-3',
          'overflow-hidden',
          'text-[10px] font-bold uppercase tracking-[0.16em]',
          'text-sidebar-foreground/40',
          'whitespace-nowrap',
          'opacity-0 -translate-x-2',
          'transition-[opacity,transform] duration-200 ease-out',
          'group-hover/sidebar:translate-x-0',
          'group-hover/sidebar:opacity-100',
        ].join(' ')}
      >
        {title}
      </div>

      <div className="space-y-1">
        {children}
      </div>
    </section>
  )
}