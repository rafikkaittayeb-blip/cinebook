'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Star, Clock, ChevronRight, Film } from 'lucide-react'
import { MOVIES } from '@/lib/mock-data'

const GENRES = ['All', 'Action', 'Drama', 'Sci-Fi', 'Thriller', 'Fantasy', 'Comedy', 'Mystery', 'Crime', 'History', 'Romance', 'Family']

export default function HomePage() {
  const [search, setSearch] = useState('')
  const [activeGenre, setActiveGenre] = useState('All')

  const featured = MOVIES[0]
  const secondaryFeatured = MOVIES.slice(1, 5)

  const filtered = useMemo(() => {
    return MOVIES.filter(movie => {
      const matchesSearch =
        movie.title.toLowerCase().includes(search.toLowerCase()) ||
        movie.description.toLowerCase().includes(search.toLowerCase()) ||
        movie.cast.some(c => c.toLowerCase().includes(search.toLowerCase()))
      const matchesGenre = activeGenre === 'All' || movie.genre.includes(activeGenre)
      return matchesSearch && matchesGenre
    })
  }, [search, activeGenre])

  const showHero = !search && activeGenre === 'All'

  return (
    <main className="min-h-screen bg-[#0a0a0a]">

      {showHero && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-6">

          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-[#1e1e1e]" />
            <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Now Showing</span>
            <div className="h-px flex-1 bg-[#1e1e1e]" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mb-4">

            <Link href={`/movies/${featured.id}`} className="group relative rounded-2xl overflow-hidden aspect-[3/4] lg:aspect-auto lg:min-h-[580px] block">
              <Image
                src={featured.poster}
                alt={featured.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-2.5 py-1 bg-yellow-500 text-black text-xs font-bold rounded-lg">Featured</span>
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur text-white text-xs rounded-lg border border-white/10">
                  {featured.genre[0]}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {featured.genre.slice(0, 3).map(g => (
                    <span key={g} className="genre-badge">{g}</span>
                  ))}
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight mb-2">
                  {featured.title}
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 mb-4">
                  {featured.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-white font-bold">{featured.rating}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {featured.duration}m
                    </span>
                  </div>
                  <span className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg text-sm group-hover:bg-yellow-400 transition-colors">
                    Book Now <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-4">
              {secondaryFeatured.map(movie => (
                <Link key={movie.id} href={`/movies/${movie.id}`} className="group relative rounded-xl overflow-hidden aspect-[2/3] block">
                  <Image
                    src={movie.poster}
                    alt={movie.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 bg-black/70 backdrop-blur rounded-lg">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-white text-xs font-bold">{movie.rating}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-serif font-bold text-sm leading-tight group-hover:text-yellow-400 transition-colors">
                      {movie.title}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">{movie.genre[0]}</p>
                    <p className="text-yellow-500 font-bold text-xs mt-1">EGP {movie.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-10">
            {[
              { label: 'Movies Showing', value: `${MOVIES.length}+` },
              { label: 'Daily Showtimes', value: '15+' },
              { label: 'Seat Formats', value: 'IMAX • 4DX • Standard' },
            ].map(stat => (
              <div key={stat.label} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 text-center">
                <p className="text-yellow-500 font-bold text-lg">{stat.value}</p>
                <p className="text-gray-600 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={`${showHero ? 'border-t border-[#1a1a1a]' : 'pt-10'} sticky top-16 z-40 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1a1a1a] py-4 px-4`}>
        <div className="mx-auto max-w-7xl space-y-3">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
            <input
              type="text"
              placeholder="Search by title, cast, or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#111] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-700 text-sm focus:border-yellow-500 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white text-xs transition-colors">
                clear
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {GENRES.map(genre => (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeGenre === genre
                    ? 'bg-yellow-500 text-black'
                    : 'bg-[#1a1a1a] text-gray-400 hover:text-yellow-400 border border-[#2a2a2a]'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-bold text-white">
              {search ? `Results for "${search}"` : activeGenre !== 'All' ? activeGenre : 'All Movies'}
            </h2>
            <p className="text-gray-600 text-sm">{filtered.length} movies</p>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Search className="h-12 w-12 text-gray-700 mb-4" />
              <h3 className="text-xl font-serif font-bold text-gray-400 mb-2">Nothing found</h3>
              <p className="text-gray-600 text-sm mb-4">Try different keywords or clear the filters</p>
              <button
                onClick={() => { setSearch(''); setActiveGenre('All') }}
                className="text-yellow-500 hover:text-yellow-400 text-sm underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(movie => (
                <Link key={movie.id} href={`/movies/${movie.id}`} className="group">
                  <div className="movie-card bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden h-full flex flex-col">
                    <div className="relative aspect-[2/3] overflow-hidden bg-[#1a1a1a]">
                      <Image
                        src={movie.poster}
                        alt={movie.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg text-xs">
                          Book Now <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/80 rounded backdrop-blur-sm">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-white text-xs font-bold">{movie.rating}</span>
                      </div>
                    </div>
                    <div className="p-3 flex flex-col gap-1.5 flex-1">
                      <h3 className="font-serif font-bold text-white text-sm leading-tight group-hover:text-yellow-400 transition-colors line-clamp-1">
                        {movie.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>{movie.duration}m</span>
                        <span>•</span>
                        <span>{movie.genre[0]}</span>
                      </div>
                      <p className="text-yellow-500 font-bold text-xs mt-auto pt-2 border-t border-[#1e1e1e]">
                        From EGP {movie.price}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-[#1a1a1a] py-8 px-4 mt-4">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-yellow-500" />
            <span className="text-yellow-500 font-bold">CineBook</span>
          </div>
          <p className="text-gray-600 text-sm">Movies / Theatre Online Ticket Booking System — CSCE 3701</p>
        </div>
      </footer>

    </main>
  )
}