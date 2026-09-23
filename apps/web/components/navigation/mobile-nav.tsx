'use client'

import Image from 'next/image'
import {
  Menu,
} from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import Nav from './nav'

import type {
  NavigationGroup,
} from '@/lib/auth/navigation'

type MobileNavProps = {
  groups: NavigationGroup[]
}

export default function MobileNav({
  groups,
}: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger
        className={[
          'inline-flex size-9 items-center justify-center',
          'rounded-lg border border-input',
          'bg-background text-foreground shadow-xs',
          'transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring',
          'md:hidden',
        ].join(' ')}
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[280px] border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
      >
        <SheetHeader className="border-b border-sidebar-border px-5 py-5 text-left">
          <SheetTitle className="flex items-center gap-3 text-sidebar-foreground">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1">
              <Image
                src="/logo.png"
                alt="Global Enterprises"
                width={40}
                height={40}
                className="size-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-bold tracking-[0.08em]">
                GLOBAL ENTERPRISES
              </div>

              <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-sidebar-foreground/50">
                Real Estate Platform
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <Nav groups={groups} />
      </SheetContent>
    </Sheet>
  )
}