'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Ticket, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/', label: 'Movies' },
    { href: '/my-bookings', label: 'My Bookings' },
    { href: '/loyalty', label: 'Loyalty Points' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-yellow-900/30 bg-black/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Ticket className="h-7 w-7 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
            <span className="text-xl font-bold text-yellow-500 group-hover:text-yellow-400 transition-colors tracking-wide">
              CineBook
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-yellow-400 ${
                  pathname === link.href
                    ? 'text-yellow-500 border-b-2 border-yellow-500 pb-0.5'
                    : 'text-gray-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <User className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-400 font-medium">{user.name.split(' ')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-yellow-400 border border-gray-700 hover:border-yellow-500/50 transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 rounded-lg text-sm font-medium bg-yellow-500 text-black hover:bg-yellow-400 transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-400 hover:text-yellow-400 transition-colors"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-yellow-900/30 py-4 space-y-3">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block text-sm font-medium px-2 py-1.5 rounded transition-colors ${
                  pathname === link.href
                    ? 'text-yellow-500 bg-yellow-500/10'
                    : 'text-gray-400 hover:text-yellow-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-yellow-900/30 flex gap-2">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 rounded-lg text-sm text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center px-4 py-2 rounded-lg text-sm text-gray-300 border border-gray-700 hover:border-yellow-500/50 transition-all">Login</Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium bg-yellow-500 text-black hover:bg-yellow-400 transition-all">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}