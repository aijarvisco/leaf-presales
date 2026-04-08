'use client'

const INTERIOR_CARDS = [
  {
    imageSrc: '/images/interior/nissan_leaf_confortable.webp',
    imageAlt: 'Nissan Leaf — interior confortável',
    boldText: 'Viaje com conforto.',
    bodyText: 'Um piso plano cria linhas simples e uma atmosfera de cabina espaçosa para uma viagem o mais relaxante possível.',
  },
  {
    imageSrc: '/images/interior/nissan_leaf_display.webp',
    imageAlt: 'Nissan Leaf — portal de infoentretenimento',
    boldText: 'Portal de infoentretenimento.',
    bodyText: 'Dois ecrãs de 14,3" proporcionam um acesso claro, prático e intuitivo a todas as aplicações de que necessita para se manter informado e empenhado na sua condução.',
  },
  {
    imageSrc: '/images/interior/nissan_leaf_space.webp',
    imageAlt: 'Nissan Leaf — cinco lugares reais',
    boldText: 'Todos a bordo.',
    bodyText: 'Conversem juntos ou relaxem no vosso próprio mundo a partir de um dos cinco bancos reais no interior do Nissan LEAF.',
  },
  {
    imageSrc: '/images/interior/nissan_leaf_bose_sound.webp',
    imageAlt: 'Nissan Leaf — sistema de áudio Bose',
    boldText: 'Imersão sonora.',
    bodyText: 'Desfrute de uma experiência imersiva graças ao sistema de áudio Bose de 9 alto-falantes, incluindo um integrado ao encosto de cabeça do motorista (na versão Evolve).',
  },
]

import SiteHeader from '@/components/layout/SiteHeader'
import Hero from '@/components/sections/Hero'
import Highlights from '@/components/sections/Highlights'
import DesignIntroSection from '@/components/sections/DesignIntroSection'
import AutonomiaSectionV2 from '@/components/sections/AutonomiaSectionV2'
import ValuesSection from '@/components/sections/ValuesSection'
import Configurador from '@/components/sections/Configurador'
import InfoFormSection from '@/components/sections/InfoFormSection'
import ClosingSection from '@/components/sections/ClosingSection'
import BottomCTABar from '@/components/ui/BottomCTABar'

export default function Home() {
  return (
    <>
      <main>
        <SiteHeader />
        <Hero />
        <Highlights />
        <DesignIntroSection />
        <ValuesSection id="interior-highlights" cards={INTERIOR_CARDS} />
        <Configurador />
        <AutonomiaSectionV2 />
        <ValuesSection
          id="battery-highlights"
          tagline="Carregamento"
          title="Descubra novas fronteiras."
          paragraphHtml='Descubra o <strong class="font-semibold">verdadeiro potencial da condução elétrica</strong> graças ao design aerodinâmico inteligente, ao planeamento inteligente de rotas e aos sistemas eficientes de gestão da bateria.'
        />
        <InfoFormSection />
        <ClosingSection />
      </main>
      <BottomCTABar />
    </>
  )
}
