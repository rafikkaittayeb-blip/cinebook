import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, computeTier } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = (body.email ?? '').trim().toLowerCase()
    const otp   = (body.otp   ?? '').trim()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
    }

    // Find the most recent valid OTP for this email
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
      // Diagnose why it failed
      const anyRecord = await prisma.oTPCode.findFirst({
        where: { email },
        orderBy: { createdAt: 'desc' },
      })

      if (!anyRecord) {
        return NextResponse.json({ error: 'No code was sent to this email. Please request a new one.' }, { status: 400 })
      }
      if (anyRecord.used) {
        return NextResponse.json({ error: 'This code has already been used. Please request a new one.' }, { status: 400 })
      }
      if (new Date(anyRecord.expiresAt) <= new Date()) {
        return NextResponse.json({ error: 'Code has expired (10 min limit). Please request a new one.' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Incorrect code. Please check and try again.' }, { status: 400 })
    }

    await prisma.oTPCode.update({ where: { id: record.id }, data: { used: true } })

    const user = await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    })

    const token = signToken(user.id)

    // Use NextResponse.cookies.set — the correct way to set cookies in Route Handlers
    const response = NextResponse.json({
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

    response.cookies.set('cinebook_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response

  } catch (err) {
    // Return the real error message so we can see what's wrong
    const message = err instanceof Error ? err.message : String(err)
    console.error('[verify-otp] Error:', message)
    return NextResponse.json(
      { error: `Verification error: ${message}` },
      { status: 500 }
    )
  }
}
