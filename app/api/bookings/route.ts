import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, generateBookingRef, computeTier } from '@/lib/auth'
import { generateQRCode } from '@/lib/qr'
import { sendBookingConfirmation } from '@/lib/email'

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        showtime: { include: { movie: true } },
        seats: { include: { seat: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = bookings.map((b: (typeof bookings)[number]) => ({
      id: b.id,
      bookingRef: b.bookingRef,
      movieId: b.showtime.movieId,
      movieTitle: b.showtime.movie.title,
      moviePoster: b.showtime.movie.poster,
      showtimeId: b.showtimeId,
      showDate: b.showtime.date,
      showTime: b.showtime.time,
      format: b.showtime.format,
      seats: b.seats.map((bs: (typeof b.seats)[number]) => `${bs.seat.row}${bs.seat.number}`),
      totalPrice: b.totalPrice,
      status: b.status,
      qrCode: b.qrCode,
      bookingDate: b.createdAt.toISOString().split('T')[0],
    }))

    return NextResponse.json({ bookings: formatted })
  } catch (err) {
    console.error('Get bookings error:', err)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { showtimeId, seatIds, paymentMethod, cardLast4, useLoyalty, voucherId } = await req.json()

    if (!showtimeId || !seatIds?.length) {
      return NextResponse.json({ error: 'Showtime and seats are required' }, { status: 400 })
    }

    const showtime = await prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: { movie: true },
    })
    if (!showtime) return NextResponse.json({ error: 'Showtime not found' }, { status: 404 })

    const seats = await prisma.seat.findMany({
      where: { id: { in: seatIds }, showtimeId, status: 'available' },
    })
    if (seats.length !== seatIds.length) {
      return NextResponse.json({ error: 'One or more seats are no longer available' }, { status: 409 })
    }

    // Resolve voucher if provided
    let voucher = null
    if (voucherId) {
      voucher = await prisma.voucher.findFirst({
        where: { id: voucherId, userId: user.id, used: false, expiresAt: { gt: new Date() } },
      })
      if (!voucher) return NextResponse.json({ error: 'Voucher is invalid or expired' }, { status: 400 })
    }

    const seatTotal = seats.reduce((sum, s) => sum + s.price, 0)
    const bookingFee = 10
    let loyaltyUsed = 0
    let loyaltyDiscount = 0
    let voucherDiscount = 0

    // Apply voucher discount (takes priority over loyalty points)
    if (voucher) {
      if (voucher.discountType === 'full') {
        voucherDiscount = seatTotal + bookingFee  // entire booking free
      } else if (voucher.discountType === 'fixed') {
        voucherDiscount = Math.min(voucher.discountValue, seatTotal + bookingFee)
      } else if (voucher.discountType === 'percentage') {
        voucherDiscount = Math.round((seatTotal + bookingFee) * (voucher.discountValue / 100) * 100) / 100
      }
    } else if (useLoyalty && user.loyaltyPoints > 0) {
      // Loyalty points discount (only if no voucher)
      loyaltyDiscount = Math.min(user.loyaltyPoints * 0.1, seatTotal * 0.2)
      loyaltyUsed = Math.ceil(loyaltyDiscount / 0.1)
    }

    const totalPrice = Math.max(0, seatTotal + bookingFee - voucherDiscount - loyaltyDiscount)
    const bookingRef = generateBookingRef()
    const qrCode = await generateQRCode(bookingRef)

    const booking = await prisma.$transaction(async tx => {
      const newBooking = await tx.booking.create({
        data: {
          userId: user.id,
          showtimeId,
          totalPrice,
          bookingRef,
          qrCode,
          paymentMethod: voucher?.discountType === 'full' ? 'voucher' : (paymentMethod || 'card'),
          loyaltyUsed,
        },
      })

      await tx.bookingSeat.createMany({
        data: seats.map(s => ({ bookingId: newBooking.id, seatId: s.id })),
      })

      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: 'booked' },
      })

      await tx.showtime.update({
        where: { id: showtimeId },
        data: { availableSeats: { decrement: seats.length } },
      })

      await tx.payment.create({
        data: {
          bookingId: newBooking.id,
          amount: totalPrice,
          method: voucher?.discountType === 'full' ? 'voucher' : (paymentMethod || 'card'),
          cardLast4: cardLast4 || null,
        },
      })

      // Mark voucher as used
      if (voucher) {
        await tx.voucher.update({
          where: { id: voucher.id },
          data: { used: true, usedAt: new Date(), bookingId: newBooking.id },
        })
        await tx.loyaltyTransaction.create({
          data: {
            userId: user.id,
            bookingId: newBooking.id,
            points: 0,
            type: 'redeemed',
            description: `Voucher used: ${voucher.description} — ${showtime.movie.title}`,
          },
        })
      }

      // Loyalty points earned (based on what was actually paid)
      const pointsEarned = Math.floor(totalPrice)
      const newPoints = user.loyaltyPoints - loyaltyUsed + pointsEarned
      await tx.user.update({
        where: { id: user.id },
        data: { loyaltyPoints: newPoints, tier: computeTier(newPoints) },
      })

      if (loyaltyUsed > 0) {
        await tx.loyaltyTransaction.create({
          data: {
            userId: user.id,
            bookingId: newBooking.id,
            points: -loyaltyUsed,
            type: 'redeemed',
            description: `Loyalty discount — ${showtime.movie.title}`,
          },
        })
      }

      if (pointsEarned > 0) {
        await tx.loyaltyTransaction.create({
          data: {
            userId: user.id,
            bookingId: newBooking.id,
            points: pointsEarned,
            type: 'earned',
            description: `Booking — ${showtime.movie.title}`,
          },
        })
      }

      return newBooking
    })

    const seatLabels = seats.map(s => `${s.row}${s.number}`)

    let emailSent = false
    let emailError = ''
    try {
      await sendBookingConfirmation(user.email, user.name, {
        ref: bookingRef,
        movieTitle: showtime.movie.title,
        date: showtime.date,
        time: showtime.time,
        format: showtime.format,
        seats: seatLabels,
        total: totalPrice,
        qrCodeDataUrl: qrCode,
      })
      emailSent = true
    } catch (err) {
      emailError = err instanceof Error ? err.message : String(err)
      console.error('[booking] Confirmation email failed:', emailError)
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        bookingRef,
        movieTitle: showtime.movie.title,
        showDate: showtime.date,
        showTime: showtime.time,
        format: showtime.format,
        seats: seatLabels,
        totalPrice,
        qrCode,
        status: 'confirmed',
        emailSent,
        emailError: emailError || undefined,
      },
    })
  } catch (err) {
    console.error('Create booking error:', err)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
