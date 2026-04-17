'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Ticket, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { login, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError('Please fill in both fields')
      return
    }
    const success = login(formData.email, formData.password)
    if (success) {
      setTimeout(() => router.push('/'), 600)
    } else {
      setError('Something went wrong. Try again.')
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8">

        {/* Logo */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <Ticket className="h-8 w-8 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
            <span className="text-2xl font-serif font-bold text-yellow-500 group-hover:text-yellow-400 transition-colors">CineBook</span>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-white">Welcome back</h1>
          <p className="text-gray-500 text-sm">Sign in to access your bookings</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#111] border border-[#2a2a2a] rounded-xl p-8 space-y-5">

          {error && (
            <div className="flex gap-3 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-700 text-sm focus:border-yellow-500 transition-all"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-4 py-2.5 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-700 text-sm focus:border-yellow-500 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-gray-500">
              <input type="checkbox" className="w-3.5 h-3.5 rounded border-[#2a2a2a] bg-[#0d0d0d]" />
              Remember me
            </label>
            <Link href="#" className="text-yellow-500 hover:text-yellow-400 transition-colors">Forgot password?</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold transition-all ${
              loading
                ? 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed'
                : 'bg-yellow-500 text-black hover:bg-yellow-400'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm">
          No account?{' '}
          <Link href="/register" className="text-yellow-500 hover:text-yellow-400 transition-colors font-medium">
            Create one
          </Link>
        </p>

        <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-lg p-3 text-center text-xs text-gray-600">
          Demo mode — any email and password will work
        </div>
      </div>
    </main>
  )
}