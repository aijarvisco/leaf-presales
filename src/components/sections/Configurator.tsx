'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import ConfiguratorViewer from '@/components/configurator/ConfiguratorViewer'
import ColorSwitcher from '@/components/configurator/ColorSwitcher'
import type { ConfiguratorView } from '@/types'

const VIEWS: { id: ConfiguratorView; label: string }[] = [
  { id: 'exterior', label: 'Exterior' },
  { id: 'interior', label: 'Interior' },
]

// Replace with real color options from Nissan PT asset list
const COLORS = [
  { id: 'branco', label: 'Branco Pérola', hex: '#F0EDE8' },
  { id: 'azul', label: 'Azul Elétrico', hex: '#1A4FA0' },
  { id: 'cinzento', label: 'Cinzento Cósmico', hex: '#6B6B6B' },
]

export default function Configurator() {
  const [view, setView] = useState<ConfiguratorView>('exterior')
  const [colorId, setColorId] = useState(COLORS[0].id)

  return (
    <section id="configurador" className="py-24 px-6 md:px-12 bg-surface">
      <motion.h2
        className="text-4xl md:text-5xl font-bold text-center mb-12"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Descobre o teu Leaf.
      </motion.h2>

      {/* View toggle */}
      <div className="flex justify-center gap-1 mb-8">
        {VIEWS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`
              px-6 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${view === id ? 'bg-accent text-white' : 'text-text-secondary hover:text-white'}
            `}
          >
            {label}
          </button>
        ))}
      </div>

      <ConfiguratorViewer view={view} colorId={colorId} />

      <ColorSwitcher colors={COLORS} activeColor={colorId} onSelect={setColorId} />
    </section>
  )
}
