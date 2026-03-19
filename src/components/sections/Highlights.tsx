'use client'
import { motion } from 'framer-motion'
import HighlightCard from '@/components/ui/HighlightCard'

const HIGHLIGHTS = [
  {
    imageSrc: '/images/placeholder-hero.jpg',
    imageAlt: 'Design exterior do Nissan Leaf',
    label: 'Design que impressiona',
    description: 'Linhas curvas e uma silhueta moderna que redefinem o que um elétrico pode ser.',
  },
  {
    imageSrc: '/images/placeholder-hero.jpg',
    imageAlt: 'Interior tecnológico do Nissan Leaf',
    label: 'Tecnologia no centro',
    description: 'Cockpit digital, conectividade total e sistemas de assistência à condução.',
  },
  {
    imageSrc: '/images/placeholder-hero.jpg',
    imageAlt: 'Autonomia do Nissan Leaf',
    label: 'Vai mais longe',
    description: 'Autonomia real para o teu dia a dia, com carregamento rápido onde precisas.',
  },
  {
    imageSrc: '/images/placeholder-hero.jpg',
    imageAlt: 'Zero emissões Nissan Leaf',
    label: 'Zero emissões',
    description: '100% elétrico. Contribui para um futuro mais limpo a cada quilómetro.',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function Highlights() {
  return (
    <section id="highlights" className="py-24 px-6 md:px-12 bg-surface">
      <motion.h2
        className="text-4xl md:text-5xl font-bold text-center mb-16"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Feito para te surpreender.
      </motion.h2>

      {/* Desktop: row */}
      <motion.div
        className="hidden md:flex gap-5"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {HIGHLIGHTS.map((h) => (
          <motion.div key={h.label} variants={item} className="flex-1 min-w-0">
            <HighlightCard {...h} />
          </motion.div>
        ))}
      </motion.div>

      {/* Mobile: horizontal scroll carousel */}
      <div className="flex md:hidden gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {HIGHLIGHTS.map((h) => (
          <div key={h.label} className="snap-start shrink-0 w-72">
            <HighlightCard {...h} />
          </div>
        ))}
      </div>
    </section>
  )
}
