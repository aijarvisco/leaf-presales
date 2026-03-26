'use client'
import SiteHeader from '@/components/layout/SiteHeader'
import Hero from '@/components/sections/Hero'
import Highlights from '@/components/sections/Highlights'
import DesignIntroSection from '@/components/sections/DesignIntroSection'
import AutonomiaSectionV2 from '@/components/sections/AutonomiaSectionV2'
import ValuesSection from '@/components/sections/ValuesSection'
import Configurador from '@/components/sections/Configurador'
import ClosingSection from '@/components/sections/ClosingSection'

export default function Home() {
  return (
    <main>
      <div className="h-screen flex flex-col">
        <SiteHeader />
        <Hero />
      </div>
      <Highlights />
      <DesignIntroSection />
      <ValuesSection />
      <AutonomiaSectionV2 />
      <ValuesSection />
      <Configurador />
<ClosingSection />
    </main>
  )
}
