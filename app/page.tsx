import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { FeaturesSection } from '@/components/features-section'
import { ModelsSection } from '@/components/models-section'
import { CTASection } from '@/components/cta-section'
import { Footer } from '@/components/footer'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#080808]">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ModelsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
