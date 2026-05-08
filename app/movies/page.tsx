'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Star, Clock, ChevronRight, SlidersHorizontal } from 'lucide-react'

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
  price: number
}

const GENRES = ['All', 'Action', 'Drama', 'Sci-Fi', 'Thriller', 'Fantasy', 'Comedy', 'Mystery', 'Crime', 'History', 'Romance', 'Family']
const SORT_OPTIONS = ['Default', 'Rating: High to Low', 'Duration: Short to Long', 'Release Date: Newest']

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [search, setSearch] = useState('')
  const [activeGenre, setActiveGenre] = useState('All')
  const [sortBy, setSortBy] = useState('Default')
  const [loadingMovies, setLoadingMovies] = useState(true)

  useEffect(() => {
    fetch('/api/movies')
      .then(r => r.json())
      .then(d => setMovies(d.movies || []))
      .catch(() => {})
      .finally(() => setLoadingMovies(false))
  }, [])

  const filtered = useMemo(() => {
    let result = movies.filter(movie => {
      const q = search.toLowerCase()
      const matchesSearch = !search ||
        movie.title.toLowerCase().includes(q) ||
        movie.description.toLowerCase().includes(q) ||
        movie.cast.some(c => c.toLowerCase().includes(q))
      const matchesGenre = activeGenre === 'All' || movie.genre.includes(activeGenre)
      return matchesSearch && matchesGenre
    })
    if (sortBy === 'Rating: High to Low') result = [...result].sort((a, b) => b.rating - a.rating)
    if (sortBy === 'Duration: Short to Long') result = [...result].sort((a, b) => a.duration - b.duration)
    if (sortBy === 'Release Date: Newest') result = [...result].sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
    return result
  }, [movies, search, activeGenre, sortBy])

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="border-b border-[#1a1a1a] bg-[#0d0d0d] py-10 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-serif font-bold text-white mb-2">All Movies</h1>
          <p className="text-gray-500 text-sm">Browse everything currently showing at CineBook</p>
          <div className="relative max-w-lg mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
            <input type="text" placeholder="Search by title, cast, or description..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#111] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-700 text-sm focus:border-yellow-500 transition-all" />
            {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white text-xs transition-colors">clear</button>}
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-40 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1a1a1a] py-3 px-4">
        <div className="mx-auto max-w-7xl flex items-center gap-4">
          <div className="flex gap-2 overflow-x-auto flex-1 pb-1">
            {GENRES.map(genre => (
              <button key={genre} onClick={() => setActiveGenre(genre)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeGenre === genre ? 'bg-yellow-500 text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-yellow-400 border border-[#2a2a2a]'
                }`}>
                {genre}
              </button>
            ))}
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-600" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="bg-[#111] border border-[#2a2a2a] text-gray-400 text-xs rounded-lg px-3 py-1.5 focus:border-yellow-500 transition-all">
              {SORT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
      </div>

      <section className="py-10 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-500 text-sm">
              {filtered.length} {filtered.length === 1 ? 'movie' : 'movies'} found
              {activeGenre !== 'All' && <span className="text-yellow-500"> in {activeGenre}</span>}
              {search && <span className="text-yellow-500"> for "{search}"</span>}
            </p>
          </div>

          {loadingMovies ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
                  <div className="aspect-[2/3] bg-[#1a1a1a] animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-[#1a1a1a] rounded animate-pulse" />
                    <div className="h-3 bg-[#1a1a1a] rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Search className="h-12 w-12 text-gray-700 mb-4" />
              <h3 className="text-xl font-serif font-bold text-gray-400 mb-2">No movies found</h3>
              <p className="text-gray-600 text-sm mb-4">Try different keywords or clear the filters</p>
              <button onClick={() => { setSearch(''); setActiveGenre('All') }} className="text-yellow-500 hover:text-yellow-400 text-sm underline">Clear everything</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(movie => (
                <Link key={movie.id} href={`/movies/${movie.id}`} className="group">
                  <div className="movie-card bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden h-full flex flex-col">
                    <div className="relative aspect-[2/3] overflow-hidden bg-[#1a1a1a]">
                      <Image src={movie.poster} alt={movie.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 text-black font-bold rounded-lg text-sm">Book Now <ChevronRight className="h-4 w-4" /></span>
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/80 rounded-lg backdrop-blur-sm">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-white text-xs font-bold">{movie.rating}</span>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <div>
                        <h3 className="font-serif font-bold text-white text-lg leading-tight group-hover:text-yellow-400 transition-colors">{movie.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-gray-500 text-xs">
                          <Clock className="h-3 w-3" /><span>{movie.duration} min</span><span>•</span><span>{new Date(movie.releaseDate).getFullYear()}</span>
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{movie.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {movie.genre.slice(0, 3).map(g => <span key={g} className="genre-badge">{g}</span>)}
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#1e1e1e]">
                        <span className="text-yellow-500 font-bold text-sm">From EGP {movie.price}</span>
                        <span className="text-xs text-gray-500 group-hover:text-yellow-400 transition-colors flex items-center gap-1">View Details <ChevronRight className="h-3 w-3" /></span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
