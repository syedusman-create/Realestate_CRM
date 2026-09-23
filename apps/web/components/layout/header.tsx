import type { ReactNode } from 'react'

type HeaderProps = {
  children?: ReactNode
}

export default function Header({
  children,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center border-b border-border/80 bg-background/90 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75 md:px-6">
      <div className="flex w-full items-center justify-between gap-4">
        {children}
      </div>
    </header>
  )
}