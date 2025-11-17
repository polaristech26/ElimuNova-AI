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
    const { message } = body

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get chat response from AI service
    const result = await aiService.chatWithHope(message, {
      userRole: session.user.role,
      teacherId: session.user.teacher?.id
    })

    // Parse the AI response
    const aiResponse = JSON.parse(result.content)

    return NextResponse.json({
      response: aiResponse.response,
      suggestions: aiResponse.suggestions || [],
      resources: aiResponse.resources || [],
      metadata: result.metadata
    })
  } catch (error) {
    console.error('Error in Hope chat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
