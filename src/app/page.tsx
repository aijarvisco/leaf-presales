'use client'
import { useState } from 'react'
import SiteHeader from '@/components/layout/SiteHeader'
import Hero from '@/components/sections/Hero'
import Highlights from '@/components/sections/Highlights'
import Configurator from '@/components/sections/Configurator'
import AutonomiaSectionV2 from '@/components/sections/AutonomiaSectionV2'
import ValuesSection from '@/components/sections/ValuesSection'
import Configurador from '@/components/sections/Configurador'
import CTASection from '@/components/sections/CTASection'
import ClosingSection from '@/components/sections/ClosingSection'

export default function Home() {
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined)

  return (
    <main>
      <div className="h-screen flex flex-col">
        <SiteHeader />
        <Hero />
      </div>
      <Highlights />
      <AutonomiaSectionV2 />
      <ValuesSection />
      <Configurator />
      <Configurador onSelectVersion={setSelectedVersion} />
      <CTASection selectedVersion={selectedVersion} />
      <ClosingSection />
    </main>
  )
}
