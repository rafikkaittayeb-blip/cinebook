'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'

interface Seat {
  id: string
  row: string
  number: number
  status: 'available' | 'booked'
  price: number
}

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

function SeatSelectionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const showTimeId = searchParams.get('showTimeId')

  const [seats, setSeats] = useState<Seat[]>([])
  const [showtime, setShowtime] = useState<Showtime | null>(null)
  const [movie, setMovie] = useState<Movie | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!showTimeId) { setLoading(false); return }
    fetch(`/api/showtimes/${showTimeId}/seats`)
      .then(r => r.json())
      .then(data => {
        setSeats(data.seats || [])
        if (data.showtime) setShowtime(data.showtime)
        if (data.movie) setMovie(data.movie)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [showTimeId])

  if (!showTimeId) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-serif font-bold text-white mb-4">Invalid showtime</h1>
          <Link href="/" className="text-yellow-500 hover:underline text-sm">Back to home</Link>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading seats...</p>
        </div>
      </main>
    )
  }

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

  const toggleSeat = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId)
    if (!seat || seat.status === 'booked') return
    setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId])
  }

  const totalPrice = selectedSeats.reduce((sum, seatId) => {
    return sum + (seats.find(s => s.id === seatId)?.price || 0)
  }, 0)

  const handleProceed = () => {
    if (selectedSeats.length === 0) return
    router.push(`/payment?showTimeId=${showTimeId}&seats=${selectedSeats.join(',')}`)
  }

  const formatDate = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    if (dateStr === today) return 'Today'
    if (dateStr === tomorrow) return 'Tomorrow'
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="border-b border-[#1a1a1a] bg-[#0d0d0d]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="h-4 w-px bg-[#2a2a2a]" />
          <div>
            {movie && <p className="text-white font-semibold text-sm">{movie.title}</p>}
            {showtime && <p className="text-gray-500 text-xs">{formatDate(showtime.date)} • {showtime.time} • {showtime.format}</p>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded seat-available border" /><span>Available</span></div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded seat-selected" /><span>Selected</span></div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded seat-booked" /><span>Taken</span></div>
            </div>

            <div className="text-center">
              <div className="cinema-screen inline-block w-64 h-8 flex items-center justify-center mb-2">
                <span className="text-yellow-500/70 text-xs font-bold tracking-widest uppercase">Screen</span>
              </div>
              <p className="text-gray-700 text-xs">All eyes this way</p>
            </div>

            <div className="space-y-2 overflow-x-auto">
              {rows.map(row => (
                <div key={row} className="flex items-center gap-1.5 justify-center min-w-max mx-auto">
                  <span className="w-5 text-center text-xs font-bold text-gray-600">{row}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 12 }).map((_, idx) => {
                      const seat = seats.find(s => s.row === row && s.number === idx + 1)
                      const isSelected = seat ? selectedSeats.includes(seat.id) : false
                      const isBooked = seat?.status === 'booked'
                      return (
                        <button key={`${row}${idx + 1}`}
                          onClick={() => seat && toggleSeat(seat.id)}
                          disabled={isBooked || !seat}
                          title={isBooked ? 'Taken' : seat ? `${row}${idx + 1} — EGP ${seat.price}` : ''}
                          className={`w-7 h-7 rounded text-xs flex items-center justify-center transition-all ${
                            isSelected ? 'seat-selected' : isBooked ? 'seat-booked' : 'seat-available'
                          }`}>
                          {isSelected && <Check className="h-3.5 w-3.5 text-black font-bold" />}
                        </button>
                      )
                    })}
                  </div>
                  <span className="w-5 text-center text-xs font-bold text-gray-600">{row}</span>
                </div>
              ))}
            </div>

            <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 text-xs text-gray-500 space-y-1">
              <p className="text-gray-400 font-medium mb-2">Pricing by row</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <span className="bg-[#1a1a1a] px-3 py-1.5 rounded">Rows A–B: <span className="text-yellow-500 font-bold">EGP 110</span></span>
                <span className="bg-[#1a1a1a] px-3 py-1.5 rounded">Rows C–E: <span className="text-yellow-500 font-bold">EGP 95</span></span>
                <span className="bg-[#1a1a1a] px-3 py-1.5 rounded">Rows F–H: <span className="text-yellow-500 font-bold">EGP 85</span></span>
                <span className="bg-[#1a1a1a] px-3 py-1.5 rounded">Rows I–J: <span className="text-yellow-500 font-bold">EGP 75</span></span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-[#111] border border-[#2a2a2a] rounded-xl p-6 space-y-5">
              <h3 className="text-lg font-serif font-bold text-white">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                {movie && <div className="flex justify-between text-gray-400"><span>Movie</span><span className="text-white text-right max-w-[120px] truncate">{movie.title}</span></div>}
                {showtime && <>
                  <div className="flex justify-between text-gray-400"><span>Date</span><span className="text-white">{formatDate(showtime.date)}</span></div>
                  <div className="flex justify-between text-gray-400"><span>Time</span><span className="text-white">{showtime.time}</span></div>
                  <div className="flex justify-between text-gray-400"><span>Format</span><span className="text-yellow-400 font-medium">{showtime.format}</span></div>
                </>}
              </div>

              <div className="border-t border-[#1e1e1e] pt-4">
                <p className="text-sm text-gray-400 mb-3">Selected Seats <span className="text-yellow-500 font-bold">({selectedSeats.length})</span></p>
                {selectedSeats.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSeats.map(id => {
                      const seat = seats.find(s => s.id === id)
                      return seat ? (
                        <span key={id} className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg text-xs font-bold">
                          {seat.row}{seat.number}
                        </span>
                      ) : null
                    })}
                  </div>
                ) : <p className="text-gray-600 text-xs italic">No seats picked yet</p>}
              </div>

              <div className="border-t border-[#1e1e1e] pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span className="text-white">EGP {totalPrice}</span></div>
                <div className="flex justify-between text-gray-400"><span>Booking fee</span><span className="text-white">EGP 10</span></div>
                <div className="flex justify-between items-center pt-2 border-t border-[#1e1e1e]">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-2xl font-bold text-yellow-500">EGP {totalPrice + 10}</span>
                </div>
              </div>

              <button onClick={handleProceed} disabled={selectedSeats.length === 0}
                className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                  selectedSeats.length > 0 ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed border border-[#2a2a2a]'
                }`}>
                {selectedSeats.length > 0 ? 'Proceed to Payment' : 'Select a seat first'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function SeatSelectionPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading seats...</p>
        </div>
      </main>
    }>
      <SeatSelectionContent />
    </Suspense>
  )
}
