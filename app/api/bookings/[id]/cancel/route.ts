import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, computeTier } from '@/lib/auth'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        showtime: true,
        seats: { include: { seat: true } },
        loyaltyTransactions: true,
      },
    })

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (booking.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (booking.status === 'cancelled') return NextResponse.json({ error: 'Already cancelled' }, { status: 400 })

    const showtimeDateTime = new Date(`${booking.showtime.date}T${convertTime(booking.showtime.time)}`)
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000)
    if (showtimeDateTime <= twoHoursFromNow) {
      return NextResponse.json({ error: 'Cannot cancel within 2 hours of showtime' }, { status: 400 })
    }

    const seatIds = booking.seats.map((bs: any) => bs.seatId)
    const pointsToReverse = booking.loyaltyTransactions
      .filter((t: any) => t.type === 'earned')
      .reduce((sum: number, t: any) => sum + t.points, 0)

    await prisma.$transaction(async (tx: any) => {
      await tx.booking.update({ where: { id }, data: { status: 'cancelled' } })

      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: 'available' },
      })

      await tx.showtime.update({
        where: { id: booking.showtimeId },
        data: { availableSeats: { increment: seatIds.length } },
      })

      if (pointsToReverse > 0) {
        const newPoints = Math.max(0, user.loyaltyPoints - pointsToReverse + booking.loyaltyUsed)
        await tx.user.update({
          where: { id: user.id },
          data: { loyaltyPoints: newPoints, tier: computeTier(newPoints) },
        })

        await tx.loyaltyTransaction.create({
          data: {
            userId: user.id,
            bookingId: id,
            points: -pointsToReverse,
            type: 'redeemed',
            description: `Cancellation reversal — booking ${booking.bookingRef}`,
          },
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Cancel booking error:', err)
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
  }
}

function convertTime(time: string): string {
  const [timePart, period] = time.split(' ')
  let [hours, minutes] = timePart.split(':').map(Number)
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
}
