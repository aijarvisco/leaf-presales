'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import ContactForm from '@/components/forms/ContactForm'

interface CTASectionProps {
  selectedVersion?: string
}

export default function CTASection({ selectedVersion }: CTASectionProps) {
  const [loading, setLoading] = useState(false)

  const handleReserve = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId: selectedVersion }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <section id="reservar" className="py-24 px-6 md:px-12 bg-surface">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-24 items-start">

        {/* Left — Stripe */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-3">Reserva o teu Leaf hoje.</h2>
          <p className="text-text-secondary mb-6 leading-relaxed">
            Garante o teu lugar com um depósito de €300, totalmente reembolsável.
            Sem compromisso adicional até à entrega.
          </p>
          <Button
            variant="primary"
            onClick={handleReserve}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'A redirecionar...' : 'Reservar agora — €300'}
          </Button>
          <div className="flex items-center gap-2 mt-4 text-xs text-text-secondary">
            <span>🔒</span>
            <span>Pagamento seguro via Stripe · Depósito 100% reembolsável</span>
          </div>
        </motion.div>

        {/* Right — Contact form */}
        <motion.div
          id="contacto"
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-3">Preferes falar primeiro?</h2>
          <p className="text-text-secondary mb-6 leading-relaxed">
            A nossa equipa está pronta para responder a todas as tuas dúvidas.
          </p>
          <ContactForm />
        </motion.div>

      </div>
    </section>
  )
}
