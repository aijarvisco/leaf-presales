'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import type { LeadFormData } from '@/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactForm() {
  const [form, setForm] = useState<Partial<LeadFormData>>({})
  const [status, setStatus] = useState<Status>('idle')

  const set = (key: keyof LeadFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/leads', {
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
      <div className="text-center py-8">
        <p className="text-2xl font-semibold mb-2">Obrigado!</p>
        <p className="text-text-secondary">A nossa equipa entrará em contacto em breve.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Primeiro nome" value={form.firstName ?? ''} onChange={set('firstName')} required />
        <Field label="Apelido" value={form.lastName ?? ''} onChange={set('lastName')} required />
      </div>
      <Field label="Email" type="email" value={form.email ?? ''} onChange={set('email')} required />
      <Field label="Telefone" type="tel" value={form.phone ?? ''} onChange={set('phone')} required />
      <Field label="Melhor hora para contacto (opcional)" value={form.preferredContactTime ?? ''} onChange={set('preferredContactTime')} />

      <label className="flex gap-3 items-start text-sm text-text-secondary cursor-pointer">
        <input type="checkbox" required className="mt-0.5 accent-accent" />
        <span>
          Aceito que os meus dados sejam utilizados para fins de contacto comercial,
          de acordo com a{' '}
          <a href="/politica-de-privacidade" className="text-accent hover:underline">
            Política de Privacidade
          </a>.
        </span>
      </label>

      {status === 'error' && (
        <p className="text-red-400 text-sm">Ocorreu um erro. Por favor tenta novamente.</p>
      )}

      <Button type="submit" variant="primary" className="w-full" disabled={status === 'loading'}>
        {status === 'loading' ? 'A enviar...' : 'Enviar'}
      </Button>
    </form>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }: {
  label: string; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>
  type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs text-text-secondary mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  )
}
