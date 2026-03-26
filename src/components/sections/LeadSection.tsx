'use client'
import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import ContactDrawer from '@/components/ui/ContactDrawer'

export default function LeadSection() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section id="contacto" className="bg-white pt-48 pb-48">
      <div className="max-w-5xl mx-auto px-6">

        {/* Title */}
        <motion.h2
          className="text-[56px] leading-none font-medium text-[#0A0A0A] tracking-[-0.07em] mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          Ainda com dúvidas?
        </motion.h2>

        {/* Image banner */}
        <motion.div
          className="relative h-[480px] w-full overflow-hidden rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          <Image
            src="/images/889858a-F275-25TDIEULHD_PZ1D_02_LO.jpg"
            alt="Nissan Leaf"
            fill
            className="object-cover"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Overlaid text + CTA */}
          <div className="absolute bottom-8 left-8">
            <p className="text-white text-xl font-medium mb-4">
              Fala com a nossa equipa.
            </p>
            <Button variant="primary" onClick={() => setIsOpen(true)}>
              Pedir informações
            </Button>
          </div>
        </motion.div>

      </div>

      <ContactDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </section>
  )
}
