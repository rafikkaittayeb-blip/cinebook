import { NextResponse } from 'next/server'

// Shows which critical env vars are PRESENT (not their values) to diagnose missing config
export async function GET() {
  return NextResponse.json({
    DATABASE_URL: !!process.env.DATABASE_URL,
    JWT_SECRET: !!process.env.JWT_SECRET,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    // Show first 10 chars of JWT_SECRET so we can confirm it's not empty
    JWT_SECRET_PREVIEW: process.env.JWT_SECRET
      ? process.env.JWT_SECRET.slice(0, 10) + '...'
      : 'MISSING',
  })
}
