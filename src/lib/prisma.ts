import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export async function checkDatabaseConnection(retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect()
      
      // Test if we can query users
      await prisma.user.count()
      return true
    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, error)
      if (i === retries - 1) {
        console.error('All database connection attempts failed')
        return false
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    } finally {
      try {
        await prisma.$disconnect()
      } catch (error) {
        console.error('Error disconnecting from database:', error)
      }
    }
  }
  return false
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
