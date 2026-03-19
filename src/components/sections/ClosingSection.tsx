'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Button from '@/components/ui/Button'

export default function ClosingSection() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/placeholder-hero.jpg"
          alt="Nissan Leaf"
          fill
          className="object-cover"
          priority={false}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-6"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
          O futuro é elétrico.
          <br />
          E é agora.
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" onClick={() => scrollTo('reservar')}>
            Reservar agora
          </Button>
          <Button variant="ghost" onClick={() => scrollTo('contacto')}>
            Ser contactado
          </Button>
        </div>
      </motion.div>

      {/* Footer bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-8 py-4 bg-black/60 text-xs text-white/40">
        <span>© 2026 Nissan Portugal</span>
        <a href="/politica-de-privacidade" className="hover:text-white transition-colors">Política de Privacidade</a>
        <a href="/termos" className="hover:text-white transition-colors">Termos e Condições</a>
        <a href="/cookies" className="hover:text-white transition-colors">Cookies</a>
        <a href="#contacto" className="hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); scrollTo('contacto') }}>Contacto</a>
        <span className="w-full text-center mt-1">
          Imagens meramente ilustrativas. Preços e equipamentos sujeitos a alteração.
        </span>
      </div>
    </section>
  )
}
