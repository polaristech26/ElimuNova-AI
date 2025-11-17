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
    const { subject, grade, topic, duration, objectives, prerequisites } = body

    // Validate required fields
    if (!subject || !grade || !topic || !duration || !objectives) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Filter out empty objectives and prerequisites
    const filteredObjectives = objectives.filter((obj: string) => obj.trim() !== '')
    const filteredPrerequisites = prerequisites ? prerequisites.filter((prereq: string) => prereq.trim() !== '') : []

    const lessonPlanRequest = {
      subject,
      grade,
      topic,
      duration: parseInt(duration),
      objectives: filteredObjectives,
      prerequisites: filteredPrerequisites
    }

    // Generate lesson plan using AI service
    const result = await aiService.generateLessonPlan(lessonPlanRequest)

    return NextResponse.json({
      content: result.content,
      metadata: result.metadata
    })
  } catch (error) {
    console.error('Error generating lesson plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
