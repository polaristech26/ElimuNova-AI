import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { COMPREHENSIVE_SUBJECTS } from '@/lib/subjects'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get unique subjects from lesson plans and schemes of work
    const [lessonPlanSubjects, schemeSubjects] = await Promise.all([
      prisma.lessonPlan.findMany({
        select: { subject: true },
        distinct: ['subject']
      }),
      prisma.schemeOfWork.findMany({
        select: { subject: true },
        distinct: ['subject']
      })
    ])

    // Combine and deduplicate subjects
    const allSubjects = new Set([
      ...lessonPlanSubjects.map(lp => lp.subject),
      ...schemeSubjects.map(sw => sw.subject)
    ])

    // Convert to array and sort
    let subjects = Array.from(allSubjects).filter(Boolean).sort()

    // If no subjects found in database, use the comprehensive subjects list
    if (subjects.length === 0) {
      subjects = COMPREHENSIVE_SUBJECTS
    }

    return NextResponse.json({ subjects })

  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch subjects', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
