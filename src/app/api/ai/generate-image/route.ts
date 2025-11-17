import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { imageGenerationService } from '@/lib/image-generation'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt, style, size, quality, provider } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    console.log('Generating image with prompt:', prompt)

    const result = await imageGenerationService.generateImage({
      prompt,
      style: style || 'educational',
      size: size || '1024x1024',
      quality: quality || 'standard',
      provider: provider || 'auto'
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
