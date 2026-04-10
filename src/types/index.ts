import type { ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'ghost' | 'outline'

export interface LeadFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  preferredContactTime?: string
  privacyConsent: boolean
  marketingConsent?: boolean
}

export interface EVSavingsInputs {
  km_per_year: number
  ev_energy_price_per_kwh: number
  ice_consumption_l_per_100km: number
  fuel_price_per_l: number
  adjustment_factors?: {
    driving?: number
    temperature?: number
    load?: number
  }
}

export interface EVSavingsResult {
  ev_cost_year: number
  ice_cost_year: number
  annual_savings: number
  monthly_savings: number
  savings_per_km: number
}

export type ConfiguratorView = 'exterior' | 'interior'

export interface VehicleVersion {
  id: string
  name: string
  price: number           // starting price in €
  isPopular?: boolean
  features: Record<string, boolean | string>
}

export interface StatCardData {
  id: string
  stat: string
  unit: string
  descriptor: string
  modalContent: ReactNode
}

export interface ContactFormData {
  nome: string
  telemovel: string
  email: string
  distrito: string
  concessionarioId: string  // objectId from concessionarios.json
  mensagem?: string
  privacyConsent: boolean
  marketingConsent: boolean
}
