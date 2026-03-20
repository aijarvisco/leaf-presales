'use client'
import { useState } from 'react'
import Hero from '@/components/sections/Hero'
import Highlights from '@/components/sections/Highlights'
import Configurator from '@/components/sections/Configurator'
import RangeSavings from '@/components/sections/RangeSavings'
import AutonomiaSectionV2 from '@/components/sections/AutonomiaSectionV2'
import VersionComparison from '@/components/sections/VersionComparison'
import CTASection from '@/components/sections/CTASection'
import ClosingSection from '@/components/sections/ClosingSection'

export default function Home() {
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined)

  return (
    <main>
      <Hero />
      <Highlights />
      <Configurator />
      {false && <RangeSavings />}
      <AutonomiaSectionV2 />
      <VersionComparison onSelectVersion={setSelectedVersion} />
      <CTASection selectedVersion={selectedVersion} />
      <ClosingSection selectedVersion={selectedVersion} />
    </main>
  )
}
