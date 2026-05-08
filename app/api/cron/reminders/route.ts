import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReminderEmail } from '@/lib/email'

// Called daily by Vercel Cron (vercel.json) or manually via GET /api/cron/reminders
// Sends a reminder to every customer with a confirmed booking for tomorrow
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (process.env.NODE_ENV === 'production' && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const bookings = await prisma.booking.findMany({
    where: {
      status: 'confirmed',
      showtime: { date: tomorrowStr },
    },
    include: {
      user: true,
      showtime: { include: { movie: true } },
      seats: { include: { seat: true } },
    },
  })

  let sent = 0
  const errors: string[] = []

  for (const booking of bookings) {
    try {
      await sendReminderEmail(booking.user.email, booking.user.name, {
        ref: booking.bookingRef,
        movieTitle: booking.showtime.movie.title,
        date: booking.showtime.date,
        time: booking.showtime.time,
        format: booking.showtime.format,
        seats: booking.seats.map(bs => `${bs.seat.row}${bs.seat.number}`),
      })
      sent++
    } catch (err) {
      errors.push(`${booking.bookingRef}: ${err}`)
    }
  }

  console.log(`Reminders sent: ${sent}/${bookings.length}`)
  return NextResponse.json({
    date: tomorrowStr,
    bookingsFound: bookings.length,
    sent,
    errors,
  })
}
