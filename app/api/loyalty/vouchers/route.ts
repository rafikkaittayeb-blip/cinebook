import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ vouchers: [] })

    const vouchers = await prisma.voucher.findMany({
      where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ vouchers })
  } catch (err) {
    console.error('Vouchers error:', err)
    return NextResponse.json({ vouchers: [] })
  }
}
