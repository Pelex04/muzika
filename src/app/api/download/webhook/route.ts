import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyPayment, type PaychanguWebhookPayload } from '@/lib/paychangu'

export async function POST(req: NextRequest) {
  const payload: PaychanguWebhookPayload = await req.json()

  if (payload.event !== 'charge.completed') {
    return NextResponse.json({ received: true })
  }

  const { tx_ref, status, amount } = payload.data

  if (status !== 'successful') {
    // Mark purchase as failed
    const supabase = await createServiceClient() as any
    await supabase
      .from('purchases')
      .update({ payment_status: 'failed' })
      .eq('payment_reference', tx_ref)
    return NextResponse.json({ received: true })
  }

  // Verify with Paychangu API (prevents spoofed webhooks)
  const verification = await verifyPayment(tx_ref)
  if (verification.status !== 'successful') {
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  }

  // Mark purchase as completed using service role (bypasses RLS)
  const supabase = await createServiceClient() as any
  const { error } = await supabase
    .from('purchases')
    .update({ payment_status: 'completed' })
    .eq('payment_reference', tx_ref)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Increment download count on track
  const { data: purchase } = await supabase
    .from('purchases')
    .select('track_id')
    .eq('payment_reference', tx_ref)
    .single()

  if (purchase) {
    await supabase
      .from('tracks')
      .update({ download_count: supabase.rpc('increment_download_count', { track_id: purchase.track_id }) as any })
      .eq('id', purchase.track_id)
  }

  return NextResponse.json({ received: true })
}
