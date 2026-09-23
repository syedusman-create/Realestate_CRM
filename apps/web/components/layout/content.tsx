import type { ReactNode } from 'react'

type ContentProps = {
  children: ReactNode
}

export default function Content({
  children,
}: ContentProps) {
  return (
    <main className="min-w-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1600px] p-4 md:p-6 lg:p-8">
        {children}
      </div>
    </main>
  )
}