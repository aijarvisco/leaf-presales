export interface Version {
  id: string
  name: string
  price: number
  isPopular: boolean
  features: Record<string, boolean>
}

export interface ExteriorColor {
  id: string
  name: string
  hex: string
  imageSrc: string
}

export interface InclusionItem {
  label: string
  inherited: boolean
}

export const VERSIONS: Version[] = [
  {
    id: 'visia',
    name: 'Visia',
    price: 29990,
    isPopular: false,
    features: {
      'Jantes de liga leve 16"': true,
      'Faróis LED': false,
      'Ecrã 8" touchscreen': true,
      'Apple CarPlay / Android Auto': true,
      'Câmara de marcha-atrás': true,
      'Carregamento rápido CHAdeMO': false,
      'Teto de abrir': false,
      'Sistema de som premium': false,
      'Assistente de faixa': true,
      'Travagem automática de emergência': true,
    },
  },
  {
    id: 'n-connecta',
    name: 'N-Connecta',
    price: 34490,
    isPopular: true,
    features: {
      'Jantes de liga leve 16"': true,
      'Faróis LED': true,
      'Ecrã 8" touchscreen': true,
      'Apple CarPlay / Android Auto': true,
      'Câmara de marcha-atrás': true,
      'Carregamento rápido CHAdeMO': true,
      'Teto de abrir': false,
      'Sistema de som premium': false,
      'Assistente de faixa': true,
      'Travagem automática de emergência': true,
    },
  },
  {
    id: 'tekna',
    name: 'Tekna',
    price: 38990,
    isPopular: false,
    features: {
      'Jantes de liga leve 16"': true,
      'Faróis LED': true,
      'Ecrã 8" touchscreen': true,
      'Apple CarPlay / Android Auto': true,
      'Câmara de marcha-atrás': true,
      'Carregamento rápido CHAdeMO': true,
      'Teto de abrir': true,
      'Sistema de som premium': true,
      'Assistente de faixa': true,
      'Travagem automática de emergência': true,
    },
  },
]

export const EXTERIOR_COLORS: ExteriorColor[] = [
  { id: 'TURQUOISE',       name: 'Turquoise',       hex: '#4ABFBF', imageSrc: '/images/exterior-colors/TURQUOISE.png' },
  { id: 'FUJI SUNSET RED', name: 'Fuji Sunset Red', hex: '#C0392B', imageSrc: '/images/exterior-colors/FUJI SUNSET RED.png' },
  { id: 'PEARL WHITE',     name: 'Pearl White',     hex: '#F5F5F0', imageSrc: '/images/exterior-colors/PEARL WHITE.png' },
  { id: 'UNIVERSAL BLUE',  name: 'Universal Blue',  hex: '#2C4A8E', imageSrc: '/images/exterior-colors/UNIVERSAL BLUE.png' },
  { id: 'CERAMIC GREY',    name: 'Ceramic Grey',    hex: '#A8A8A0', imageSrc: '/images/exterior-colors/CERAMIC GREY.png' },
  { id: 'SKYLINE GREY',    name: 'Skyline Grey',    hex: '#6B6B6B', imageSrc: '/images/exterior-colors/SKYLINE GREY.png' },
]

export const INTERIOR_IMAGES: string[] = [
  '/images/889857a-F275-25TDIEULHD_PZ1D_01_LO.jpg',
  '/images/889858a-F275-25TDIEULHD_PZ1D_02_LO.jpg',
  '/images/889861-F275-25TDIEU_PZ1D_03_LO.jpg',
  '/images/889862-F275-25TDIEU_PZ1D_04_LO.jpg',
  '/images/889866a-F275-25TDIEULHD_PZ1D_08_LO.jpg',
  '/images/889867a-F275-25TDIEULHD_PZ1D_09_LO.jpg',
  '/images/889888a-F275-25TDIEULHD_PZ1D_20_LO.jpg',
]

/**
 * Returns the features to display in the Inclusions section for a given version.
 * - Visia: all features where value === true
 * - N-Connecta: only features that are true in N-Connecta but false in Visia (delta)
 * - Tekna: only features that are true in Tekna but false in N-Connecta (delta)
 * Returns [] for unknown version ids.
 */
export function getVersionInclusions(versionId: string): InclusionItem[] {
  const index = VERSIONS.findIndex(v => v.id === versionId)
  if (index === -1) return []

  const version = VERSIONS[index]

  if (index === 0) {
    return Object.entries(version.features)
      .filter(([, value]) => value)
      .map(([label]) => ({ label, inherited: false }))
  }

  const previous = VERSIONS[index - 1]
  return Object.entries(version.features)
    .filter(([label, value]) => value && !previous.features[label])
    .map(([label]) => ({ label, inherited: false }))
}
