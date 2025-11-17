'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Presentation, Download, Loader2, Sparkles, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Slide {
  title: string
  content: string[]
  imagePrompt?: string
  layout: 'title' | 'content' | 'image' | 'split'
}

export default function PresentationGenerator() {
  const [title, setTitle] = useState('')
  const [slides, setSlides] = useState<Slide[]>([
    { title: '', content: [''], layout: 'content' }
  ])
  const [generateImages, setGenerateImages] = useState(false)
  const [imageStyle, setImageStyle] = useState('educational')
  const [theme, setTheme] = useState('education')
  const [isGenerating, setIsGenerating] = useState(false)

  const addSlide = () => {
    setSlides([...slides, { title: '', content: [''], layout: 'content' }])
  }

  const removeSlide = (index: number) => {
    if (slides.length > 1) {
      setSlides(slides.filter((_, i) => i !== index))
    }
  }

  const updateSlide = (index: number, field: keyof Slide, value: any) => {
    const newSlides = [...slides]
    newSlides[index] = { ...newSlides[index], [field]: value }
    setSlides(newSlides)
  }

  const addContentPoint = (slideIndex: number) => {
    const newSlides = [...slides]
    newSlides[slideIndex].content.push('')
    setSlides(newSlides)
  }

  const updateContentPoint = (slideIndex: number, pointIndex: number, value: string) => {
    const newSlides = [...slides]
    newSlides[slideIndex].content[pointIndex] = value
    setSlides(newSlides)
  }

  const removeContentPoint = (slideIndex: number, pointIndex: number) => {
    const newSlides = [...slides]
    if (newSlides[slideIndex].content.length > 1) {
      newSlides[slideIndex].content = newSlides[slideIndex].content.filter((_, i) => i !== pointIndex)
      setSlides(newSlides)
    }
  }

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast.error('Please enter a presentation title')
      return
    }

    const validSlides = slides.filter(s => s.title.trim() && s.content.some(c => c.trim()))
    
    if (validSlides.length === 0) {
      toast.error('Please add at least one slide with content')
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/ai/generate-presentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slides: validSlides,
          generateImages,
          imageStyle,
          theme
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Failed to generate presentation')
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${title.replace(/[^a-z0-9]/gi, '_')}.pptx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Presentation generated and downloaded!')

    } catch (error) {
      console.error('Error generating presentation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate presentation')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Presentation className="w-5 h-5 text-blue-600" />
            <span>AI Presentation Generator</span>
          </CardTitle>
          <CardDescription>
            Create professional presentations with AI-generated images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Presentation Title</Label>
            <Input
              id="title"
              placeholder="Enter presentation title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme} disabled={isGenerating}>
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageStyle">Image Style</Label>
              <Select value={imageStyle} onValueChange={setImageStyle} disabled={isGenerating || !generateImages}>
                <SelectTrigger id="imageStyle">
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
              <Label htmlFor="generateImages">Generate AI Images</Label>
              <div className="flex items-center space-x-2 h-10">
                <Switch
                  id="generateImages"
                  checked={generateImages}
                  onCheckedChange={setGenerateImages}
                  disabled={isGenerating}
                />
                <span className="text-sm text-gray-600">
                  {generateImages ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Slides */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Slides</Label>
              <Button
                onClick={addSlide}
                variant="outline"
                size="sm"
                disabled={isGenerating}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Slide
              </Button>
            </div>

            {slides.map((slide, slideIndex) => (
              <Card key={slideIndex} className="bg-gradient-to-br from-gray-50 to-white border-0 shadow-md">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Slide {slideIndex + 1}</h4>
                    {slides.length > 1 && (
                      <Button
                        onClick={() => removeSlide(slideIndex)}
                        variant="ghost"
                        size="sm"
                        disabled={isGenerating}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Slide Title</Label>
                    <Input
                      placeholder="Enter slide title..."
                      value={slide.title}
                      onChange={(e) => updateSlide(slideIndex, 'title', e.target.value)}
                      disabled={isGenerating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Layout</Label>
                    <Select
                      value={slide.layout}
                      onValueChange={(value) => updateSlide(slideIndex, 'layout', value)}
                      disabled={isGenerating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="content">Content Only</SelectItem>
                        <SelectItem value="image">Full Image</SelectItem>
                        <SelectItem value="split">Split (Content + Image)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Content Points</Label>
                      <Button
                        onClick={() => addContentPoint(slideIndex)}
                        variant="ghost"
                        size="sm"
                        disabled={isGenerating}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Point
                      </Button>
                    </div>
                    {slide.content.map((point, pointIndex) => (
                      <div key={pointIndex} className="flex items-center space-x-2">
                        <Input
                          placeholder={`Point ${pointIndex + 1}...`}
                          value={point}
                          onChange={(e) => updateContentPoint(slideIndex, pointIndex, e.target.value)}
                          disabled={isGenerating}
                        />
                        {slide.content.length > 1 && (
                          <Button
                            onClick={() => removeContentPoint(slideIndex, pointIndex)}
                            variant="ghost"
                            size="sm"
                            disabled={isGenerating}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {generateImages && (slide.layout === 'image' || slide.layout === 'split') && (
                    <div className="space-y-2">
                      <Label>Image Prompt (Optional)</Label>
                      <Textarea
                        placeholder="Describe the image for this slide..."
                        value={slide.imagePrompt || ''}
                        onChange={(e) => updateSlide(slideIndex, 'imagePrompt', e.target.value)}
                        disabled={isGenerating}
                        rows={2}
                      />
                      <p className="text-xs text-gray-500">
                        Leave empty to auto-generate from slide title
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !title.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Presentation...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate & Download Presentation
              </>
            )}
          </Button>

          {generateImages && (
            <p className="text-sm text-amber-600 text-center">
              ⚠️ Image generation may take 1-2 minutes per slide
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
