import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt, style = 'educational' } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    console.log('Generating image with prompt:', prompt)

    // Enhance prompt for educational content
    const enhancedPrompt = `${prompt}, educational illustration, ${style} style, bright colors, child-friendly, high quality, detailed, professional`

    // Generate image using Stability AI
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: enhancedPrompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      if (data.artifacts && data.artifacts[0]) {
        const imageUrl = `data:image/png;base64,${data.artifacts[0].base64}`
        
        return NextResponse.json({
          imageUrl: imageUrl,
          success: true
        })
      } else {
        return NextResponse.json({ error: 'No image generated' }, { status: 500 })
      }
    } else {
      const errorText = await response.text()
      console.error('Stability AI error:', response.status, errorText)
      return NextResponse.json({ 
        error: 'Image generation failed',
        details: errorText 
      }, { status: 500 })
    }

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