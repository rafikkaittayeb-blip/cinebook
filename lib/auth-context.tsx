'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  loyaltyPoints: number
  memberSince: string
  tier: 'Bronze' | 'Silver' | 'Gold'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  sendOTP: (email: string) => Promise<{ success: boolean; error?: string }>
  registerUser: (name: string, email: string, phone: string) => Promise<{ success: boolean; error?: string }>
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setUser(data.user ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refreshUser() }, [])

  const sendOTP = async (email: string) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      return res.ok ? { success: true } : { success: false, error: data.error }
    } catch {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const registerUser = async (name: string, email: string, phone: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      })
      const data = await res.json()
      return res.ok ? { success: true } : { success: false, error: data.error }
    } catch {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.error }
      setUser(data.user)
      return { success: true }
    } catch {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const logout = () => {
    setUser(null)
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  }

  return (
    <AuthContext.Provider value={{ user, loading, sendOTP, registerUser, verifyOTP, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
