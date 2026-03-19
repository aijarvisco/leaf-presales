import Hero from '@/components/sections/Hero'
import Highlights from '@/components/sections/Highlights'
import Configurator from '@/components/sections/Configurator'
import RangeSavings from '@/components/sections/RangeSavings'
import CTASection from '@/components/sections/CTASection'

export default function Home() {
  return (
    <main>
      <Hero />
      <Highlights />
      <Configurator />
      <RangeSavings />
      <CTASection />
    </main>
  )
}
