'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import dealersData from '@/data/concessionarios.json'
import type { ContactFormData } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = 'idle' | 'loading' | 'success' | 'error'

interface Dealer {
  designation: string
  objectId: string
  address: string
}

// ─── FAQ Data ──────────────────────────────────────────────────────────────────

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Qual é a autonomia real do Nissan LEAF?',
    a: 'O Nissan LEAF oferece até 592 km de autonomia em ciclo WLTP. A autonomia real pode variar consoante o estilo de condução, temperatura ambiente e utilização de sistemas de climatização.',
  },
  {
    q: 'Quanto tempo demora a carregar?',
    a: 'Em carregamento rápido (CHAdeMO), passa de 20% a 80% em apenas 30 minutos. Em carregamento AC em casa (7,4 kW), uma carga completa demora aproximadamente 8 horas.',
  },
  {
    q: 'Posso instalar um carregador em casa?',
    a: 'Sim. A Nissan disponibiliza soluções de carregamento doméstico (Wallbox) compatíveis com o LEAF. A instalação é simples e pode ser feita por um electricista certificado.',
  },
  {
    q: 'Quais são as vantagens fiscais em Portugal?',
    a: 'Os veículos elétricos estão isentos de IUC e beneficiam de redução de ISV. Empresas podem ainda deduzir 100% do custo de aquisição em IRC.',
  },
  {
    q: 'A bateria tem garantia?',
    a: 'Sim. A bateria do Nissan LEAF tem garantia de 8 anos ou 160 000 km, cobrindo degradação abaixo de 9 células de capacidade.',
  },
  {
    q: 'Qual o custo médio por km em eletricidade?',
    a: 'Com um consumo de 17 kWh/100 km e tarifa média de 0,15 €/kWh, o custo por km é de aproximadamente 0,026 €, face a 0,11 €/km num veículo a combustão.',
  },
  {
    q: 'Por que devo reservar agora?',
    a: 'Ao reservar, garantes prioridade na entrega quando o teu LEAF estiver disponível, além de acesso antecipado a condições especiais de lançamento. O número de reservas é limitado.',
  },
  {
    q: 'Quanto custa fazer uma reserva?',
    a: 'A reserva tem um valor de 250 €, totalmente deduzido no momento da compra do veículo.',
  },
  {
    q: 'Posso cancelar a minha reserva?',
    a: 'Sim, podes cancelar a qualquer momento antes da confirmação final da encomenda. O valor da reserva é reembolsado na totalidade, sem qualquer penalização.',
  },
  {
    q: 'O que acontece depois de reservar?',
    a: 'Um representante Nissan entrará em contacto contigo em breve para confirmar os detalhes, discutir opções de financiamento e agendar um test drive.',
  },
  {
    q: 'A minha reserva compromete-me a comprar o veículo?',
    a: 'Não. A reserva é uma manifestação de interesse prioritária — não existe qualquer compromisso de compra. Podes cancelar e ser reembolsado a qualquer momento.',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const districts = dealersData
  .map((d) => d.district)
  .filter(Boolean)
  .sort((a, b) => a.localeCompare(b, 'pt'))

function getDealers(district: string): Dealer[] {
  const found = dealersData.find((d) => d.district === district)
  if (!found) return []
  return (found.dealers as Dealer[]).filter((d) => d.address !== 'GRUPO')
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InfoFormSection() {
  const [form, setForm] = useState<Partial<ContactFormData>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [faqOpen, setFaqOpen] = useState(false)
  const [faqIndex, setFaqIndex] = useState<number | null>(null)

  const set =
    (key: keyof ContactFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value
      setForm((p) => ({ ...p, [key]: value }))
    }

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const district = e.target.value
    setForm((p) => ({ ...p, distrito: district, concessionarioId: '' }))
    setDealers(getDealers(district))
  }

  const handleCheckbox =
    (key: keyof ContactFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked
      setForm((p) => ({ ...p, [key]: checked }))
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <section id="info-form" className="bg-[#F5F5F7] overflow-hidden py-16">
        <div className="max-w-6xl mx-auto px-6 text-center py-16">
          <p className="text-2xl font-semibold mb-2 text-[#0A0A0A]">Obrigado!</p>
          <p className="text-[#6B6B6B]">A nossa equipa entrará em contacto em breve.</p>
        </div>
      </section>
    )
  }

  return (
    <section id="info-form" className="bg-[#F5F5F7] overflow-hidden relative">
      <div className="container mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 md:gap-24">

          {/* ── Left column ── */}
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            {/* Content block */}
            <p className="font-medium text-xl text-[#86868b] mb-2 tracking-[-0.07em] leading-none">
              Contacto
            </p>
            <h2
              className="font-medium tracking-[-0.07em] text-[#0A0A0A] leading-none"
              style={{ fontSize: 'var(--text-h2)' }}
            >
              Fale connosco.
            </h2>
            <p className="mt-6 text-xl text-[#0A0A0A] leading-relaxed mb-6">
              Preencha o formulário e um representante Nissan entrará em contacto consigo em breve.
            </p>

            <button
              type="button"
              onClick={() => setFaqOpen(true)}
              className="flex items-center gap-3 mb-10 group cursor-pointer"
              aria-label="Ver perguntas frequentes"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full border border-[#0A0A0A] group-hover:bg-[#0A0A0A] transition-colors">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"
                  className="text-[#0A0A0A] group-hover:text-white transition-colors">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <span className="text-xs font-bold tracking-widest uppercase text-[#0A0A0A]">
                Perguntas Frequentes
              </span>
            </button>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field id="nome" label="Nome" value={form.nome ?? ''} onChange={set('nome')} required />
              <Field id="telemovel" label="Telemóvel" type="tel" value={form.telemovel ?? ''} onChange={set('telemovel')} required />
              <Field id="email" label="Email" type="email" value={form.email ?? ''} onChange={set('email')} required />

              <SelectField id="distrito" label="Distrito" value={form.distrito ?? ''} onChange={handleDistrictChange} required>
                <option value="">Selecione um distrito</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </SelectField>

              <SelectField
                id="concessionario"
                label="Concessionário"
                value={form.concessionarioId ?? ''}
                onChange={set('concessionarioId')}
                required
                disabled={!form.distrito}
              >
                <option value="">Selecione um concessionário</option>
                {dealers.map((d) => (
                  <option key={d.objectId} value={d.objectId}>{d.designation} - {d.address}</option>
                ))}
              </SelectField>

              <TextareaField
                id="mensagem"
                label="Mensagem (opcional)"
                value={form.mensagem ?? ''}
                onChange={set('mensagem')}
              />

              <label htmlFor="privacy" className="flex gap-3 items-start text-sm text-[#6B6B6B] cursor-pointer">
                <input
                  id="privacy"
                  type="checkbox"
                  required
                  checked={form.privacyConsent ?? false}
                  onChange={handleCheckbox('privacyConsent')}
                  className="mt-0.5"
                  aria-label="Aceito a Política de Privacidade"
                />
                <span>
                  Aceito a{' '}
                  <a href="/politica-de-privacidade" className="underline hover:text-[#0A0A0A] transition-colors">
                    Política de Privacidade
                  </a>
                  .
                </span>
              </label>

              <label htmlFor="marketing" className="flex gap-3 items-start text-sm text-[#6B6B6B] cursor-pointer">
                <input
                  id="marketing"
                  type="checkbox"
                  checked={form.marketingConsent ?? false}
                  onChange={handleCheckbox('marketingConsent')}
                  className="mt-0.5"
                  aria-label="Aceito receber comunicações de marketing da Nissan"
                />
                <span>Aceito receber comunicações de marketing da Nissan.</span>
              </label>

              {status === 'error' && (
                <p className="text-red-500 text-sm">Ocorreu um erro. Por favor tenta novamente.</p>
              )}

              <Button type="submit" variant="primary" className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? 'A enviar...' : 'Enviar'}
              </Button>
            </form>
          </motion.div>

          {/* ── Right column spacer (reserves grid space) ── */}
          <div className="hidden md:block" />

        </div>
      </div>

      {/* ── Full-height image from centre to right viewport edge ── */}
      <motion.div
        className="hidden md:block absolute inset-y-0 right-0 left-1/2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: 0.1 }}
      >
        <Image
          src="/images/nissan_leaf_driving_cta.webp"
          alt="Nissan Leaf em condução"
          fill
          className="object-cover"
          sizes="50vw"
        />
      </motion.div>

      <Modal open={faqOpen} onClose={() => { setFaqOpen(false); setFaqIndex(null) }}>
        <div>
          {/* Header */}
          <div className="px-6 pt-2 pb-6">
            <h3 className="text-2xl font-medium tracking-[-0.04em] text-[#0A0A0A]">
              Tudo o que precisas de saber
            </h3>
            <p className="text-sm text-[#86868b] mt-2">
              Reunimos as perguntas mais comuns sobre o Nissan LEAF. Se tiveres mais dúvidas, a nossa equipa está disponível para ajudar.
            </p>
          </div>

          {/* Accordion */}
          <FAQAccordion
            items={FAQ_ITEMS}
            openIndex={faqIndex}
            onToggle={(i) => setFaqIndex(faqIndex === i ? null : i)}
          />
        </div>
      </Modal>
    </section>
  )
}

