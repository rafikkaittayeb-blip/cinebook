import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, computeTier } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const transactions = await prisma.loyaltyTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonth = transactions
      .filter(t => t.type === 'earned' && new Date(t.createdAt) >= startOfMonth)
      .reduce((sum, t) => sum + t.points, 0)

    return NextResponse.json({
      points: user.loyaltyPoints,
      tier: computeTier(user.loyaltyPoints),
      thisMonth,
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        description: t.description,
        points: t.points,
        date: t.createdAt.toISOString().split('T')[0],
      })),
    })
  } catch (err) {
    console.error('Loyalty error:', err)
    return NextResponse.json({ error: 'Failed to fetch loyalty data' }, { status: 500 })
  }
}
