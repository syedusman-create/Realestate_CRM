import Link from 'next/link'
import Image from 'next/image'

export function LandingFooter() {
  return (
    <footer className="bg-action text-action-foreground-deep text-brand-ivory">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 border-b border-white/10 pb-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Global Enterprises"
              width={42}
              height={42}
              className="h-10 w-10 object-contain"
            />

            <div>
              <p className="text-sm font-semibold tracking-[0.15em]">
                GLOBAL ENTERPRISES
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-brand-gold-light">
                Real Estate CRM
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md border border-brand-gold/35 px-5 text-sm font-semibold text-brand-ivory transition-colors hover:bg-brand-gold/10"
          >
            Sign in to workspace
          </Link>
        </div>

        <div className="flex flex-col gap-3 pt-7 text-xs text-brand-ivory/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Global Enterprises. All rights reserved.</p>

          <p>Real estate sales, connected.</p>
        </div>
      </div>
    </footer>
  )
}