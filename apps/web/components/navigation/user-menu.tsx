'use client'

import {
    LogOut,
    Settings,
} from 'lucide-react'
import { useTransition } from 'react'

import { logout } from '@/lib/auth/actions'

import {
    Avatar,
    AvatarFallback,
} from '@/components/ui/avatar'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type UserMenuProps = {
    fullName: string
    role: string
}

export default function UserMenu({
    fullName,
    role,
}: UserMenuProps) {
    const [pending, startTransition] =
        useTransition()

    const initials = fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(
            (part) =>
                part[0]?.toUpperCase(),
        )
        .join('')

    function handleLogout() {
        startTransition(() => {
            void logout()
        })
    }

    const displayRole = role.replaceAll(
        '_',
        ' ',
    )

    return (
        <div
            className={[
                'shrink-0 border-t border-sidebar-border',
                'p-3',
                'transition-[padding] duration-300 ease-in-out',
                'group-hover/sidebar:p-3',
            ].join(' ')}
        >
            <DropdownMenu>
                <DropdownMenuTrigger
                    className={[
                        'flex w-full items-center gap-3',
                        'rounded-xl p-2',
                        'text-left outline-none',
                        'transition-colors duration-150',
                        'hover:bg-sidebar-accent',
                        'focus-visible:ring-2',
                        'focus-visible:ring-[color:var(--brand-gold)]',
                    ].join(' ')}
                >
                    <Avatar className="size-9 shrink-0">
                        <AvatarFallback className="bg-[color:var(--brand-gold)] text-xs font-bold text-[color:var(--brand-navy)]">
                            {initials || 'U'}
                        </AvatarFallback>
                    </Avatar>

                    <div
                        className={[
                            'min-w-0 flex-1 overflow-hidden',
                            'opacity-0 -translate-x-2',
                            'transition-[opacity,transform] duration-200 ease-out',
                            'group-hover/sidebar:translate-x-0',
                            'group-hover/sidebar:opacity-100',
                        ].join(' ')}
                    >
                        <div className="truncate text-sm font-semibold text-sidebar-foreground">
                            {fullName}
                        </div>

                        <div className="truncate text-xs capitalize text-sidebar-foreground/50">
                            {displayRole}
                        </div>
                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    side="top"
                    sideOffset={8}
                    className="w-60"
                >
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>
                            <div className="flex flex-col gap-1">
                                <span className="truncate font-semibold text-foreground">
                                    {fullName}
                                </span>

                                <span className="text-xs font-normal capitalize text-muted-foreground">
                                    {displayRole}
                                </span>
                            </div>
                        </DropdownMenuLabel>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => {
                            window.location.href = '/dashboard/settings'
                        }}
                    >
                        <Settings />
                        Settings
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        disabled={pending}
                        onClick={handleLogout}
                        variant="destructive"
                    >
                        <LogOut />
                        {pending
                            ? 'Signing out...'
                            : 'Log out'}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}