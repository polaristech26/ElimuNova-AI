import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { aiService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { subject, grade, topic, duration, lessonsPerWeek, prerequisites, language = 'english' } = body

    // Validate required fields
    if (!subject || !grade || !topic || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Filter out empty prerequisites
    const filteredPrerequisites = prerequisites ? prerequisites.filter((prereq: string) => prereq.trim() !== '') : []

    const schemeOfWorkRequest = {
      subject,
      grade,
      term: topic, // Using topic as term for now
      topics: [topic], // Convert single topic to array
      duration: parseInt(duration)
    }

    // Generate scheme of work using AI service
    const result = await aiService.generateSchemeOfWork(schemeOfWorkRequest)

    return NextResponse.json({
      content: result.content,
      metadata: result.metadata
    })
  } catch (error) {
    console.error('Error generating scheme of work:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}