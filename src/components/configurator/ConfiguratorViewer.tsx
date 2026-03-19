'use client'
import type { ConfiguratorView } from '@/types'
import ImageSequenceViewer from './ImageSequenceViewer'
import ThreeDViewer from './ThreeDViewer'

// Placeholder image sets — replace with real assets
const PLACEHOLDER_IMAGES = {
  exterior: {
    branco: ['/images/placeholder-hero.jpg'],
    azul: ['/images/placeholder-hero.jpg'],
    cinzento: ['/images/placeholder-hero.jpg'],
  },
  interior: {
    branco: ['/images/placeholder-hero.jpg'],
    azul: ['/images/placeholder-hero.jpg'],
    cinzento: ['/images/placeholder-hero.jpg'],
  },
}

interface ConfiguratorViewerProps {
  view: ConfiguratorView
  colorId: string
}

const mode = process.env.NEXT_PUBLIC_CONFIGURATOR_MODE ?? 'image-sequence'

export default function ConfiguratorViewer({ view, colorId }: ConfiguratorViewerProps) {
  if (mode === '3d') {
    return <ThreeDViewer view={view} colorId={colorId} />
  }
  return <ImageSequenceViewer view={view} colorId={colorId} images={PLACEHOLDER_IMAGES} />
}
