'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MovieImage } from '@/components/movie-image'
import Link from 'next/link'
import { ArrowLeft, Star, Clock, Calendar, Users, Play, ChevronRight } from 'lucide-react'

interface Movie {
  id: string
  title: string
  genre: string[]
  rating: number
  releaseDate: string
  duration: number
  description: string
  cast: string[]
  poster: string
  backdrop: string
  language: string
  price: number
  trailerUrl: string | null
}

interface Showtime {
  id: string
  movieId: string
  date: string
  time: string
  format: string
  availableSeats: number
  price: number
}

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [movie, setMovie] = useState<Movie | null>(null)
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/movies/${id}`).then(r => r.json()),
      fetch(`/api/movies/${id}/showtimes`).then(r => r.json()),
    ]).then(([movieData, showtimesData]) => {
      setMovie(movieData.movie || null)
      setShowtimes(showtimesData.showtimes || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
      </main>
    )
  }

  if (!movie) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-white mb-4">Movie not found</h1>
          <Link href="/" className="text-yellow-500 hover:underline">Back to home</Link>
        </div>
      </main>
    )
  }

  const byDate = showtimes.reduce((acc, st) => {
    if (!acc[st.date]) acc[st.date] = []
    acc[st.date].push(st)
    return acc
  }, {} as Record<string, Showtime[]>)

  const dates = Object.keys(byDate).sort()
  const activeDateShowtimes = selectedDate ? (byDate[selectedDate] || []) : []

  const formatDateLabel = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    if (dateStr === today) return 'Today'
    if (dateStr === tomorrow) return 'Tomorrow'
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  const handleProceed = () => {
    if (!selectedShowtime) return
    router.push(`/seat-selection?showTimeId=${selectedShowtime}`)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <MovieImage src={movie.backdrop || movie.poster} alt={movie.title} fill className="object-cover object-top" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        <button onClick={() => router.back()} className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur rounded-lg text-gray-300 hover:text-yellow-400 transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="aspect-[2/3] rounded-xl overflow-hidden border border-[#2a2a2a] shadow-2xl shadow-black">
                <MovieImage src={movie.poster} alt={movie.title} width={400} height={600} className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { icon: Star, val: movie.rating, label: 'Rating', fill: true },
                  { icon: Clock, val: `${movie.duration}m`, label: 'Duration', fill: false },
                  { icon: Calendar, val: new Date(movie.releaseDate).getFullYear(), label: 'Year', fill: false },
                ].map(stat => (
                  <div key={stat.label} className="bg-[#111] border border-[#2a2a2a] rounded-lg p-3 text-center">
                    <stat.icon className={`h-4 w-4 text-yellow-500 mx-auto mb-1 ${stat.fill ? 'fill-yellow-500' : ''}`} />
                    <p className="text-white font-bold text-sm">{stat.val}</p>
                    <p className="text-gray-600 text-xs">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8 pt-4">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">{movie.genre.map(g => <span key={g} className="genre-badge">{g}</span>)}</div>
              <h1 className="text-4xl font-serif font-bold text-white leading-tight">{movie.title}</h1>
              <p className="text-gray-500 text-sm mt-2">
                {movie.language} • {movie.duration} minutes • Released {new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-serif font-bold text-white mb-3">Synopsis</h2>
              <p className="text-gray-400 leading-relaxed">{movie.description}</p>
            </div>

            {movie.trailerUrl && (
              <div>
                <h2 className="text-lg font-serif font-bold text-white mb-3 flex items-center gap-2"><Play className="h-5 w-5 text-yellow-500" />Trailer</h2>
                <div className="aspect-video bg-[#111] border border-[#2a2a2a] rounded-xl flex flex-col items-center justify-center gap-3 group cursor-pointer hover:border-yellow-500/30 transition-colors"
                  onClick={() => window.open(movie.trailerUrl!, '_blank')}>
                  <div className="h-14 w-14 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                    <Play className="h-6 w-6 text-yellow-500 fill-yellow-500 ml-0.5" />
                  </div>
                  <p className="text-gray-500 text-sm">Watch on YouTube</p>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-serif font-bold text-white mb-3 flex items-center gap-2"><Users className="h-5 w-5 text-yellow-500" />Cast</h2>
              <div className="flex flex-wrap gap-2">
                {movie.cast.map(actor => (
                  <span key={actor} className="px-3 py-1.5 bg-[#111] border border-[#2a2a2a] rounded-lg text-gray-300 text-sm hover:border-yellow-500/30 transition-colors">{actor}</span>
                ))}
              </div>
            </div>

            <div className="border-t border-[#1a1a1a] pt-8">
              <h2 className="text-2xl font-serif font-bold text-white mb-6">Select Showtime</h2>

              {dates.length === 0 ? (
                <p className="text-gray-600 text-sm">No showtimes available for this movie.</p>
              ) : (
                <>
                  <div className="flex gap-2 flex-wrap mb-6">
                    {dates.map(date => (
                      <button key={date} onClick={() => { setSelectedDate(date); setSelectedShowtime(null) }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                          selectedDate === date ? 'bg-yellow-500 text-black border-yellow-500 font-bold' : 'bg-[#111] text-gray-400 border-[#2a2a2a] hover:border-yellow-500/40 hover:text-yellow-400'
                        }`}>
                        {formatDateLabel(date)}
                      </button>
                    ))}
                  </div>

                  {selectedDate && (
                    <div className="grid sm:grid-cols-2 gap-3 mb-6 fade-in">
                      {activeDateShowtimes.map(st => (
                        <button key={st.id} onClick={() => setSelectedShowtime(st.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            selectedShowtime === st.id ? 'border-yellow-500 bg-yellow-500/10 gold-glow' : 'border-[#2a2a2a] bg-[#111] hover:border-yellow-500/40'
                          }`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-2xl font-bold text-yellow-400">{st.time}</span>
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                              st.format === 'IMAX' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              st.format === '4DX' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                              'bg-[#1e1e1e] text-gray-500 border border-[#333]'
                            }`}>{st.format}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-xs">{st.availableSeats} seats left</span>
                            <span className="text-yellow-500 font-bold text-sm">EGP {st.price}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {!selectedDate && <p className="text-gray-600 text-sm mb-6">Pick a date to see available times</p>}
                </>
              )}

              <button onClick={handleProceed} disabled={!selectedShowtime}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  selectedShowtime ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed border border-[#2a2a2a]'
                }`}>
                Select Seats <ChevronRight className="h-5 w-5" />
              </button>
              {!selectedShowtime && <p className="text-center text-gray-600 text-xs mt-2">Select a date and time first</p>}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
