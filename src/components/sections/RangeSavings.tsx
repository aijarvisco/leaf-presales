'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import StatCard from '@/components/ui/StatCard'
import Modal from '@/components/ui/Modal'
import SavingsCalculator from '@/components/forms/SavingsCalculator'

const STAT_CARDS = [
  {
    id: 'autonomia',
    stat: '450',
    unit: 'km',
    descriptor: 'Autonomia máxima em ciclo misto WLTP',
    modalTitle: 'Autonomia real',
    modalContent: 'O novo Nissan Leaf oferece até 450 km de autonomia em ciclo misto WLTP, suficiente para os teus trajetos diários e muito mais.',
  },
  {
    id: 'carregamento',
    stat: '40',
    unit: 'min',
    descriptor: 'De 0 a 80% em carregamento rápido',
    modalTitle: 'Carregamento rápido',
    modalContent: 'Com carregamento rápido CHAdeMO de 50 kW, passa de 0 a 80% em apenas 40 minutos. Em casa, uma noite de carga normal é suficiente.',
  },
  {
    id: 'poupanca',
    stat: '€120',
    unit: '/mês',
    descriptor: 'Poupança média vs. carro a combustão',
    modalTitle: 'A tua poupança',
    modalContent: null, // SavingsCalculator rendered here
  },
  {
    id: 'emissoes',
    stat: '0',
    unit: 'g CO₂/km',
    descriptor: 'Emissões diretas durante a condução',
    modalTitle: 'Impacto ambiental',
    modalContent: 'Condução 100% elétrica significa zero emissões diretas. Em Portugal, com o mix energético atual, o Leaf emite cerca de 40% menos CO₂ do que um equivalente a gasolina ao longo do seu ciclo de vida.',
  },
]

export default function RangeSavings() {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const active = STAT_CARDS.find((c) => c.id === activeModal)

  return (
    <section id="autonomia" className="py-24 px-6 md:px-12 bg-background">
      <motion.h2
        className="text-4xl md:text-5xl font-bold text-center mb-16"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Vai mais longe. Carrega mais rápido.
      </motion.h2>

      {/* Desktop */}
      <motion.div
        className="hidden md:flex gap-5"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, staggerChildren: 0.1 }}
      >
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.id}
            stat={card.stat}
            unit={card.unit}
            descriptor={card.descriptor}
            onClick={() => setActiveModal(card.id)}
          />
        ))}
      </motion.div>

      {/* Mobile carousel */}
      <div className="flex md:hidden gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {STAT_CARDS.map((card) => (
          <div key={card.id} className="snap-start shrink-0 w-64">
            <StatCard
              stat={card.stat}
              unit={card.unit}
              descriptor={card.descriptor}
              onClick={() => setActiveModal(card.id)}
            />
          </div>
        ))}
      </div>

      <Modal open={activeModal !== null} onClose={() => setActiveModal(null)}>
        {active && (
          <div>
            <h3 className="text-2xl font-bold mb-4">{active.modalTitle}</h3>
            {active.id === 'poupanca' ? (
              <SavingsCalculator />
            ) : (
              <p className="text-text-secondary leading-relaxed">{active.modalContent}</p>
            )}
          </div>
        )}
      </Modal>
    </section>
  )
}
