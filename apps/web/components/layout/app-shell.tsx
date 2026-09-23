import type { ReactNode } from 'react'

type AppShellProps = {
  sidebar: ReactNode
  header: ReactNode
  content: ReactNode
  footer: ReactNode
}

export default function AppShell({
  sidebar,
  header,
  content,
  footer,
}: AppShellProps) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* Fixed desktop sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 hidden md:block">
        {sidebar}
      </div>

      {/* Workspace */}
      <div className="min-h-screen md:pl-[72px]">
        <div className="flex min-h-screen min-w-0 flex-col">
          {header}

          <main className="flex min-h-0 flex-1 flex-col">
            {content}
          </main>

          {footer}
        </div>
      </div>
    </div>
  )
}