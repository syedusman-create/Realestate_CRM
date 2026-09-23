'use client'

import type {
  NavigationIcon,
} from '@/lib/auth/navigation'

import NavItem from './nav-item'
import NavSection from './nav-section'

export type NavItemConfig = {
  href: string
  label: string
  icon?: NavigationIcon
}

export type NavGroup = {
  label: string
  items: NavItemConfig[]
}

type NavProps = {
  groups: NavGroup[]
}

export default function Nav({
  groups,
}: NavProps) {
  return (
    <nav
      className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden py-4"
      aria-label="Primary navigation"
    >
      {groups.map((group) => (
        <NavSection
          key={group.label}
          title={group.label}
        >
          {group.items.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </NavSection>
      ))}
    </nav>
  )
}