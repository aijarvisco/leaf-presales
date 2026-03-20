'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Modal from '@/components/ui/Modal'
import SavingsCalculator from '@/components/forms/SavingsCalculator'

const STATS = [
  { qualifier: 'Até', number: '75',  unit: 'kWh',    descriptor: 'Capacidade da bateria' },
  { qualifier: 'Até', number: '592', unit: 'km',     descriptor: 'Autonomia em ciclo WLTP' },
  { qualifier: '',    number: '30',  unit: 'min',    descriptor: 'De 20 a 80% em carga rápida' },
  { qualifier: '',    number: '7,2', unit: 'km/kWh', descriptor: 'Eficiência energética' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export default function RangeSavings() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <section id="autonomia" className="bg-background py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">

        {/* Header block */}
        <motion.div
          className="max-w-xl mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="text-4xl md:text-5xl mb-5">
            Uma bateria que vai onde tu vais.
          </h2>
          <p className="text-text-secondary leading-relaxed mb-8">
            O Leaf foi concebido para a tua vida real — não para um circuito de testes.
            Com até 592 km de autonomia e carregamento rápido em 30 minutos,
            a energia nunca te vai falhar.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="border border-white/30 text-white hover:bg-white/5 transition-colors px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
          >
            Calcular a minha poupança →
          </button>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          className="grid grid-cols-2 gap-x-8 gap-y-12 md:gap-x-16 md:gap-y-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {STATS.map((stat) => (
            <motion.div key={stat.descriptor} variants={itemVariants}>
              {stat.qualifier && (
                <p className="text-sm text-text-secondary mb-1">{stat.qualifier}</p>
              )}
              <div className="flex items-end gap-x-2">
                <span className="text-7xl md:text-8xl font-bold text-[#FA5C40] leading-none">
                  {stat.number}
                </span>
                <span className="text-2xl md:text-3xl font-medium text-[#FA5C40] mb-1">
                  {stat.unit}
                </span>
              </div>
              <p className="text-sm text-text-secondary mt-2">{stat.descriptor}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div>
          <h3 className="text-2xl font-bold mb-4">A tua poupança</h3>
          <SavingsCalculator />
        </div>
      </Modal>
    </section>
  )
}
