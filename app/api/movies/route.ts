import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const genre = searchParams.get('genre') || ''

    const movies = await prisma.movie.findMany({
      where: {
        isActive: true,
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { cast: { has: search } },
          ],
        }),
        ...(genre && genre !== 'All' && {
          genre: { has: genre },
        }),
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ movies })
  } catch (err) {
    console.error('Movies error:', err)
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 })
  }
}
