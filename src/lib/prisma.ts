import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // Parse and encode database URL components
  try {
    const url = new URL(databaseUrl.replace('postgresql://', 'http://'))
    const username = encodeURIComponent(url.username)
    const password = encodeURIComponent(url.password)
    const encodedUrl = `postgresql://${username}:${password}@${url.host}${url.pathname}${url.search}`

    // Create client with additional logging in development
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: encodedUrl
        },
      },
    })
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error)
    throw error
  }
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export async function checkDatabaseConnection(retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect()
      
      // Test if we can actually query the database
      await prisma.user.count()
      console.log('Database connection successful')
      return true
    } catch (error) {
      const prismaError = error as Prisma.PrismaClientKnownRequestError
      console.error(`Database connection attempt ${i + 1} failed:`, {
        message: prismaError.message,
        code: prismaError.code,
        clientVersion: prismaError.clientVersion,
        meta: prismaError.meta
      })

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

// Prevent multiple instances of Prisma Client in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
