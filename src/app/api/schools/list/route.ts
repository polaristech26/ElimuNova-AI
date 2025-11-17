import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch schools list for dropdowns
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

    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        address: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(schools)
  } catch (error) {
    console.error('Error fetching schools list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
