import type { LeadFormData } from '@/types'

const ZOHO_TOKEN_URL = 'https://accounts.zoho.eu/oauth/v2/token'
const ZOHO_LEADS_URL = 'https://www.zohoapis.eu/crm/v2/Leads'

async function getAccessToken(): Promise<string> {
  const params = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
    client_id: process.env.ZOHO_CLIENT_ID!,
    client_secret: process.env.ZOHO_CLIENT_SECRET!,
    grant_type: 'refresh_token',
  })
  const res = await fetch(`${ZOHO_TOKEN_URL}?${params}`, { method: 'POST' })
  const data = await res.json()
  if (!data.access_token) throw new Error('Failed to get Zoho access token')
  return data.access_token
}

export async function createZohoLead(lead: LeadFormData): Promise<{ id: string }> {
  const token = await getAccessToken()
  const res = await fetch(ZOHO_LEADS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: [{
        First_Name: lead.firstName,
        Last_Name: lead.lastName,
        Email: lead.email,
        Phone: lead.phone,
        Lead_Source: 'Leaf Landing Page',
        Description: lead.preferredContactTime ? `Melhor hora: ${lead.preferredContactTime}` : '',
      }],
    }),
  })
  const data = await res.json()
  const record = data.data?.[0]
  if (!record || record.status !== 'success') throw new Error('Zoho lead creation failed')
  return { id: record.details.id }
}
