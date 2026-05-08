import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
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

    // Look up the most recent unused, unexpired OTP for this email
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
      // Help diagnose: check if any OTP exists at all for this email
      const anyRecord = await prisma.oTPCode.findFirst({
        where: { email },
        orderBy: { createdAt: 'desc' },
      })

      if (!anyRecord) {
        console.error(`[verify-otp] No OTP records found for ${email}`)
        return NextResponse.json({ error: 'No code was sent to this email. Please request a new one.' }, { status: 400 })
      }

      if (anyRecord.used) {
        console.error(`[verify-otp] OTP already used for ${email}`)
        return NextResponse.json({ error: 'This code has already been used. Please request a new one.' }, { status: 400 })
      }

      if (new Date(anyRecord.expiresAt) <= new Date()) {
        console.error(`[verify-otp] OTP expired for ${email}`)
        return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 400 })
      }

      // Code exists, not expired, not used — must be a wrong code
      console.error(`[verify-otp] Wrong code for ${email}. Got: "${otp}", stored: "${anyRecord.code}"`)
      return NextResponse.json({ error: 'Incorrect code. Please check and try again.' }, { status: 400 })
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
    console.error('[verify-otp] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    )
  }
}
