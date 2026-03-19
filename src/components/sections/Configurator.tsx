'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import ConfiguratorViewer from '@/components/configurator/ConfiguratorViewer'
import type { ConfiguratorView } from '@/types'

const VIEWS: { id: ConfiguratorView; label: string }[] = [
  { id: 'exterior', label: 'Exterior' },
  { id: 'interior', label: 'Interior' },
]

export default function Configurator() {
  const [view, setView] = useState<ConfiguratorView>('exterior')
  const [badgeVisible, setBadgeVisible] = useState(true)

  return (
    <section id="configurador" className="relative min-h-screen w-full overflow-hidden">
      {/* Full-bleed viewer */}
      <div className="absolute inset-0">
        <ConfiguratorViewer
          view={view}
          onFirstInteraction={() => setBadgeVisible(false)}
        />
      </div>

      {/* 360° badge — top-left */}
      <motion.div
        className="absolute top-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-full pointer-events-none"
        animate={{ opacity: badgeVisible ? 1 : 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 8h12M2 8l3-3M2 8l3 3M14 8l-3-3M14 8l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>360°</span>
      </motion.div>

      {/* View toggle — bottom-center */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 backdrop-blur-sm rounded-full p-1">
        {VIEWS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`
              px-5 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${view === id ? 'bg-white text-black' : 'text-white/70 hover:text-white'}
            `}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  )
}
