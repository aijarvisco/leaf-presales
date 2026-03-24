'use client'
import { useState } from 'react'
import ConfiguratorViewer from '@/components/configurator/ConfiguratorViewer'
import type { ConfiguratorView } from '@/types'

const VIEWS: { id: ConfiguratorView; label: string }[] = [
  { id: 'exterior', label: 'Exterior' },
  { id: 'interior', label: 'Interior' },
]

export default function Configurator() {
  const [view, setView] = useState<ConfiguratorView>('exterior')

  return (
    <section id="360view" className="hidden relative min-h-screen w-full overflow-hidden">
      {/* Full-bleed viewer */}
      <div className="absolute inset-0">
        <ConfiguratorViewer view={view} />
      </div>

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
