import { LandingFooter } from '@/components/landing/landing-footer'
import { LandingHeader } from '@/components/landing/landing-header'
import { Hero } from '@/components/landing/hero'
import { FeatureGrid } from '@/components/landing/feature-grid'
import { TrustSection } from '@/components/landing/trust-section'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-cream text-brand-navy">
      <LandingHeader />

      <Hero />

      <FeatureGrid />

      <TrustSection />

      <LandingFooter />
    </main>
  )
}