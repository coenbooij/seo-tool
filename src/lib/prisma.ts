import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export async function checkDatabaseConnection() {
  try {
    // Test the connection and check if the User table exists
    const userTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'User'
      );
    `
    console.log('Database connection check:', userTableExists)

    // Test if we can query users
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)

    return true
  } catch (error) {
    console.error('Database connection error:', error)
    return false
  }
}
