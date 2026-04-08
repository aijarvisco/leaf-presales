/**
 * @jest-environment node
 */
import type { ContactFormData } from '@/types'

describe('ContactFormData type', () => {
  it('exists and has expected shape', () => {
    const data: ContactFormData = {
      nome: 'João',
      telemovel: '+351912345678',
      email: 'joao@example.com',
      distrito: 'LISBOA',
      concessionarioId: 'NI00100003',
      privacyConsent: true,
      marketingConsent: false,
    }
    expect(data.nome).toBe('João')
  })
})
