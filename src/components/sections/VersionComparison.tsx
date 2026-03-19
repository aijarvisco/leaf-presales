'use client'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

interface VersionComparisonProps {
  onSelectVersion: (versionId: string) => void
}

const VERSIONS = [
  {
    id: 'visia',
    name: 'Visia',
    price: 29990,
    isPopular: false,
    features: {
      'Jantes de liga leve 16"': true,
      'Faróis LED': false,
      'Ecrã 8" touchscreen': true,
      'Apple CarPlay / Android Auto': true,
      'Câmara de marcha-atrás': true,
      'Carregamento rápido CHAdeMO': false,
      'Teto de abrir': false,
      'Sistema de som premium': false,
      'Assistente de faixa': true,
      'Travagem automática de emergência': true,
    },
  },
  {
    id: 'n-connecta',
    name: 'N-Connecta',
    price: 34490,
    isPopular: true,
    features: {
      'Jantes de liga leve 16"': true,
      'Faróis LED': true,
      'Ecrã 8" touchscreen': true,
      'Apple CarPlay / Android Auto': true,
      'Câmara de marcha-atrás': true,
      'Carregamento rápido CHAdeMO': true,
      'Teto de abrir': false,
      'Sistema de som premium': false,
      'Assistente de faixa': true,
      'Travagem automática de emergência': true,
    },
  },
  {
    id: 'tekna',
    name: 'Tekna',
    price: 38990,
    isPopular: false,
    features: {
      'Jantes de liga leve 16"': true,
      'Faróis LED': true,
      'Ecrã 8" touchscreen': true,
      'Apple CarPlay / Android Auto': true,
      'Câmara de marcha-atrás': true,
      'Carregamento rápido CHAdeMO': true,
      'Teto de abrir': true,
      'Sistema de som premium': true,
      'Assistente de faixa': true,
      'Travagem automática de emergência': true,
    },
  },
]

const FEATURE_KEYS = Object.keys(VERSIONS[0].features)

export default function VersionComparison({ onSelectVersion }: VersionComparisonProps) {
  const handleReserve = (versionId: string) => {
    onSelectVersion(versionId)
    document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="versoes" className="py-24 px-6 md:px-12 bg-background">
      <motion.h2
        className="text-4xl md:text-5xl font-bold text-center mb-16"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Escolhe a tua versão.
      </motion.h2>

      {/* Desktop table */}
      <motion.div
        className="hidden md:grid grid-cols-3 gap-4 max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {VERSIONS.map((v) => (
          <div
            key={v.id}
            className={`
              relative rounded-2xl overflow-hidden border
              ${v.isPopular ? 'border-accent bg-card' : 'border-white/5 bg-card/50'}
            `}
          >
            {v.isPopular && (
              <div className="bg-accent text-white text-xs font-semibold text-center py-1.5 tracking-wide">
                Mais popular
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">{v.name}</h3>
              <p className="text-text-secondary text-sm mb-6">
                desde{' '}
                <span className="text-white font-semibold text-lg">
                  €{v.price.toLocaleString('pt-PT')}
                </span>
              </p>

              <div className="space-y-3 mb-8">
                {FEATURE_KEYS.map((key) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <span className={v.features[key as keyof typeof v.features] ? 'text-accent' : 'text-white/20'}>
                      {v.features[key as keyof typeof v.features] ? '✓' : '—'}
                    </span>
                    <span className={v.features[key as keyof typeof v.features] ? 'text-text-secondary' : 'text-white/20'}>
                      {key}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Button
                  variant={v.isPopular ? 'primary' : 'ghost'}
                  className="w-full"
                  onClick={() => handleReserve(v.id)}
                >
                  Reservar
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-xs py-2"
                  onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Saber mais
                </Button>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Mobile carousel */}
      <div className="flex md:hidden gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {VERSIONS.map((v) => (
          <div key={v.id} className="snap-center shrink-0 w-80">
            <div className={`rounded-2xl border ${v.isPopular ? 'border-accent bg-card' : 'border-white/5 bg-card/50'}`}>
              {v.isPopular && (
                <div className="bg-accent text-white text-xs font-semibold text-center py-1.5">Mais popular</div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-bold mb-1">{v.name}</h3>
                <p className="text-text-secondary text-sm mb-4">desde €{v.price.toLocaleString('pt-PT')}</p>
                <Button variant={v.isPopular ? 'primary' : 'ghost'} className="w-full" onClick={() => handleReserve(v.id)}>
                  Reservar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
