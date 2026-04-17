'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, MOCK_USERS } from './mock-data'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => boolean
  register: (name: string, email: string, phone: string) => boolean
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('cinebook_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }, [])

  const login = (email: string, password: string): boolean => {
    setLoading(true)
    setTimeout(() => setLoading(false), 600)
    // demo: any email/password works
    const found = MOCK_USERS.find(u => u.email === email) || { ...MOCK_USERS[0], email, name: email.split('@')[0] }
    setUser(found)
    localStorage.setItem('cinebook_user', JSON.stringify(found))
    return true
  }

  const register = (name: string, email: string, phone: string): boolean => {
    setLoading(true)
    const newUser: User = {
      id: 'user-' + Date.now(),
      name,
      email,
      phone,
      loyaltyPoints: 0,
      memberSince: new Date().toISOString().split('T')[0],
      tier: 'Bronze'
    }
    setUser(newUser)
    localStorage.setItem('cinebook_user', JSON.stringify(newUser))
    setTimeout(() => setLoading(false), 600)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('cinebook_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}