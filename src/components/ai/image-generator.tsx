'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Image as ImageIcon, Download, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('educational')
  const [provider, setProvider] = useState('auto')
  const [size, setSize] = useState('1024x1024')
  const [quality, setQuality] = useState('standard')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [imageMetadata, setImageMetadata] = useState<any>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    setGeneratedImage(null)

    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          style,
          provider,
          size,
          quality
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Failed to generate image')
      }

      const data = await response.json()
      setGeneratedImage(data.url)
      setImageMetadata(data.metadata)
      toast.success('Image generated successfully!')

    } catch (error) {
      console.error('Error generating image:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate image')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return

    const link = document.createElement('a')
    link.href = generatedImage
    link.download = `edugenius-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Image downloaded!')
  }

  const quickPrompts = [
    'A colorful diagram showing the water cycle',
    'An educational illustration of the solar system',
    'A simple diagram of plant photosynthesis',
    'A visual representation of mathematical fractions',
    'An illustration of the human digestive system',
    'A diagram showing the layers of Earth'
  ]

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>AI Image Generator</span>
          </CardTitle>
          <CardDescription>
            Generate educational images and diagrams using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Image Description</Label>
            <Input
              id="prompt"
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          {/* Quick Prompts */}
          <div className="space-y-2">
            <Label>Quick Prompts</Label>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((quickPrompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(quickPrompt)}
                  disabled={isGenerating}
                >
                  {quickPrompt}
                </Button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
                <SelectTrigger id="style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="diagram">Diagram</SelectItem>
                  <SelectItem value="natural">Natural</SelectItem>
                  <SelectItem value="vivid">Vivid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">AI Provider</Label>
              <Select value={provider} onValueChange={setProvider} disabled={isGenerating}>
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (Best Available)</SelectItem>
                  <SelectItem value="dalle">DALL-E 3</SelectItem>
                  <SelectItem value="stability">Stable Diffusion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Select value={size} onValueChange={setSize} disabled={isGenerating}>
                <SelectTrigger id="size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024x1024">Square (1024x1024)</SelectItem>
                  <SelectItem value="1792x1024">Landscape (1792x1024)</SelectItem>
                  <SelectItem value="1024x1792">Portrait (1024x1792)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality">Quality</Label>
              <Select value={quality} onValueChange={setQuality} disabled={isGenerating}>
                <SelectTrigger id="quality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="hd">HD (Higher Cost)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" />
                Generate Image
              </>
            )}
          </Button>

          {/* Generated Image */}
          {generatedImage && (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="w-full h-auto"
                />
              </div>

              {imageMetadata && (
                <div className="text-sm text-gray-600">
                  <p>Model: {imageMetadata.model}</p>
                  <p>Size: {imageMetadata.size}</p>
                  <p>Generated: {new Date(imageMetadata.generatedAt).toLocaleString()}</p>
                </div>
              )}

              <Button
                onClick={handleDownload}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
