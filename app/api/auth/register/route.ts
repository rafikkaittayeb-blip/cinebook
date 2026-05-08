import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP } from '@/lib/auth'
import { sendOTPEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing?.isVerified) {
      return NextResponse.json({ error: 'Email already registered. Please sign in.' }, { status: 409 })
    }

    let user = existing
    if (!user) {
      user = await prisma.user.create({
        data: { name, email, phone: phone || null, isVerified: false },
      })
    } else {
      user = await prisma.user.update({
        where: { email },
        data: { name, phone: phone || null },
      })
    }

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.oTPCode.create({
      data: { email, code: otp, expiresAt, userId: user.id },
    })

    // Always log OTP in dev so registration works even without email
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n📧 OTP for ${email}: ${otp}\n`)
    }

    try {
      await sendOTPEmail(email, name, otp)
    } catch (emailErr) {
      console.error('Email send failed (OTP still valid — check console above):', emailErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
