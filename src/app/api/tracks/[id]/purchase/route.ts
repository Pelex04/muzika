import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initiatePayment, generateTxRef, calcPlatformFee } from '@/lib/paychangu'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: trackId } = await params
  const supabase = await createClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get track + artist
  const { data: track } = await supabase
    .from('tracks')
    .select('*, artist:artists(stage_name, profile:profiles(email))')
    .eq('id', trackId)
    .single()

  if (!track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })

  // Check not already purchased
  const { data: existing } = await supabase
    .from('purchases')
    .select('id, payment_status')
    .eq('user_id', user.id)
    .eq('track_id', trackId)
    .single()

  if (existing?.payment_status === 'completed') {
    return NextResponse.json({ error: 'Already purchased' }, { status: 409 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  const txRef = generateTxRef(user.id, trackId)
  const { fee, artistPayout } = calcPlatformFee(track.price_mwk)

  // Create pending purchase record
  await supabase.from('purchases').upsert({
    user_id: user.id,
    track_id: trackId,
    amount_mwk: track.price_mwk,
    platform_fee_mwk: fee,
    artist_payout_mwk: artistPayout,
    payment_reference: txRef,
    payment_status: 'pending',
  })

  const nameParts = (profile?.full_name || 'Muzika User').split(' ')

  try {
    const payment = await initiatePayment({
      amount: track.price_mwk,
      currency: 'MWK',
      email: profile?.email || user.email!,
      first_name: nameParts[0],
      last_name: nameParts[1] ?? nameParts[0],
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/download/webhook`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/now-playing?track=${trackId}&tx=${txRef}`,
      tx_ref: txRef,
      customization: {
        title: `Buy: ${track.title}`,
        description: `Download ${track.title} by ${track.artist?.stage_name} – ${track.price_mwk} MWK`,
      },
    })

    if (payment.status === 'success' && payment.data?.link) {
      return NextResponse.json({ paymentUrl: payment.data.link, txRef })
    }

    return NextResponse.json({ error: 'Payment initiation failed' }, { status: 500 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
