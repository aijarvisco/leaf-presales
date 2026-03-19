import { Suspense } from 'react'
import ObrigadoContent from './ObrigadoContent'

export const metadata = { title: 'Reserva confirmada — Nissan Leaf' }

export default function ObrigadoPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <Suspense fallback={<p className="text-text-secondary">A carregar...</p>}>
        <ObrigadoContent />
      </Suspense>
    </main>
  )
}
