import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    // Fetch recent schools with their admin and student count
    const recentSchools = await prisma.school.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        schoolAdmin: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        students: {
          select: {
            id: true
          }
        },
        subscriptions: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            package: {
              select: {
                price: true
              }
            }
          }
        }
      }
    })

    // Format the data
    const formattedSchools = recentSchools.map((school: any) => {
      const adminName = school.schoolAdmin?.user 
        ? `${school.schoolAdmin.user.firstName} ${school.schoolAdmin.user.lastName}`
        : 'No Admin'
      
      const studentCount = school.students.length
      
      const monthlyRevenue = school.subscriptions.reduce((sum: number, sub: any) => sum + (sub.package?.price || 0), 0)
      const formattedRevenue = monthlyRevenue > 0 
        ? `$${monthlyRevenue.toLocaleString()}` 
        : '$0'

      return {
        id: school.id,
        name: school.name,
        admin: adminName,
        students: studentCount,
        status: school.isActive ? 'Active' : 'Inactive',
        revenue: formattedRevenue,
        createdAt: school.createdAt,
        email: school.email,
        address: school.address
      }
    })

    return NextResponse.json(formattedSchools)
  } catch (error) {
    console.error('Error fetching recent schools:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
