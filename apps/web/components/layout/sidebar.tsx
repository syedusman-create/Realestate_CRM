import type { ReactNode } from 'react'
import Image from 'next/image'

type SidebarProps = {
    children: ReactNode
}

export default function Sidebar({
    children,
}: SidebarProps) {
    return (
        <aside
            className={[
                'group/sidebar fixed inset-y-0 left-0 z-50',
                'hidden shrink-0 flex-col',
                'border-r border-sidebar-border',
                'bg-sidebar text-sidebar-foreground',
                'md:flex',
                'h-screen',
                'w-[72px] hover:w-[270px]',
                'overflow-hidden',
                'transition-[width] duration-300 ease-in-out',
            ].join(' ')}
        >
            <div
                className={[
                    'flex h-20 shrink-0 items-center',
                    'border-b border-sidebar-border',
                    'px-[14px]',
                    'transition-[padding] duration-300 ease-in-out',
                    'group-hover/sidebar:px-5',
                ].join(' ')}
            >
                <div className="flex min-w-0 items-center gap-3">
                    <div
                        className={[
                            'flex size-11 shrink-0 items-center justify-center',
                            'overflow-hidden rounded-xl bg-white p-1 shadow-sm',
                        ].join(' ')}
                    >
                        <Image
                            src="/logo.png"
                            alt="Global Enterprises"
                            width={44}
                            height={44}
                            priority
                            className="size-full object-contain"
                        />
                    </div>

                    <div
                        className={[
                            'min-w-0 overflow-hidden',
                            'opacity-0 -translate-x-2',
                            'transition-[opacity,transform] duration-200 ease-out',
                            'group-hover/sidebar:translate-x-0',
                            'group-hover/sidebar:opacity-100',
                            'whitespace-nowrap',
                        ].join(' ')}
                    >
                        <div className="truncate text-sm font-bold tracking-[0.08em] text-sidebar-foreground">
                            GLOBAL ENTERPRISES
                        </div>

                        <div className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-[0.12em] text-sidebar-foreground/50">
                            Real Estate Platform
                        </div>
                    </div>
                </div>
            </div>

            {children}
        </aside>
    )
}