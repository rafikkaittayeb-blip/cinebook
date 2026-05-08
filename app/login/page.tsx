'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Ticket, AlertCircle, Mail, KeyRound, ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { sendOTP, verifyOTP } = useAuth()

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Enter your email address'); return }
    setLoading(true)
    setError('')
    const result = await sendOTP(email)
    setLoading(false)
    if (!result.success) { setError(result.error || 'Failed to send code'); return }
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
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8">

        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <Ticket className="h-8 w-8 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
            <span className="text-2xl font-serif font-bold text-yellow-500 group-hover:text-yellow-400 transition-colors">CineBook</span>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-white">Welcome back</h1>
          <p className="text-gray-500 text-sm">
            {step === 'email' ? 'Enter your email to receive a sign-in code' : `Code sent to ${email}`}
          </p>
        </div>

        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-8 space-y-5">

          {error && (
            <div className="flex gap-3 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    placeholder="you@example.com"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-700 text-sm focus:border-yellow-500 transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  loading ? 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed' : 'bg-yellow-500 text-black hover:bg-yellow-400'
                }`}
              >
                {loading ? (
                  <><div className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" /> Sending code...</>
                ) : (
                  <>Send Sign-In Code <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">6-Digit Verification Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <input
                    type="text"
                    value={otp}
                    onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                    placeholder="000000"
                    maxLength={6}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-700 text-sm focus:border-yellow-500 transition-all font-mono tracking-widest text-center text-lg"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1.5">Check your inbox — code expires in 10 minutes</p>
              </div>
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  !loading && otp.length === 6 ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" /> Verifying...
                  </span>
                ) : 'Verify & Sign In'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('email'); setOtp(''); setError('') }}
                className="w-full text-center text-xs text-gray-600 hover:text-yellow-400 transition-colors"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm">
          No account?{' '}
          <Link href="/register" className="text-yellow-500 hover:text-yellow-400 transition-colors font-medium">Create one</Link>
        </p>
      </div>
    </main>
  )
}
