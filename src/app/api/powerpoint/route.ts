import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get search parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const subject = searchParams.get('subject')
    const grade = searchParams.get('grade')

    // Find the teacher
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: { user: true }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Build where clause for filtering
    const whereClause: any = {
      teacherId: teacher.id,
      type: 'POWERPOINT'
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { grade: { contains: search, mode: 'insensitive' } },
        { topic: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (subject) {
      whereClause.subject = subject
    }

    if (grade) {
      whereClause.grade = grade
    }

    // Fetch PowerPoint presentations
    const powerpoints = await prisma.aIGeneratedContent.findMany({
      where: whereClause,
      include: {
        teacher: {
          include: {
            user: true
          }
        },
        _count: {
          select: {
            sharedWithStudents: true,
            sharedWithClasses: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform the data to match the expected PowerPoint interface
    const transformedPowerpoints = powerpoints.map((ppt: any) => ({
      id: ppt.id,
      title: ppt.title,
      subject: ppt.subject,
      grade: ppt.grade,
      topic: ppt.topic,
      content: typeof ppt.content === 'string' ? JSON.parse(ppt.content) : ppt.content,
      metadata: ppt.metadata,
      isShared: ppt.isShared,
      createdAt: ppt.createdAt.toISOString(),
      updatedAt: ppt.updatedAt.toISOString(),
      teacher: {
        id: ppt.teacher.id,
        user: {
          firstName: ppt.teacher.user.firstName,
          lastName: ppt.teacher.user.lastName
        }
      }
    }))

    return NextResponse.json({ 
      powerpoints: transformedPowerpoints,
      total: transformedPowerpoints.length
    })

  } catch (error) {
    console.error('Error fetching PowerPoint presentations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch PowerPoint presentations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      title,
      description,
      subject,
      grade,
      topic,
      duration,
      slideCount,
      slides,
      metadata
    } = await request.json()

    // Validate required fields
    if (!title || !subject || !grade || !topic) {
      return NextResponse.json(
        { error: 'Title, subject, grade, and topic are required' },
        { status: 400 }
      )
    }

    // Find the teacher
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Create the PowerPoint content structure
    const contentData = {
      slides: slides || [],
      duration: duration || 45,
      slideCount: slideCount || slides?.length || 0,
      metadata: {
        objectives: metadata?.objectives || [],
        difficulty: metadata?.difficulty || 'medium',
        format: metadata?.format || 'standard',
        generatedAt: metadata?.generatedAt || new Date().toISOString(),
        ...metadata
      }
    }

    // Save to database
    const powerpoint = await prisma.aIGeneratedContent.create({
      data: {
        title,
        content: JSON.stringify(contentData),
        type: 'POWERPOINT',
        subject,
        grade,
        topic,
        metadata: {
          description,
          duration,
          slideCount: contentData.slideCount,
          createdBy: 'ai-content-hub',
          ...metadata
        },
        teacherId: teacher.id,
        isShared: false
      },
      include: {
        teacher: {
          include: {
            user: true
          }
        }
      }
    })

    // Transform response to match expected format
    const response = {
      id: powerpoint.id,
      title: powerpoint.title,
      subject: powerpoint.subject,
      grade: powerpoint.grade,
      topic: powerpoint.topic,
      content: contentData,
      metadata: powerpoint.metadata,
      isShared: powerpoint.isShared,
      createdAt: powerpoint.createdAt.toISOString(),
      updatedAt: powerpoint.updatedAt.toISOString(),
      teacher: {
        id: powerpoint.teacher.id,
        user: {
          firstName: powerpoint.teacher.user.firstName,
          lastName: powerpoint.teacher.user.lastName
        }
      }
    }

    return NextResponse.json({ 
      powerpoint: response,
      message: 'PowerPoint saved successfully'
    })

  } catch (error) {
    console.error('Error saving PowerPoint:', error)
    return NextResponse.json(
      { error: 'Failed to save PowerPoint presentation' },
      { status: 500 }
    )
  }
}