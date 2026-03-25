'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function ClosingSection() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      {/* Full-screen closing section */}
      <section className="relative h-screen overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/889888a-F275-25TDIEULHD_PZ1D_20_LO.jpg"
            alt="Nissan Leaf em paisagem natural"
            fill
            className="object-cover object-center"
            priority={false}
          />
          {/* Gradient: dark top for headline, transparent middle, dark bottom for CTAs */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-amber-950/30 via-40% to-black/75" />
        </div>

        {/* Headline — top */}
        <motion.div
          className="absolute z-10 left-6 right-6 top-[45%] -translate-y-1/2 text-center"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <h2 className="text-[56px] leading-tight font-medium text-white tracking-[-0.07em]">
            Não imagine.
            <br />
            Conduza-o.
          </h2>
        </motion.div>

        {/* Bottom CTAs */}
        <motion.div
          className="absolute z-10 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 pb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row items-stretch gap-0 overflow-hidden rounded-xl">
            {/* Small CTA — submit lead */}
            <button
              onClick={() => scrollTo('contacto')}
              className="group flex flex-col justify-between gap-5 w-full sm:w-[36%] px-6 py-5 bg-neutral-900/80 backdrop-blur-sm text-left cursor-pointer transition-colors duration-200 hover:bg-neutral-900/90"
            >
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-white/40 mb-2">
                  Ser contactado
                </p>
                <p className="text-base font-light text-white/80 leading-relaxed">
                  Tem dúvidas? A nossa equipa está pronta para responder.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors duration-200">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Large CTA — reserve */}
            <button
              onClick={() => scrollTo('configurador')}
              className="group flex flex-col justify-between gap-5 flex-1 px-6 py-5 bg-[#E07055] text-left cursor-pointer transition-colors duration-200 hover:bg-[#CC6249]"
            >
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-white/60 mb-2">
                  Reservar agora
                </p>
                <p className="text-base font-light text-white leading-relaxed">
                  Garante o teu lugar com €300 totalmente reembolsável.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-neutral-900/25 flex items-center justify-center group-hover:bg-neutral-900/40 transition-colors duration-200">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      </section>

      {/* Minimal footer */}
      <footer className="bg-black py-5 px-8 flex flex-wrap items-center justify-between gap-4">
        <Image
          src="/nissan_logo.svg"
          alt="Nissan"
          width={72}
          height={24}
          className="opacity-60 hover:opacity-90 transition-opacity duration-200 invert"
        />
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-white/35">
          <Link href="/politica-de-privacidade" className="hover:text-white/70 transition-colors duration-150">
            Política de Privacidade
          </Link>
          <Link href="/termos" className="hover:text-white/70 transition-colors duration-150">
            Termos e Condições
          </Link>
          <Link href="/cookies" className="hover:text-white/70 transition-colors duration-150">
            Cookies
          </Link>
          <button
            onClick={() => scrollTo('contacto')}
            className="hover:text-white/70 transition-colors duration-150 cursor-pointer"
          >
            Contacto
          </button>
          <span className="text-white/20">© 2026 Nissan Portugal</span>
        </nav>
        <p className="w-full text-xs text-white/20 mt-1">
          Imagens meramente ilustrativas. Preços e equipamentos sujeitos a alteração.
        </p>
      </footer>
    </>
  )
}
