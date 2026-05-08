import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const SECRET = process.env.JWT_SECRET!

export function signToken(userId: string): string {
  return jwt.sign({ userId }, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('cinebook_token')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  return prisma.user.findUnique({ where: { id: payload.userId } })
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateBookingRef(): string {
  return 'BK' + Math.random().toString(36).slice(2, 10).toUpperCase()
}

export function computeTier(points: number): string {
  if (points >= 1000) return 'Gold'
  if (points >= 500) return 'Silver'
  return 'Bronze'
}
