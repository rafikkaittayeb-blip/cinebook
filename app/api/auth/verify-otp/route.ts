import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { signToken, computeTier } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
    }

    const record = await prisma.oTPCode.findFirst({
      where: {
        email,
        code: otp,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }

    await prisma.oTPCode.update({ where: { id: record.id }, data: { used: true } })

    const user = await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    })

    const token = signToken(user.id)
    const cookieStore = await cookies()
    cookieStore.set('cinebook_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })

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
  } catch (err) {
    console.error('Verify OTP error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