// ─── Field helpers ─────────────────────────────────────────────────────────────

function Field({
  id, label, value, onChange, type = 'text', required = false,
}: {
  id: string
  label: string
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-[#6B6B6B] mb-1">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-2.5 text-sm text-[#0A0A0A] placeholder:text-[#ADADAD] focus:outline-none focus:border-[#0A0A0A] transition-colors"
      />
    </div>
  )
}

function SelectField({
  id, label, value, onChange, required = false, disabled = false, children,
}: {
  id: string
  label: string
  value: string
  onChange: React.ChangeEventHandler<HTMLSelectElement>
  required?: boolean
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-[#6B6B6B] mb-1">{label}</label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {children}
      </select>
    </div>
  )
}

function TextareaField({
  id, label, value, onChange,
}: {
  id: string
  label: string
  value: string
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-[#6B6B6B] mb-1">{label}</label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-2.5 text-sm text-[#0A0A0A] placeholder:text-[#ADADAD] focus:outline-none focus:border-[#0A0A0A] transition-colors resize-none"
      />
    </div>
  )
}

// ─── FAQ Accordion ─────────────────────────────────────────────────────────────

function FAQAccordion({
  items,
  openIndex,
  onToggle,
}: {
  items: { q: string; a: string }[]
  openIndex: number | null
  onToggle: (index: number) => void
}) {
  return (
    <div className="px-6 pb-10">
      <div className="border-t border-[#E5E5E5]">
        {items.map((item, i) => (
          <div key={i} className="border-b border-[#E5E5E5]">
            <button
              type="button"
              onClick={() => onToggle(i)}
              className="w-full flex items-center justify-between py-4 text-left gap-4 cursor-pointer"
              aria-expanded={openIndex === i}
            >
              <span className="text-sm font-medium text-[#0A0A0A] tracking-[-0.01em]">
                {item.q}
              </span>
              <span className="flex-shrink-0 text-[#0A0A0A] text-lg leading-none w-5 h-5 flex items-center justify-center">
                {openIndex === i ? '−' : '+'}
              </span>
            </button>
            {openIndex === i && (
              <p className="text-sm text-[#6B6B6B] leading-relaxed pb-4">
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
