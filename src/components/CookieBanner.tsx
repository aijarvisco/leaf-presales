'use client'
import CookieConsent from 'react-cookie-consent'

export default function CookieBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Aceitar"
      declineButtonText="Recusar"
      enableDeclineButton
      cookieName="leaf-cookie-consent"
      style={{ background: '#111111', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '13px' }}
      buttonStyle={{ background: '#0070C9', color: 'white', borderRadius: '999px', padding: '8px 20px', fontSize: '13px' }}
      declineButtonStyle={{ background: 'transparent', color: '#A1A1A1', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px', padding: '8px 20px', fontSize: '13px' }}
    >
      Utilizamos cookies para melhorar a tua experiência.{' '}
      <a href="/cookies" className="text-accent underline">Saber mais</a>
    </CookieConsent>
  )
}
