'use client'

const INTERIOR_CARDS = [
  {
    imageSrc: '/images/interior/nissan_leaf_confortable.webp',
    imageAlt: 'Nissan Leaf — interior confortável',
    boldText: 'Conduza com conforto.',
    bodyText: 'O piso plano cria um habitáculo amplo, proporcionando a viagem mais confortável possível.',
  },
  {
    imageSrc: '/images/interior/nissan_leaf_display.webp',
    imageAlt: 'Nissan Leaf — portal de infoentretenimento',
    boldText: 'Assuma o controlo.',
    bodyText: 'Dois ecrãs de 14,3" oferecem acesso claro, conveniente e intuitivo ao NissanConnect com Google integrado.',
  },
  {
    imageSrc: '/images/interior/nissan_leaf_bose_sound.webp',
    imageAlt: 'Nissan Leaf — sistema de áudio Bose',
    boldText: 'Mergulhe no som envolvente',
    bodyText: 'Desfrute do sistema de som Bose, com 9 altifalantes, dois deles integrados no encosto de cabeça do condutor.',
  },
  {
    imageSrc: '/images/interior/nissan_leaf_space.webp',
    imageAlt: 'Nissan Leaf — cinco lugares reais',
    boldText: 'Todos a bordo',
    bodyText: 'Espaço para toda a família num dos 5 lugares do Nissan LEAF',
  },
]

import SiteHeader from '@/components/layout/SiteHeader'
import Hero from '@/components/sections/Hero'
import Highlights from '@/components/sections/Highlights'
import RoofAnimationSection from '@/components/sections/RoofAnimationSection'
import AutonomiaSectionV2 from '@/components/sections/AutonomiaSectionV2'
import ValuesSection from '@/components/sections/ValuesSection'
import Configurador from '@/components/sections/Configurador'
import InfoFormSection from '@/components/sections/InfoFormSection'
import DisclaimerSection from '@/components/sections/DisclaimerSection'
import ClosingSection from '@/components/sections/ClosingSection'
import BottomCTABar from '@/components/ui/BottomCTABar'

export default function Home() {
  return (
    <>
      <main className="overflow-x-clip">
        <SiteHeader />
        <Hero />
        <Highlights />
        <RoofAnimationSection />
        <ValuesSection id="interior-highlights" cards={INTERIOR_CARDS} />
        <Configurador />
        <AutonomiaSectionV2 />
        <ValuesSection
          id="battery-highlights"
          tagline="Carregamento"
          title="Conduza com confiança<br/>no seu dia a dia."
          paragraphHtml='Sinta o <strong class="font-semibold">verdadeiro potencial da condução elétrica</strong> graças ao design aerodinâmico inteligente, ao planeamento inteligente de rotas e aos sistemas eficientes de gestão da bateria.'
        />
        <InfoFormSection />
        <DisclaimerSection />
        <ClosingSection />
      </main>
      <BottomCTABar />
    </>
  )
}
