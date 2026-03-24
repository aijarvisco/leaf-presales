'use client'
import { motion } from 'framer-motion'
import ContactForm from '@/components/forms/ContactForm'
import StripePaymentForm from '@/components/forms/StripePaymentForm'

interface CTASectionProps {
  selectedVersion?: string
}

export default function CTASection({ selectedVersion }: CTASectionProps) {
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
          <StripePaymentForm versionId={selectedVersion} />
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
