import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, computeTier } from '@/lib/auth'

const REWARDS = {
  free_ticket: {
    pointsCost: 500,
    discountType: 'full' as const,
    discountValue: 0,
    description: 'Free Movie Ticket',
  },
  concession_50: {
    pointsCost: 300,
    discountType: 'fixed' as const,
    discountValue: 50,
    description: 'EGP 50 Concession Voucher',
  },
  priority_month: {
    pointsCost: 200,
    discountType: 'percentage' as const,
    discountValue: 20,
    description: 'Priority Booking — 20% Off',
  },
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { type } = await req.json()
    const reward = REWARDS[type as keyof typeof REWARDS]
    if (!reward) return NextResponse.json({ error: 'Invalid reward type' }, { status: 400 })

    if (user.loyaltyPoints < reward.pointsCost) {
      return NextResponse.json({ error: 'Not enough points' }, { status: 400 })
    }

    // Check if user already has an active unused voucher of this type
    const existing = await prisma.voucher.findFirst({
      where: { userId: user.id, type, used: false, expiresAt: { gt: new Date() } },
    })
    if (existing) {
      return NextResponse.json({ error: 'You already have an active voucher of this type' }, { status: 409 })
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const voucher = await prisma.$transaction(async tx => {
      const v = await tx.voucher.create({
        data: {
          userId: user.id,
          type,
          pointsCost: reward.pointsCost,
          discountType: reward.discountType,
          discountValue: reward.discountValue,
          description: reward.description,
          expiresAt,
        },
      })

      const newPoints = user.loyaltyPoints - reward.pointsCost
      await tx.user.update({
        where: { id: user.id },
        data: { loyaltyPoints: newPoints, tier: computeTier(newPoints) },
      })

      await tx.loyaltyTransaction.create({
        data: {
          userId: user.id,
          points: -reward.pointsCost,
          type: 'redeemed',
          description: `Redeemed: ${reward.description}`,
        },
      })

      return v
    })

    return NextResponse.json({ voucher })
  } catch (err) {
    console.error('Redeem error:', err)
    return NextResponse.json({ error: 'Failed to redeem reward' }, { status: 500 })
  }
}
