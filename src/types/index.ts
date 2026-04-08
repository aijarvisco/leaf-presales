import type { ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'ghost' | 'outline'

export interface LeadFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  preferredContactTime?: string
}

export interface SavingsInputs {
  monthlyFuelSpend: number   // €/month
  monthlyKm: number          // km/month
  electricityTariff: number  // €/kWh
}

export interface SavingsResult {
  monthlySavings: number
  annualSavings: number
  co2AvoidedKgPerYear: number
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
