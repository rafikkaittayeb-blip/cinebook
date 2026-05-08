'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CreditCard, Check, Lock } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface Showtime {
  id: string
  date: string
  time: string
  format: string
  price: number
}

interface Movie {
  id: string
  title: string
}

interface Seat {
  id: string
  row: string
  number: number
  price: number
}

interface BookingResult {
  bookingRef: string
  movieTitle: string
  showDate: string
  showTime: string
  format: string
  seats: string[]
  totalPrice: number
  qrCode: string
}

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const showTimeId = searchParams.get('showTimeId')
  const seatsParam = searchParams.get('seats')
  const selectedSeatIds = seatsParam ? seatsParam.split(',') : []

  const [showtime, setShowtime] = useState<Showtime | null>(null)
  const [movie, setMovie] = useState<Movie | null>(null)
  const [seatDetails, setSeatDetails] = useState<Seat[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit'>('credit')
  const [useLoyalty, setUseLoyalty] = useState(false)
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ cardName: '', cardNumber: '', expiry: '', cvv: '' })

  useEffect(() => {
    if (!showTimeId) { setLoadingData(false); return }
    fetch(`/api/showtimes/${showTimeId}/seats`)
      .then(r => r.json())
      .then(data => {
        if (data.showtime) setShowtime(data.showtime)
        if (data.movie) setMovie(data.movie)
        const allSeats: Seat[] = data.seats || []
        setSeatDetails(allSeats.filter(s => selectedSeatIds.includes(s.id)))
      })
      .catch(() => {})
      .finally(() => setLoadingData(false))
  }, [showTimeId])

  if (!showTimeId || selectedSeatIds.length === 0) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-serif font-bold text-white mb-4">Invalid booking</h1>
          <Link href="/" className="text-yellow-500 hover:underline text-sm">Back to home</Link>
        </div>
      </main>
    )
  }

  if (loadingData) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
      </main>
    )
  }

  const seatTotal = seatDetails.reduce((sum, s) => sum + s.price, 0)
  const bookingFee = 10
  const loyaltyDiscount = useLoyalty && user ? Math.min(user.loyaltyPoints * 0.1, seatTotal * 0.2) : 0
  const total = seatTotal + bookingFee - loyaltyDiscount

  const formatDate = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    if (dateStr === today) return 'Today'
    if (dateStr === tomorrow) return 'Tomorrow'
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  const formatExpiry = (val: string) =>
    val.replace(/\D/g, '').slice(0, 4).replace(/(.{2})/, '$1/')

  const handleSubmit = async () => {
    if (!formData.cardName || !formData.cardNumber || !formData.expiry || !formData.cvv) return
    if (!user) { router.push('/login'); return }

    setLoading(true)
    setError('')
    try {
      const cardLast4 = formData.cardNumber.replace(/\s/g, '').slice(-4)
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showtimeId: showTimeId,
          seatIds: selectedSeatIds,
          paymentMethod,
          cardLast4,
          useLoyalty,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Booking failed'); return }
      setBookingResult(data.booking)
      setConfirmed(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (confirmed && bookingResult) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6 fade-in">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500 flex items-center justify-center">
              <Check className="h-10 w-10 text-yellow-500" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-gray-400 text-sm">Your tickets are ready. Enjoy the show!</p>
          </div>

          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-6 text-left space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Movie</span><span className="text-white font-medium">{bookingResult.movieTitle}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Date</span><span className="text-white">{formatDate(bookingResult.showDate)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Time</span><span className="text-white">{bookingResult.showTime}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Format</span><span className="text-yellow-400 font-medium">{bookingResult.format}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Seats</span><span className="text-yellow-400 font-bold">{bookingResult.seats.join(', ')}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Total Paid</span><span className="text-yellow-500 font-bold">EGP {bookingResult.totalPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Booking Ref</span><span className="text-white font-mono font-bold">{bookingResult.bookingRef}</span></div>
          </div>

          {bookingResult.qrCode && (
            <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-3 mx-auto w-52">
              <Image src={bookingResult.qrCode} alt="QR Code" width={160} height={160} className="rounded" unoptimized />
              <p className="text-black text-xs font-mono font-bold">{bookingResult.bookingRef}</p>
            </div>
          )}
          <p className="text-gray-600 text-xs">Show this QR code at the cinema entrance</p>
          <p className="text-gray-600 text-xs">A confirmation email has been sent to {user?.email}</p>

          <div className="flex gap-3">
            <Link href="/my-bookings" className="flex-1 py-3 rounded-xl border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-colors text-sm font-medium text-center">My Bookings</Link>
            <Link href="/" className="flex-1 py-3 rounded-xl bg-yellow-500 text-black hover:bg-yellow-400 transition-colors text-sm font-bold text-center">Book Another</Link>
          </div>
        </div>
      </main>
    )
  }

  const seatLabels = seatDetails.map(s => `${s.row}${s.number}`)

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="border-b border-[#1a1a1a] bg-[#0d0d0d]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="h-4 w-px bg-[#2a2a2a]" />
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Lock className="h-3.5 w-3.5 text-yellow-500" /> Secure Payment
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-serif font-bold text-white mb-8">Complete Your Booking</h1>

        {!user && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
            You must be signed in to complete a booking.{' '}
            <Link href="/login" className="underline font-bold">Sign in</Link>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
        )}

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">Payment Method</h2>
              <div className="grid grid-cols-2 gap-2">
                {(['credit', 'debit'] as const).map(method => (
                  <button key={method} onClick={() => setPaymentMethod(method)}
                    className={`py-2.5 rounded-lg text-sm font-medium transition-all border ${
                      paymentMethod === method ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400' : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-yellow-500/30'
                    }`}>
                    {method === 'credit' ? 'Credit Card' : 'Debit Card'}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-yellow-500" /> Card Details
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Cardholder Name</label>
                  <input type="text" placeholder="Name on card" value={formData.cardName}
                    onChange={e => setFormData(p => ({ ...p, cardName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-700 text-sm focus:border-yellow-500 transition-all" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Card Number</label>
                  <input type="text" placeholder="0000 0000 0000 0000" value={formData.cardNumber}
                    onChange={e => setFormData(p => ({ ...p, cardNumber: formatCardNumber(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-700 text-sm focus:border-yellow-500 transition-all font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Expiry Date</label>
                    <input type="text" placeholder="MM/YY" value={formData.expiry}
                      onChange={e => setFormData(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                      className="w-full px-4 py-2.5 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-700 text-sm focus:border-yellow-500 transition-all font-mono" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">CVV</label>
                    <input type="password" placeholder="•••" maxLength={4} value={formData.cvv}
                      onChange={e => setFormData(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      className="w-full px-4 py-2.5 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-700 text-sm focus:border-yellow-500 transition-all font-mono" />
                  </div>
                </div>
              </div>
            </div>

            {user && user.loyaltyPoints > 0 && (
              <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-white">Use Loyalty Points</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      You have <span className="text-yellow-400 font-bold">{user.loyaltyPoints} pts</span> — saves EGP {(user.loyaltyPoints * 0.1).toFixed(0)}
                    </p>
                  </div>
                  <div onClick={() => setUseLoyalty(!useLoyalty)}
                    className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${useLoyalty ? 'bg-yellow-500' : 'bg-[#2a2a2a]'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${useLoyalty ? 'left-6' : 'left-1'}`} />
                  </div>
                </label>
              </div>
            )}

            <button onClick={handleSubmit}
              disabled={loading || !formData.cardName || !formData.cardNumber || !formData.expiry || !formData.cvv || !user}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                !loading && formData.cardName && formData.cardNumber && formData.expiry && formData.cvv && user
                  ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                  : 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed border border-[#2a2a2a]'
              }`}>
              {loading ? (
                <><div className="h-5 w-5 rounded-full border-2 border-black border-t-transparent animate-spin" />Processing...</>
              ) : (
                <><Lock className="h-5 w-5" />Pay EGP {total.toFixed(2)}</>
              )}
            </button>
            <p className="text-center text-gray-600 text-xs">Your payment is encrypted and secure</p>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-[#111] border border-[#2a2a2a] rounded-xl p-6 space-y-5">
              <h2 className="text-lg font-serif font-bold text-white">Order Summary</h2>
              <div className="space-y-3 text-sm">
                {movie && <div className="flex justify-between text-gray-400"><span>Movie</span><span className="text-white font-medium text-right max-w-[140px]">{movie.title}</span></div>}
                {showtime && <>
                  <div className="flex justify-between text-gray-400"><span>Date</span><span className="text-white">{formatDate(showtime.date)}</span></div>
                  <div className="flex justify-between text-gray-400"><span>Time</span><span className="text-white">{showtime.time}</span></div>
                  <div className="flex justify-between text-gray-400"><span>Format</span><span className="text-yellow-400">{showtime.format}</span></div>
                </>}
                <div className="flex justify-between text-gray-400"><span>Seats</span><span className="text-white">{seatLabels.join(', ')}</span></div>
              </div>
              <div className="border-t border-[#1e1e1e] pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>{seatDetails.length} seat(s)</span>
                  <span className="text-white">EGP {seatTotal}</span>
                </div>
                <div className="flex justify-between text-gray-400"><span>Booking fee</span><span className="text-white">EGP {bookingFee}</span></div>
                {useLoyalty && loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-yellow-500"><span>Loyalty discount</span><span>- EGP {loyaltyDiscount.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-[#1e1e1e]">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-2xl font-bold text-yellow-500">EGP {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
      </main>
    }>
      <PaymentContent />
    </Suspense>
  )
}
