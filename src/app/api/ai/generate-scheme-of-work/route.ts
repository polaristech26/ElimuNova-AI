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
    const { subject, grade, topic, duration, lessonsPerWeek, prerequisites, language = 'english', topics: requestTopics } = body

    // Use topics array if provided, otherwise fall back to single topic
    const topicsList = requestTopics && requestTopics.length > 0 ? requestTopics : (topic ? [topic] : [])

    // Validate required fields
    if (!subject || !grade || topicsList.length === 0 || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, grade, topics, and duration are required' },
        { status: 400 }
      )
    }

    // Filter out empty prerequisites
    const filteredPrerequisites = prerequisites ? prerequisites.filter((prereq: string) => prereq.trim() !== '') : []

    console.log('Generating scheme of work for topics:', topicsList)

    const schemeOfWorkRequest = {
      subject,
      grade,
      term: topicsList[0], // Use first topic as term for backward compatibility
      topics: topicsList, // Use all topics
      duration: parseInt(duration),
      lessonsPerWeek: lessonsPerWeek ? parseInt(lessonsPerWeek) : 5,
      prerequisites: filteredPrerequisites
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