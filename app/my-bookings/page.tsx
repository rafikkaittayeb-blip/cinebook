'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ticket, Calendar, Clock, MapPin, XCircle, AlertCircle, Film, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface Booking {
  id: string
  bookingRef: string
  movieTitle: string
  showtimeId: string
  showDate: string
  showTime: string
  format: string
  seats: string[]
  totalPrice: number
  status: 'confirmed' | 'cancelled'
  bookingDate: string
}

type DateFilter = 'all' | 'today' | 'week' | 'past'

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [refundNotice, setRefundNotice] = useState<{ id: string; amount: number } | null>(null)
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    fetch('/api/bookings')
      .then(r => r.json())
      .then(d => setBookings(d.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, authLoading])

  const handleCancel = async (booking: Booking) => {
    setCancelling(booking.id)
    setCancelError(null)
    setRefundNotice(null)
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setCancelError(data.error || 'Could not cancel booking'); return }
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'cancelled' as const } : b))
      setRefundNotice({ id: booking.id, amount: booking.totalPrice })
      setTimeout(() => setRefundNotice(null), 6000)
    } catch {
      setCancelError('Network error. Please try again.')
    } finally {
      setCancelling(null)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (dateFilter === 'today') return b.showDate === today
      if (dateFilter === 'week') return b.showDate >= today && b.showDate <= weekEnd
      if (dateFilter === 'past') return b.showDate < today
      return true
    })
  }, [bookings, dateFilter, today, weekEnd])

  const confirmed = filtered.filter(b => b.status === 'confirmed')
  const cancelled = filtered.filter(b => b.status === 'cancelled')

  const formatDate = (dateStr: string) => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    if (dateStr === today) return 'Today'
    if (dateStr === tomorrow) return 'Tomorrow'
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
      </main>
    )
  }

  const filterLabels: { key: DateFilter; label: string }[] = [
    { key: 'all', label: 'All Bookings' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'past', label: 'Past' },
  ]

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="border-b border-[#1a1a1a] bg-[#0d0d0d]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <Ticket className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-white">My Bookings</h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  {user ? `Welcome back, ${user.name.split(' ')[0]}` : 'Your cinema reservations'}
                </p>
              </div>
            </div>
            <Link href="/" className="px-4 py-2 rounded-lg bg-yellow-500 text-black text-sm font-bold hover:bg-yellow-400 transition-colors">
              Book More
            </Link>
          </div>

          {/* Date filter */}
          <div className="flex gap-2 mt-6 flex-wrap">
            {filterLabels.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDateFilter(key)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  dateFilter === key
                    ? 'bg-yellow-500 text-black border-yellow-500'
                    : 'bg-[#1a1a1a] text-gray-400 border-[#2a2a2a] hover:border-yellow-500/40 hover:text-yellow-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Refund success notice */}
        {refundNotice && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30 fade-in">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-green-400 font-medium text-sm">Booking cancelled successfully</p>
              <p className="text-gray-500 text-xs mt-0.5">
                A full refund of <span className="text-green-400 font-bold">EGP {refundNotice.amount.toFixed(2)}</span> will be processed within 5–7 business days.
              </p>
            </div>
          </div>
        )}

        {cancelError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {cancelError}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-full bg-[#111] border border-[#2a2a2a] flex items-center justify-center mb-4">
              <Ticket className="h-7 w-7 text-gray-600" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white mb-2">
              {dateFilter === 'all' ? 'No bookings yet' : 'No bookings for this period'}
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              {dateFilter === 'all' ? 'Pick a movie and grab your seats' : 'Try a different date filter'}
            </p>
            {dateFilter === 'all' ? (
              <Link href="/" className="px-6 py-2.5 rounded-xl bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition-colors text-sm">
                Browse Movies
              </Link>
            ) : (
              <button onClick={() => setDateFilter('all')} className="text-yellow-500 hover:text-yellow-400 text-sm underline">
                Show all bookings
              </button>
            )}
          </div>
        ) : (
          <>
            {confirmed.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-serif font-bold text-white">
                  Upcoming <span className="text-yellow-500">({confirmed.length})</span>
                </h2>
                <div className="space-y-3">
                  {confirmed.map(booking => (
                    <div key={booking.id} className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-yellow-500/20 transition-colors">
                      <div className="grid sm:grid-cols-4 gap-4 p-5">
                        <div className="sm:col-span-2 space-y-3">
                          <div className="flex items-center gap-2">
                            <Film className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            <h3 className="font-serif font-bold text-white">{booking.movieTitle}</h3>
                          </div>
                          <div className="space-y-1.5 text-sm">
                            <div className="flex items-center gap-2 text-gray-400">
                              <Calendar className="h-3.5 w-3.5 text-yellow-500/70" />
                              {formatDate(booking.showDate)}
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                              <Clock className="h-3.5 w-3.5 text-yellow-500/70" />
                              {booking.showTime}
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                              <MapPin className="h-3.5 w-3.5 text-yellow-500/70" />
                              Screen 1 • {booking.format}
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Seats</p>
                          <div className="flex flex-wrap gap-1.5">
                            {booking.seats.map(seat => (
                              <span key={seat} className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg text-xs font-bold">
                                {seat}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 justify-center">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Total paid</p>
                            <p className="text-yellow-500 font-bold">EGP {booking.totalPrice.toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => handleCancel(booking)}
                            disabled={cancelling === booking.id}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-medium disabled:opacity-50"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            {cancelling === booking.id ? 'Cancelling...' : 'Cancel & Refund'}
                          </button>
                        </div>
                      </div>

                      <div className="bg-[#0d0d0d] border-t border-[#1a1a1a] px-5 py-2.5 flex items-center justify-between text-xs text-gray-600">
                        <span>Ref: <span className="font-mono text-yellow-500/70 font-bold">{booking.bookingRef}</span></span>
                        <span className="text-green-500 font-medium">Confirmed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cancelled.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-serif font-bold text-gray-500">
                  Cancelled <span className="text-gray-600">({cancelled.length})</span>
                </h2>
                <div className="space-y-3">
                  {cancelled.map(booking => (
                    <div key={booking.id} className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl overflow-hidden opacity-60">
                      <div className="p-5 flex items-center justify-between">
                        <div>
                          <h3 className="font-serif font-bold text-gray-400 line-through">{booking.movieTitle}</h3>
                          <p className="text-gray-600 text-xs mt-1">{formatDate(booking.showDate)} • {booking.showTime}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium">
                            Cancelled
                          </span>
                          <p className="text-gray-700 text-xs mt-1">EGP {booking.totalPrice.toFixed(2)} refunded</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 flex gap-3">
          <AlertCircle className="h-4 w-4 text-yellow-500/70 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-500 space-y-1">
            <p className="text-gray-400 font-medium">Good to know</p>
            <p>Arrive at least 15 minutes before your showtime.</p>
            <p>Cancellations are allowed up to 2 hours before the show. Full refund within 5–7 business days.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
