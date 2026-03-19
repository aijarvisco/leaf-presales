'use client'
import { motion } from 'framer-motion'
import type { ConfiguratorView } from '@/types'
import Canvas360Viewer from './Canvas360Viewer'
import InteriorViewer from './InteriorViewer'

interface ConfiguratorViewerProps {
  view: ConfiguratorView
  onFirstInteraction?: () => void
}

export default function ConfiguratorViewer({ view, onFirstInteraction }: ConfiguratorViewerProps) {
  return (
    <div className="relative w-full h-full">
      {/* Exterior — stays mounted */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: view === 'exterior' ? 1 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{ pointerEvents: view === 'exterior' ? 'auto' : 'none' }}
      >
        <Canvas360Viewer onFirstInteraction={onFirstInteraction} />
      </motion.div>

      {/* Interior — stays mounted */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: view === 'interior' ? 1 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{ pointerEvents: view === 'interior' ? 'auto' : 'none' }}
      >
        <InteriorViewer />
      </motion.div>
    </div>
  )
}
