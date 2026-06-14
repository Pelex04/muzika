// Paychangu MWK Payment Integration
// Docs: https://paychangu.com/documentation

export interface PaychanguInitPayload {
  amount: number          // in MWK
  currency: 'MWK'
  email: string
  first_name: string
  last_name: string
  callback_url: string    // webhook URL
  return_url: string      // redirect after payment
  tx_ref: string          // unique transaction reference
  customization: {
    title: string
    description: string
  }
}

export interface PaychanguResponse {
  status: 'success' | 'failed'
  message: string
  data?: {
    link: string          // redirect user to this URL
    tx_ref: string
  }
}

export interface PaychanguWebhookPayload {
  event: 'charge.completed' | 'charge.failed'
  data: {
    tx_ref: string
    flw_ref: string
    id: number
    amount: number
    currency: string
    status: 'successful' | 'failed'
    customer: {
      email: string
      name: string
    }
  }
}

const PAYCHANGU_BASE = 'https://api.paychangu.com'

export async function initiatePayment(payload: PaychanguInitPayload): Promise<PaychanguResponse> {
  const res = await fetch(`${PAYCHANGU_BASE}/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Paychangu error: ${err}`)
  }

  return res.json()
}

export async function verifyPayment(txRef: string): Promise<{ status: string; amount: number }> {
  const res = await fetch(`${PAYCHANGU_BASE}/verify-payment/${txRef}`, {
    headers: {
      'Authorization': `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
    },
  })

  if (!res.ok) throw new Error('Payment verification failed')
  const data = await res.json()
  return { status: data.data?.status, amount: data.data?.amount }
}

export function generateTxRef(userId: string, trackId: string): string {
  const ts = Date.now()
  return `MZK-${userId.slice(0, 8)}-${trackId.slice(0, 8)}-${ts}`
}

// Re-export from utils so both files resolve correctly
export function calcPlatformFee(price: number, feePercent = 0.15) {
  const fee = Math.round(price * feePercent)
  return { fee, artistPayout: price - fee }
}
