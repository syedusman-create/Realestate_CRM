'use client'

import {
  BarChart3,
  Building2,
  CheckSquare,
  Handshake,
  LayoutDashboard,
  PhoneCall,
  SearchCheck,
  UploadCloud,
  Users,
  UsersRound,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type {
  NavigationIcon,
} from '@/lib/auth/navigation'

type NavItemProps = {
  href: string
  label: string
  icon?: NavigationIcon
}

const ICONS: Record<
  NavigationIcon,
  typeof LayoutDashboard
> = {
  dashboard: LayoutDashboard,
  leads: UsersRound,
  deals: Handshake,
  tasks: CheckSquare,
  dialer: PhoneCall,
  inventory: Building2,
  recommendations: SearchCheck,
  reports: BarChart3,
  imports: UploadCloud,
  team: Users,
}

export default function NavItem({
  href,
  label,
  icon,
}: NavItemProps) {
  const pathname = usePathname()

  const isActive =
    pathname === href ||
    (href !== '/dashboard' &&
      pathname.startsWith(`${href}/`))

  const Icon = icon ? ICONS[icon] : null

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      title={label}
      className={[
        'group/nav-item relative mx-2 flex min-h-10',
        'items-center gap-3 rounded-xl',
        'px-3',
        'text-sm font-medium',
        'transition-[background-color,color,box-shadow]',
        'duration-200',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-[color:var(--brand-gold)]',
        isActive
          ? 'bg-[color:var(--brand-navy)] text-white shadow-sm'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
      ].join(' ')}
    >
      {isActive ? (
        <span
          aria-hidden="true"
          className={[
            'absolute -left-2 top-1/2',
            'h-6 w-1 -translate-y-1/2',
            'rounded-r-full',
            'bg-[color:var(--brand-gold)]',
          ].join(' ')}
        />
      ) : null}

      {Icon ? (
        <Icon
          className={[
            'size-4 shrink-0',
            'transition-colors duration-200',
            isActive
              ? 'text-[color:var(--brand-gold-light)]'
              : 'text-sidebar-foreground/60 group-hover/nav-item:text-sidebar-foreground',
          ].join(' ')}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      ) : null}

      <span
        className={[
          'min-w-0 truncate',
          'opacity-0 -translate-x-2',
          'transition-[opacity,transform] duration-200 ease-out',
          'group-hover/sidebar:translate-x-0',
          'group-hover/sidebar:opacity-100',
          'whitespace-nowrap',
        ].join(' ')}
      >
        {label}
      </span>
    </Link>
  )
}