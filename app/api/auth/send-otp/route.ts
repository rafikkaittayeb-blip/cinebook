import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP } from '@/lib/auth'
import { sendOTPEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'No account found with this email. Please register.' }, { status: 404 })
    }

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.oTPCode.create({
      data: { email, code: otp, expiresAt, userId: user.id },
    })

    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n📧 OTP for ${email}: ${otp}\n`)
    }

    try {
      await sendOTPEmail(email, user.name, otp)
    } catch (emailErr) {
      console.error('Email send failed (OTP still valid — check console above):', emailErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Send OTP error:', err)
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 })
  }
}
