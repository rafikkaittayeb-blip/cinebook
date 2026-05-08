'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Ticket, AlertCircle, CheckCircle, KeyRound } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function RegisterPage() {
  const router = useRouter()
  const { registerUser, verifyOTP } = useAuth()

  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', agreed: false })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setError('')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone) { setError('Please fill in all fields'); return }
    if (!formData.agreed) { setError('Please agree to the terms'); return }
    setLoading(true)
    setError('')
    const result = await registerUser(formData.name, formData.email, formData.phone)
    setLoading(false)
    if (!result.success) { setError(result.error || 'Registration failed'); return }
    setEmail(formData.email)
    setStep('otp')
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length < 6) { setError('Enter the 6-digit code'); return }
    setLoading(true)
    setError('')
    const result = await verifyOTP(email, otp)
    setLoading(false)
    if (!result.success) { setError(result.error || 'Invalid code'); return }
    setSuccess(true)
    setTimeout(() => router.push('/'), 2000)
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center space-y-5 fade-in">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-yellow-500" />
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-white">Account Created!</h1>
          <p className="text-gray-400 text-sm">Welcome to CineBook. Redirecting you home...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8">

        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <Ticket className="h-8 w-8 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
            <span className="text-2xl font-serif font-bold text-yellow-500 group-hover:text-yellow-400 transition-colors">CineBook</span>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-white">
            {step === 'form' ? 'Create account' : 'Verify your email'}
          </h1>
          <p className="text-gray-500 text-sm">
            {step === 'form' ? 'Start booking your cinema tickets today' : `A code was sent to ${email}`}
          </p>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleRegister} className="bg-[#111] border border-[#2a2a2a] rounded-xl p-8 space-y-4">
            {error && (
              <div className="flex gap-3 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="John Doe" disabled={loading}
                className="w-full px-4 py-2.5 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-700 text-sm focus:border-yellow-500 transition-all" />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="you@example.com" disabled={loading}
                className="w-full px-4 py-2.5 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-700 text-sm focus:border-yellow-500 transition-all" />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="+20 100 000 0000" disabled={loading}
                className="w-full px-4 py-2.5 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-700 text-sm focus:border-yellow-500 transition-all" />
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input type="checkbox" name="agreed" checked={formData.agreed} onChange={handleChange}
                className="w-4 h-4 mt-0.5 rounded border-[#2a2a2a] bg-[#0d0d0d] flex-shrink-0" />
              <span className="text-xs text-gray-500">
                I agree to the{' '}
                <Link href="#" className="text-yellow-500 hover:text-yellow-400">Terms of Service</Link>
                {' '}and{' '}
                <Link href="#" className="text-yellow-500 hover:text-yellow-400">Privacy Policy</Link>
              </span>
            </label>

            <button type="submit" disabled={loading}
              className={`w-full py-3 rounded-xl font-bold transition-all mt-2 ${
                loading ? 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed' : 'bg-yellow-500 text-black hover:bg-yellow-400'
              }`}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" /> Sending code...
                </span>
              ) : 'Create Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="bg-[#111] border border-[#2a2a2a] rounded-xl p-8 space-y-5">
            {error && (
              <div className="flex gap-3 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Verification Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input type="text" value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                  placeholder="000000" maxLength={6} disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-700 text-sm focus:border-yellow-500 transition-all font-mono tracking-widest text-center text-lg" />
              </div>
              <p className="text-xs text-gray-600 mt-1.5">Check your inbox — code expires in 10 minutes</p>
            </div>

            <button type="submit" disabled={loading || otp.length < 6}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                !loading && otp.length === 6 ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed'
              }`}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" /> Verifying...
                </span>
              ) : 'Verify & Create Account'}
            </button>

            <button type="button" onClick={() => { setStep('form'); setOtp(''); setError('') }}
              className="w-full text-center text-xs text-gray-600 hover:text-yellow-400 transition-colors">
              Go back and edit details
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-yellow-500 hover:text-yellow-400 transition-colors font-medium">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
