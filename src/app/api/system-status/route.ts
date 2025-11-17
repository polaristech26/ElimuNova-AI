import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch system status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is super admin
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Test database connection
    let databaseStatus = 'healthy'
    let databaseResponseTime = 0
    try {
      const startTime = Date.now()
      await prisma.$queryRaw`SELECT 1`
      databaseResponseTime = Date.now() - startTime
    } catch (error) {
      databaseStatus = 'error'
      console.error('Database connection test failed:', error)
    }

    // Get system statistics
    const [
      totalUsers,
      activeUsers,
      totalSchools,
      activeSchools,
      totalPackages,
      activePackages,
      totalSubscriptions,
      activeSubscriptions,
      recentActivity
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.school.count(),
      prisma.school.count({ where: { isActive: true } }),
      prisma.package.count(),
      prisma.package.count({ where: { isActive: true } }),
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ])

    // Calculate system health metrics
    const userActivityRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
    const schoolActivityRate = totalSchools > 0 ? (activeSchools / totalSchools) * 100 : 0
    const subscriptionRate = totalSchools > 0 ? (activeSubscriptions / totalSchools) * 100 : 0

    // Determine overall system health
    let systemHealth = 'healthy'
    if (databaseStatus === 'error' || userActivityRate < 50 || schoolActivityRate < 50) {
      systemHealth = 'critical'
    } else if (userActivityRate < 70 || schoolActivityRate < 70 || databaseResponseTime > 1000) {
      systemHealth = 'warning'
    }

    // Get server metrics (simulated for now)
    const serverLoad = Math.random() * 100 // Simulated server load
    const memoryUsage = Math.random() * 100 // Simulated memory usage
    const diskUsage = Math.random() * 100 // Simulated disk usage

    // Determine server status
    let serverStatus = 'healthy'
    if (serverLoad > 90 || memoryUsage > 90 || diskUsage > 90) {
      serverStatus = 'critical'
    } else if (serverLoad > 70 || memoryUsage > 70 || diskUsage > 70) {
      serverStatus = 'warning'
    }

    // AI Services status (simulated - in real app, you'd ping your AI service)
    const aiServicesStatus = 'online' // This would be determined by actual AI service health checks

    // Calculate last backup time (simulated)
    const lastBackup = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Random time in last 24 hours

    const systemStatus = {
      overall: {
        status: systemHealth,
        lastChecked: new Date().toISOString(),
        uptime: process.uptime()
      },
      database: {
        status: databaseStatus,
        responseTime: databaseResponseTime,
        connectionPool: 'active'
      },
      server: {
        status: serverStatus,
        load: Math.round(serverLoad),
        memoryUsage: Math.round(memoryUsage),
        diskUsage: Math.round(diskUsage)
      },
      aiServices: {
        status: aiServicesStatus,
        responseTime: Math.round(Math.random() * 500 + 100), // Simulated response time
        lastCheck: new Date().toISOString()
      },
      backup: {
        lastBackup: lastBackup.toISOString(),
        status: 'completed',
        size: Math.round(Math.random() * 1000 + 100) + ' MB'
      },
      statistics: {
        totalUsers,
        activeUsers,
        totalSchools,
        activeSchools,
        totalPackages,
        activePackages,
        totalSubscriptions,
        activeSubscriptions,
        recentActivity,
        userActivityRate: Math.round(userActivityRate),
        schoolActivityRate: Math.round(schoolActivityRate),
        subscriptionRate: Math.round(subscriptionRate)
      }
    }

    return NextResponse.json(systemStatus)
  } catch (error) {
    console.error('Error fetching system status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
