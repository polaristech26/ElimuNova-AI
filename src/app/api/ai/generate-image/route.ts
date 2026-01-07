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

    // Try Stability AI first
    try {
      const stabilityResponse = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
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

      if (stabilityResponse.ok) {
        const data = await stabilityResponse.json()
        if (data.artifacts && data.artifacts[0]) {
          const imageUrl = `data:image/png;base64,${data.artifacts[0].base64}`
          
          return NextResponse.json({
            imageUrl: imageUrl,
            success: true,
            source: 'stability-ai'
          })
        }
      } else {
        const errorText = await stabilityResponse.text()
        console.log('Stability AI error:', stabilityResponse.status, errorText)
      }
    } catch (error) {
      console.log('Stability AI connection error:', error)
    }

    // Try OpenAI DALL-E as fallback
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_DALLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          n: 1,
          size: '1024x1024',
          response_format: 'url'
        }),
      })

      if (openaiResponse.ok) {
        const data = await openaiResponse.json()
        if (data.data && data.data[0] && data.data[0].url) {
          return NextResponse.json({
            imageUrl: data.data[0].url,
            success: true,
            source: 'openai-dalle'
          })
        }
      } else {
        const errorText = await openaiResponse.text()
        console.log('OpenAI DALL-E error:', openaiResponse.status, errorText)
      }
    } catch (error) {
      console.log('OpenAI DALL-E connection error:', error)
    }

    // If both APIs fail, return a placeholder image
    console.log('Both image generation APIs failed, using placeholder')
    
    // Generate a placeholder image URL based on the prompt
    const placeholderImageUrl = generatePlaceholderImage(prompt, style)
    
    return NextResponse.json({
      imageUrl: placeholderImageUrl,
      success: true,
      source: 'placeholder',
      message: 'Image generation services temporarily unavailable. Using placeholder image.'
    })

  } catch (error) {
    console.error('Image generation error:', error)
    
    // Return a generic placeholder on any error
    const genericPlaceholder = generatePlaceholderImage('Educational Content', 'educational')
    
    return NextResponse.json({
      imageUrl: genericPlaceholder,
      success: true,
      source: 'placeholder',
      message: 'Image generation failed. Using placeholder image.'
    })
  }
}

// Generate a placeholder image using a service like Picsum or a data URL
function generatePlaceholderImage(prompt: string, style: string): string {
  // Create a simple SVG placeholder with the prompt text
  const width = 400
  const height = 300
  
  // Clean the prompt for display
  const displayText = prompt.substring(0, 50) + (prompt.length > 50 ? '...' : '')
  
  // Choose colors based on style
  const colors = {
    educational: { bg: '#f0f9ff', border: '#0ea5e9', text: '#0c4a6e' },
    professional: { bg: '#f8fafc', border: '#64748b', text: '#334155' },
    creative: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    default: { bg: '#f3f4f6', border: '#6b7280', text: '#374151' }
  }
  
  const colorScheme = colors[style as keyof typeof colors] || colors.default
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${colorScheme.bg}" stroke="${colorScheme.border}" stroke-width="2" rx="8"/>
      <circle cx="${width/2}" cy="${height/2 - 20}" r="30" fill="${colorScheme.border}" opacity="0.3"/>
      <text x="${width/2}" y="${height/2 + 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="${colorScheme.text}" font-weight="bold">
        📚 Educational Image
      </text>
      <text x="${width/2}" y="${height/2 + 40}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="${colorScheme.text}" opacity="0.7">
        ${displayText}
      </text>
      <text x="${width/2}" y="${height - 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="${colorScheme.text}" opacity="0.5">
        Placeholder Image
      </text>
    </svg>
  `
  
  // Convert SVG to data URL
  const encodedSvg = encodeURIComponent(svg)
  return `data:image/svg+xml,${encodedSvg}`
}