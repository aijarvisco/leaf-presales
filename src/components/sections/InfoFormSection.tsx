'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import dealersData from '@/data/concessionarios.json'
import type { ContactFormData } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = 'idle' | 'loading' | 'success' | 'error'

interface Dealer {
  designation: string
  objectId: string
  address: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const districts = dealersData.map((d) => d.district)

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
      <section id="info-form" className="bg-white pt-16 pb-16 md:pt-24 md:pb-24 xl:pt-48 xl:pb-48 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center py-16">
          <p className="text-2xl font-semibold mb-2 text-[#0A0A0A]">Obrigado!</p>
          <p className="text-[#6B6B6B]">A nossa equipa entrará em contacto em breve.</p>
        </div>
      </section>
    )
  }

  return (
    <section id="info-form" className="bg-white pt-16 pb-16 md:pt-24 md:pb-24 xl:pt-48 xl:pb-48 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">

          {/* ── Left column ── */}
          <motion.div
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
            <p className="mt-6 text-xl text-[#0A0A0A] leading-relaxed mb-10">
              Preencha o formulário e um representante Nissan entrará em contacto consigo em breve.
            </p>

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
                  <option key={d.objectId} value={d.objectId}>{d.designation}</option>
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

          {/* ── Right column — bleeds to viewport right edge ── */}
          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            style={{ marginRight: 'calc(-1 * max(24px, (100vw - 1024px) / 2 + 24px))' }}
          >
            <div className="sticky top-0 h-screen relative">
              <Image
                src="/images/nissan_leaf_driving_cta.webp"
                alt="Nissan Leaf em condução"
                fill
                className="object-cover"
                sizes="50vw"
              />
            </div>
          </motion.div>

        </div>
      </div>
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
