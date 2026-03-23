'use client'
import { useState } from 'react'
import ImagePanel from '@/components/configurator/ImagePanel'
import OptionsPanel from '@/components/configurator/OptionsPanel'
import StickyBar from '@/components/configurator/StickyBar'
import { VERSIONS, EXTERIOR_COLORS } from '@/components/configurator/configuradorData'

interface ConfiguradorProps {
  onSelectVersion: (versionId: string) => void
}

export default function Configurador({ onSelectVersion }: ConfiguradorProps) {
  const [selectedVersionId, setSelectedVersionId] = useState('n-connecta')
  const [selectedColorId, setSelectedColorId] = useState('TURQUOISE')
  const [imageView, setImageView] = useState<'exterior' | 'interior'>('exterior')
  const [slideIndex, setSlideIndex] = useState(0)

  function handleVersionSelect(id: string) {
    setSelectedVersionId(id)
    onSelectVersion(id)
  }

  const activeVersion = VERSIONS.find(v => v.id === selectedVersionId) ?? VERSIONS[1]
  const activeColor = EXTERIOR_COLORS.find(c => c.id === selectedColorId) ?? EXTERIOR_COLORS[0]

  function handleReserve() {
    document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="configurador" className="relative bg-white">

      {/* Two-column layout: sticky left + scrollable right */}
      <div className="flex flex-col md:flex-row">

        {/* Left — sticky image panel: 50vh on mobile, full-screen sticky on desktop */}
        <div className="w-full md:w-[55%] h-[50vh] md:h-screen md:sticky md:top-0 md:self-start">
          <ImagePanel
            exteriorImageSrc={activeColor.imageSrc}
            view={imageView}
            onViewChange={setImageView}
            slideIndex={slideIndex}
            onSlideChange={setSlideIndex}
          />
        </div>

        {/* Right — scrollable options */}
        <div className="w-full md:w-[45%]">
          <OptionsPanel
            selectedVersionId={selectedVersionId}
            selectedColorId={selectedColorId}
            onSelectVersion={handleVersionSelect}
            onSelectColor={setSelectedColorId}
          />
        </div>

      </div>

      {/* Sticky CTA bar */}
      <StickyBar
        versionName={activeVersion.name}
        price={activeVersion.price}
        onReserve={handleReserve}
      />

    </section>
  )
}
