'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function DesignIntroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 120%', 'end end'],
  })

  const carX = useTransform(scrollYProgress, [0, 0.75], ['110vw', '0vw'])

  return (
    <section
      ref={sectionRef}
      id="design-intro"
      className="relative bg-[#D5D9DF]"
      style={{ height: '300vh' }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.p
            className="leading-none text-base md:text-xl font-medium tracking-[-0.07em] max-w-5xl mx-auto text-[#0A0A0A]/60"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            Interior
          </motion.p>
          <motion.h2
            className="font-medium tracking-[-0.07em] leading-none text-[#0A0A0A] max-w-3xl"
            style={{ fontSize: 'var(--text-display)' }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          >
            Espaço para todas as suas aventuras.
          </motion.h2>
        </div>

        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-screen"
          style={{ aspectRatio: '2680 / 1200', x: carX }}
        >
          <Image
            src="/images/interior/leaf-top-view.webp"
            alt="Nissan Leaf — vista de cima"
            fill
            className="object-contain"
            sizes="100vw"
            loading="eager"
          />
        </motion.div>

      </div>
    </section>
  )
}
