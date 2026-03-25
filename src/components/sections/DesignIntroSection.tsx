'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function DesignIntroSection() {
  return (
    <section
      id="design-intro"
      className="relative min-h-screen overflow-hidden bg-[#D5D9DF]"
    >
      {/* Text block — renders first (below car in DOM stacking) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.p
          className="font-semibold text-sm tracking-widest uppercase text-[#0A0A0A]/60 mb-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          Design
        </motion.p>
        <motion.h2
          className="text-[56px] font-medium tracking-[-0.07em] leading-tight text-[#0A0A0A]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        >
          Uma forma que fala por si.
        </motion.h2>
      </div>

      {/* Car image — renders after text, naturally sits on top */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#D5D9DF]"
        initial={{ x: '110vw' }}
        whileInView={{ x: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ type: 'spring', stiffness: 60, damping: 20, mass: 1, delay: 0.5 }}
      >
        <Image
          src="/images/leaf-top-view.png"
          alt="Nissan Leaf — vista de cima"
          width={2680}
          height={1200}
          sizes="100vw"
          priority={false}
          className="w-screen min-w-[900px] h-auto"
        />
      </motion.div>
    </section>
  )
}
