import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

function rowPrice(row: string): number {
  if (['A', 'B'].includes(row)) return 110
  if (['C', 'D', 'E'].includes(row)) return 95
  if (['F', 'G', 'H'].includes(row)) return 85
  return 75
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const showtime = await prisma.showtime.findUnique({
      where: { id },
      include: { movie: true },
    })
    if (!showtime) return NextResponse.json({ error: 'Showtime not found' }, { status: 404 })

    let seats = await prisma.seat.findMany({
      where: { showtimeId: id },
      orderBy: [{ row: 'asc' }, { number: 'asc' }],
    })

    if (seats.length === 0) {
      const seatsData = ROWS.flatMap(row =>
        Array.from({ length: 12 }, (_, i) => ({
          showtimeId: id,
          row,
          number: i + 1,
          status: 'available',
          price: rowPrice(row),
        }))
      )
      await prisma.seat.createMany({ data: seatsData })
      seats = await prisma.seat.findMany({
        where: { showtimeId: id },
        orderBy: [{ row: 'asc' }, { number: 'asc' }],
      })
    }

    return NextResponse.json({
      seats,
      showtime: {
        id: showtime.id,
        movieId: showtime.movieId,
        date: showtime.date,
        time: showtime.time,
        format: showtime.format,
        availableSeats: showtime.availableSeats,
        price: showtime.price,
      },
      movie: { id: showtime.movie.id, title: showtime.movie.title },
    })
  } catch (err) {
    console.error('Seats error:', err)
    return NextResponse.json({ error: 'Failed to fetch seats' }, { status: 500 })
  }
}
