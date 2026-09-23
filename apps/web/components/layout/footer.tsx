import type { ReactNode } from 'react'

type FooterProps = {
  children?: ReactNode
}

export default function Footer({
  children,
}: FooterProps) {
  return (
    <footer className="flex min-h-10 shrink-0 items-center justify-between gap-4 border-t border-border/70 px-4 py-3 text-xs text-muted-foreground md:px-6">
      <span>
        © {new Date().getFullYear()} Global
        Enterprises
      </span>

      {children}
    </footer>
  )
}