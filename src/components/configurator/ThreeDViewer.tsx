'use client'
// Three.js GLB viewer — implemented when .glb asset is available
// Toggle via NEXT_PUBLIC_CONFIGURATOR_MODE=3d
import type { ConfiguratorView } from '@/types'

interface ThreeDViewerProps {
  view: ConfiguratorView
  colorId: string
}

export default function ThreeDViewer({ view: _view, colorId: _colorId }: ThreeDViewerProps) {
  return (
    <div className="w-full aspect-video flex items-center justify-center bg-card rounded-xl">
      <p className="text-text-secondary text-sm">
        3D viewer — aguarda asset .glb do importador
      </p>
    </div>
  )
}
