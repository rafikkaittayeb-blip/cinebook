import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const movie = await prisma.movie.findUnique({ where: { id } })
    if (!movie) return NextResponse.json({ error: 'Movie not found' }, { status: 404 })
    return NextResponse.json({ movie })
  } catch (err) {
    console.error('Movie detail error:', err)
    return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 })
  }
}
