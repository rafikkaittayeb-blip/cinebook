import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createClient() {
  const connectionString = process.env.DATABASE_URL!
  const isRemote = !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')
  const pool = new Pool({
    connectionString,
    ssl: isRemote ? { rejectUnauthorized: false } : false,
    max: 1,                      // serverless: one connection per function instance
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])
}

// Cache across hot reloads in dev AND across invocations in production serverless
export const prisma = globalForPrisma.prisma ?? createClient()
globalForPrisma.prisma = prisma
