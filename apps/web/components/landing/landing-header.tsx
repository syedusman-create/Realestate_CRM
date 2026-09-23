import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-navy/10 bg-brand-cream/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          aria-label="Global Enterprises home"
        >
          <Image
            src="/logo.png"
            alt="Global Enterprises"
            width={48}
            height={48}
            className="h-11 w-11 object-contain"
            priority
          />

          <div className="hidden sm:block">
            <p className="text-sm font-semibold tracking-[0.16em] text-brand-navy">
              GLOBAL ENTERPRISES
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-gold-dark">
              Real Estate CRM
            </p>
          </div>
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Primary navigation"
        >
          <a
            href="#platform"
            className="text-sm font-medium text-brand-navy/70 transition-colors hover:text-brand-navy"
          >
            Platform
          </a>

          <a
            href="#capabilities"
            className="text-sm font-medium text-brand-navy/70 transition-colors hover:text-brand-navy"
          >
            Capabilities
          </a>

          <a
            href="#about"
            className="text-sm font-medium text-brand-navy/70 transition-colors hover:text-brand-navy"
          >
            About
          </a>
        </nav>

        <Link
          href="/login"
          className="group inline-flex h-10 items-center gap-2 rounded-md bg-action text-action-foreground px-4 text-sm font-semibold text-brand-ivory shadow-sm transition-all hover:bg-action text-action-foreground-soft hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
        >
          Sign in
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </header>
  )
}