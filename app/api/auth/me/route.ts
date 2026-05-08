import { NextResponse } from 'next/server'
import { getAuthUser, computeTier } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ user: null })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        loyaltyPoints: user.loyaltyPoints,
        memberSince: user.memberSince.toISOString().split('T')[0],
        tier: computeTier(user.loyaltyPoints),
      },
    })
  } catch {
    return NextResponse.json({ user: null })
  }
}
