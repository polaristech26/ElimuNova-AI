// Image Generation Service for DALL-E 3 and Stable Diffusion

export interface ImageGenerationRequest {
  prompt: string
  style?: 'natural' | 'vivid' | 'educational' | 'diagram'
  size?: '1024x1024' | '1792x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
  provider?: 'dalle' | 'stability' | 'auto'
}

export interface ImageGenerationResponse {
  url: string
  provider: string
  revisedPrompt?: string
  metadata: {
    generatedAt: string
    model: string
    size: string
  }
}

export class ImageGenerationService {
  private static instance: ImageGenerationService

  public static getInstance(): ImageGenerationService {
    if (!ImageGenerationService.instance) {
      ImageGenerationService.instance = new ImageGenerationService()
    }
    return ImageGenerationService.instance
  }

  /**
   * Generate an image using DALL-E 3
   */
  async generateWithDALLE(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      const { OpenAI } = await import('openai')
      
      const apiKey = process.env.OPENAI_DALLE_API_KEY || process.env.OPENAI_API_KEY
      
      if (!apiKey) {
        throw new Error('OpenAI API key not configured')
      }

      const openai = new OpenAI({
        apiKey: apiKey,
      })

      // Enhance prompt for educational content
      const enhancedPrompt = this.enhancePromptForEducation(request.prompt, request.style)

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: request.size || "1024x1024",
        quality: request.quality || "standard",
        style: request.style === 'vivid' ? 'vivid' : 'natural',
      })

      const imageUrl = response.data?.[0]?.url

      if (!imageUrl) {
        throw new Error('No image URL returned from DALL-E')
      }

      return {
        url: imageUrl,
        provider: 'dalle-3',
        revisedPrompt: response.data?.[0]?.revised_prompt,
        metadata: {
          generatedAt: new Date().toISOString(),
          model: 'dall-e-3',
          size: request.size || "1024x1024"
        }
      }
    } catch (error) {
      console.error('DALL-E generation error:', error)
      throw error
    }
  }

  /**
   * Generate an image using Stable Diffusion via Replicate
   */
  async generateWithStableDiffusion(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      const apiToken = process.env.REPLICATE_API_TOKEN
      
      if (!apiToken) {
        throw new Error('Replicate API token not configured')
      }

      // Enhance prompt for educational content
      const enhancedPrompt = this.enhancePromptForEducation(request.prompt, request.style)

      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4", // SDXL
          input: {
            prompt: enhancedPrompt,
            width: 1024,
            height: 1024,
            num_outputs: 1,
            scheduler: "K_EULER",
            num_inference_steps: 30,
            guidance_scale: 7.5,
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Replicate API error: ${response.statusText}`)
      }

      const prediction = await response.json()

      // Poll for completion
      let imageUrl = await this.pollReplicatePrediction(prediction.id, apiToken)

      return {
        url: imageUrl,
        provider: 'stable-diffusion',
        metadata: {
          generatedAt: new Date().toISOString(),
          model: 'sdxl',
          size: '1024x1024'
        }
      }
    } catch (error) {
      console.error('Stable Diffusion generation error:', error)
      throw error
    }
  }

  /**
   * Generate an image using Stability AI API
   */
  async generateWithStabilityAI(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      const apiKey = process.env.STABILITY_API_KEY
      
      if (!apiKey) {
        throw new Error('Stability AI API key not configured')
      }

      // Enhance prompt for educational content
      const enhancedPrompt = this.enhancePromptForEducation(request.prompt, request.style)

      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Stability AI error: ${JSON.stringify(error)}`)
      }

      const data = await response.json()
      
      // Convert base64 to data URL
      const base64Image = data.artifacts[0].base64
      const imageUrl = `data:image/png;base64,${base64Image}`

      return {
        url: imageUrl,
        provider: 'stability-ai',
        metadata: {
          generatedAt: new Date().toISOString(),
          model: 'sdxl-1.0',
          size: '1024x1024'
        }
      }
    } catch (error) {
      console.error('Stability AI generation error:', error)
      throw error
    }
  }

  /**
   * Auto-select best provider and generate image
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const provider = request.provider || 'auto'

    try {
      if (provider === 'dalle') {
        return await this.generateWithDALLE(request)
      } else if (provider === 'stability') {
        return await this.generateWithStabilityAI(request)
      } else {
        // Auto mode: Try DALL-E first, fallback to Stable Diffusion
        try {
          return await this.generateWithDALLE(request)
        } catch (dalleError) {
          console.log('DALL-E failed, trying Stable Diffusion...', dalleError)
          try {
            return await this.generateWithStableDiffusion(request)
          } catch (sdError) {
            console.log('Stable Diffusion failed, trying Stability AI...', sdError)
            return await this.generateWithStabilityAI(request)
          }
        }
      }
    } catch (error) {
      console.error('All image generation providers failed:', error)
      throw new Error('Failed to generate image with all available providers')
    }
  }

  /**
   * Enhance prompt for educational content
   */
  private enhancePromptForEducation(prompt: string, style?: string): string {
    const styleModifiers = {
      educational: 'educational illustration, clear and simple, suitable for students, clean design',
      diagram: 'technical diagram, labeled, clear lines, educational schematic, infographic style',
      natural: 'realistic, natural lighting, photographic quality',
      vivid: 'vibrant colors, engaging, eye-catching, dynamic'
    }

    const modifier = styleModifiers[style as keyof typeof styleModifiers] || styleModifiers.educational

    return `${prompt}, ${modifier}, high quality, professional`
  }

  /**
   * Poll Replicate prediction until complete
   */
  private async pollReplicatePrediction(predictionId: string, apiToken: string, maxAttempts = 60): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${apiToken}`,
        }
      })

      const prediction = await response.json()

      if (prediction.status === 'succeeded') {
        return prediction.output[0]
      } else if (prediction.status === 'failed') {
        throw new Error('Prediction failed')
      }

      // Wait 1 second before polling again
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    throw new Error('Prediction timed out')
  }

  /**
   * Generate multiple images for a presentation
   */
  async generatePresentationImages(topics: string[], style?: string): Promise<ImageGenerationResponse[]> {
    const images: ImageGenerationResponse[] = []

    for (const topic of topics) {
      try {
        const image = await this.generateImage({
          prompt: `Educational illustration for: ${topic}`,
          style: (style as any) || 'educational',
          size: '1024x1024',
          quality: 'standard'
        })
        images.push(image)
      } catch (error) {
        console.error(`Failed to generate image for topic: ${topic}`, error)
        // Continue with other images even if one fails
      }
    }

    return images
  }
}

export const imageGenerationService = ImageGenerationService.getInstance()
