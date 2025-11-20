import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Test database connection
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`
    const dbTime = Date.now() - startTime

    // Get basic counts
    const userCount = await prisma.user.count()
    const schoolCount = await prisma.school.count()

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        connected: true,
        responseTime: `${dbTime}ms`,
        userCount,
        schoolCount
      },
      version: '1.0.0'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : 'Unknown'
      },
      database: {
        connected: false
      }
    }, { status: 500 })
  }
}