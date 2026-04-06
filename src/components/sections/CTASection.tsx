'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import StripePaymentForm from '@/components/forms/StripePaymentForm'

const FAQS = [
  {
    q: 'O depósito é reembolsável?',
    a: 'Sim, 100% reembolsável sem qualquer condição antes da entrega.',
  },
  {
    q: 'Quando serei contactado após a reserva?',
    a: 'A nossa equipa entrará em contacto nas 48 horas seguintes.',
  },
  {
    q: 'Posso alterar a versão após reservar?',
    a: 'Sim, até à emissão da ordem de produção.',
  },
  {
    q: 'Qual é o prazo estimado de entrega?',
    a: 'Previsto para Q3/Q4 2025, sujeito a confirmação.',
  },
]

interface CTASectionProps {
  selectedVersion?: string
}

export default function CTASection({ selectedVersion }: CTASectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="reservar" className="bg-white pt-16 pb-16 md:pt-24 md:pb-24 xl:pt-48 xl:pb-48">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* Left — title + FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <h2 className="leading-none font-medium text-[#0A0A0A] tracking-[-0.07em] mb-8" style={{ fontSize: 'var(--text-h2)' }}>
              Reserva o teu Leaf hoje.
            </h2>
            <p className="text-[#0A0A0A] mb-10 leading-relaxed">
              Garante o teu lugar com um depósito de €300, totalmente reembolsável.
              Sem compromisso adicional até à entrega.
            </p>

            {/* FAQ accordion */}
            <div className="divide-y divide-[#E5E5E5]">
              {FAQS.map((faq, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full flex items-center justify-between py-4 text-left text-[#0A0A0A] font-medium cursor-pointer"
                    aria-expanded={openIndex === i}
                  >
                    <span>{faq.q}</span>
                    <span className="ml-4 shrink-0 text-lg leading-none">
                      {openIndex === i ? '−' : '+'}
                    </span>
                  </button>
                  {openIndex === i && (
                    <p className="pb-4 text-sm text-[#6B6B6B] leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Stripe form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <StripePaymentForm versionId={selectedVersion} />
            <div className="flex items-center gap-2 mt-4 text-xs text-[#0A0A0A]">
              <span>🔒</span>
              <span>Pagamento seguro via Stripe · Depósito 100% reembolsável</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
