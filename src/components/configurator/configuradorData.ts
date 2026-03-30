export interface BatteryOption {
  kWh: 52 | 75
  price: number
  commercialCode: string
}

export interface TrimLevel {
  id: 'engage' | 'advance' | 'evolve'
  name: string
  isPopular: boolean
  batteryOptions?: BatteryOption[]
  price?: number
  highlights: string[]
  availableColorIds: string[]
}

export interface ColorOption {
  id: string
  name: string
  hex: string
  type: 'single-tone' | 'two-tone'
  colorCode: string
  imageSrc: string
}

export const TRIM_LEVELS: TrimLevel[] = [
  {
    id: 'engage',
    name: 'Engage',
    isPopular: false,
    batteryOptions: [
      { kWh: 52, price: 39900, commercialCode: 'LE52KEG20A---' },
      { kWh: 75, price: 43300, commercialCode: 'LE75KEG20A---' },
    ],
    highlights: [
      'Bateria 52 kWh ou 75 kWh',
      'Jantes de liga leve 18"',
      'Ecrã de infotenimento 12,3" + painel de instrumentos 12,3"',
      'Android Auto & Apple CarPlay',
      'ProPILOT Assist com Navi-link',
      'Travagem automática dianteira e traseira',
      'Bomba de calor + V2L + OBC 11 kW',
    ],
    availableColorIds: ['PEARL_WHITE', 'MIDNIGHT_BLACK', 'SKYLINE_GREY', 'FUJI_SUNSET_RED'],
  },
  {
    id: 'advance',
    name: 'Advance',
    isPopular: true,
    price: 49100,
    highlights: [
      'Tejadilho panorâmico escurecido',
      'Head-up display 8"',
      'Ecrã de infotenimento 14,3" + painel 14,3"',
      'Bancos e volante aquecidos',
      'Carregador wireless 15W',
      'Serviços Google integrados (Maps, Assistente, Play)',
      'Porta da bagageira elétrica',
    ],
    availableColorIds: [
      'PEARL_WHITE_BLACK_ROOF',
      'CERAMIC_GREY_BLACK_ROOF',
      'SKYLINE_GREY_BLACK_ROOF',
      'FUJI_SUNSET_RED_BLACK_ROOF',
      'UNIVERSAL_BLUE_BLACK_ROOF',
      'TURQUOISE_BLACK_ROOF',
    ],
  },
  {
    id: 'evolve',
    name: 'Evolve',
    isPopular: false,
    price: 51600,
    highlights: [
      'Jantes de liga leve 19"',
      'Banco de massagem do condutor',
      'Bancos elétricos de 8 regulações (condutor e passageiro)',
      'Sistema BOSE com subwoofer e 9 altifalantes',
    ],
    availableColorIds: [
      'PEARL_WHITE_BLACK_ROOF',
      'CERAMIC_GREY_BLACK_ROOF',
      'SKYLINE_GREY_BLACK_ROOF',
      'FUJI_SUNSET_RED_BLACK_ROOF',
      'UNIVERSAL_BLUE_BLACK_ROOF',
      'TURQUOISE_BLACK_ROOF',
    ],
  },
]

export const COLOR_OPTIONS: ColorOption[] = [
  { id: 'PEARL_WHITE',                name: 'Pearl White',                hex: '#F5F5F0', type: 'single-tone', colorCode: 'QBE', imageSrc: '/images/exterior-colors/PEARL_WHITE.png' },
  { id: 'MIDNIGHT_BLACK',             name: 'Midnight Black',             hex: '#1A1A1A', type: 'single-tone', colorCode: 'GAT', imageSrc: '/images/exterior-colors/MIDNIGHT_BLACK.png' },
  { id: 'SKYLINE_GREY',               name: 'Skyline Grey',               hex: '#6B6B6B', type: 'single-tone', colorCode: 'KAD', imageSrc: '/images/exterior-colors/SKYLINE_GREY.png' },
  { id: 'FUJI_SUNSET_RED',            name: 'Fuji Sunset Red',            hex: '#C0392B', type: 'single-tone', colorCode: 'NBV', imageSrc: '/images/exterior-colors/FUJI_SUNSET_RED.png' },
  { id: 'PEARL_WHITE_BLACK_ROOF',     name: 'Pearl White + Black Roof',   hex: '#F5F5F0', type: 'two-tone',   colorCode: 'XKJ', imageSrc: '/images/exterior-colors/PEARL_WHITE_BLACK_ROOF.png' },
  { id: 'CERAMIC_GREY_BLACK_ROOF',    name: 'Ceramic Grey + Black Roof',  hex: '#A8A8A0', type: 'two-tone',   colorCode: 'XEX', imageSrc: '/images/exterior-colors/CERAMIC_GREY_BLACK_ROOF.png' },
  { id: 'SKYLINE_GREY_BLACK_ROOF',    name: 'Skyline Grey + Black Roof',  hex: '#6B6B6B', type: 'two-tone',   colorCode: 'GAQ', imageSrc: '/images/exterior-colors/SKYLINE_GREY_BLACK_ROOF.png' },
  { id: 'FUJI_SUNSET_RED_BLACK_ROOF', name: 'Fuji Sunset Red + Black Roof', hex: '#C0392B', type: 'two-tone', colorCode: 'YAU', imageSrc: '/images/exterior-colors/FUJI_SUNSET_RED_BLACK_ROOF.png' },
  { id: 'UNIVERSAL_BLUE_BLACK_ROOF',  name: 'Universal Blue + Black Roof', hex: '#2C4A8E', type: 'two-tone', colorCode: 'XHQ', imageSrc: '/images/exterior-colors/UNIVERSAL_BLUE_BLACK_ROOF.png' },
  { id: 'TURQUOISE_BLACK_ROOF',       name: 'Turquoise + Black Roof',     hex: '#4ABFBF', type: 'two-tone',   colorCode: 'YBR', imageSrc: '/images/exterior-colors/TURQUOISE_BLACK_ROOF.png' },
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

export function getEffectivePrice(trim: TrimLevel, batteryKwh?: 52 | 75): number {
  if (trim.batteryOptions) {
    const kWh = batteryKwh ?? 75
    const opt = trim.batteryOptions.find(b => b.kWh === kWh)
    if (!opt) throw new Error(`No battery option for ${kWh} kWh in trim "${trim.id}"`)
    return opt.price
  }
  if (trim.price == null) throw new Error(`TrimLevel "${trim.id}" has no price and no batteryOptions`)
  return trim.price
}
