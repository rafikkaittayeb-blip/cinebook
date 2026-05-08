import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const cutoff = new Date(today)
    cutoff.setDate(cutoff.getDate() + 7)

    const fmt = (d: Date) => d.toISOString().split('T')[0]

    const showtimes = await prisma.showtime.findMany({
      where: {
        movieId: id,
        date: { gte: fmt(today), lte: fmt(cutoff) },
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    })

    return NextResponse.json({ showtimes })
  } catch (err) {
    console.error('Showtimes error:', err)
    return NextResponse.json({ error: 'Failed to fetch showtimes' }, { status: 500 })
  }
}
