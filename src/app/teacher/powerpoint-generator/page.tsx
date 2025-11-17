'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Presentation, 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Share2, 
  Edit, 
  Eye,
  Loader2,
  FileText,
  Image,
  Video,
  BarChart3,
  Users,
  Clock,
  Target
} from 'lucide-react'

interface Slide {
  id: string
  title: string
  content: string
  slideType: 'title' | 'content' | 'image' | 'chart' | 'video' | 'interactive' | 'summary'
  speakerNotes: string
  visualSuggestions: string[]
  order: number
}

interface PowerPoint {
  id?: string
  title: string
  description: string
  subject: string
  grade: string
  topic: string
  duration: number
  slideCount: number
  slides: Slide[]
  metadata: {
    objectives: string[]
    difficulty: string
    format: string
    generatedAt: string
  }
}

const defaultSlideTypes = [
  { value: 'title', label: 'Title Slide', icon: FileText, color: 'bg-blue-100 text-blue-800' },
  { value: 'content', label: 'Content Slide', icon: FileText, color: 'bg-green-100 text-green-800' },
  { value: 'image', label: 'Image Slide', icon: Image, color: 'bg-purple-100 text-purple-800' },
  { value: 'chart', label: 'Chart/Graph', icon: BarChart3, color: 'bg-orange-100 text-orange-800' },
  { value: 'video', label: 'Video Slide', icon: Video, color: 'bg-red-100 text-red-800' },
  { value: 'interactive', label: 'Interactive', icon: Users, color: 'bg-cyan-100 text-cyan-800' },
  { value: 'summary', label: 'Summary', icon: Target, color: 'bg-indigo-100 text-indigo-800' }
]

export default function PowerPointGeneratorPage() {
  const [powerpoint, setPowerpoint] = useState<PowerPoint>({
    title: '',
    description: '',
    subject: '',
    grade: '',
    topic: '',
    duration: 45,
    slideCount: 10,
    slides: [],
    metadata: {
      objectives: [''],
      difficulty: 'medium',
      format: 'standard',
      generatedAt: ''
    }
  })

  const [editingSlide, setEditingSlide] = useState<Slide | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  // Check for edit mode on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const editId = urlParams.get('edit')
    if (editId) {
      loadPowerPointForEdit(editId)
    }
  }, [])

  const loadPowerPointForEdit = async (powerpointId: string) => {
    try {
      const response = await fetch(`/api/powerpoint/${powerpointId}`)
      if (response.ok) {
        const data = await response.json()
        const loadedPowerPoint = {
          ...data.powerpoint,
          slides: data.powerpoint.slides || []
        }
        setPowerpoint(loadedPowerPoint)
        setIsEditing(true)
        setEditingId(powerpointId)
      } else {
        alert('Error loading PowerPoint for editing')
      }
    } catch (error) {
      console.error('Error loading PowerPoint:', error)
      alert('Error loading PowerPoint')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPowerpoint(prev => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numValue = value === '' ? 0 : parseInt(value, 10)
    setPowerpoint(prev => ({ ...prev, [name]: numValue }))
  }

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...powerpoint.metadata.objectives]
    newObjectives[index] = value
    setPowerpoint(prev => ({
      ...prev,
      metadata: { ...prev.metadata, objectives: newObjectives }
    }))
  }

  const addObjective = () => {
    setPowerpoint(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        objectives: [...prev.metadata.objectives, '']
      }
    }))
  }

  const removeObjective = (index: number) => {
    if (powerpoint.metadata.objectives.length > 1) {
      const newObjectives = powerpoint.metadata.objectives.filter((_, i) => i !== index)
      setPowerpoint(prev => ({
        ...prev,
        metadata: { ...prev.metadata, objectives: newObjectives }
      }))
    }
  }

  const addSlide = (type: string) => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: '',
      content: '',
      slideType: type as Slide['slideType'],
      speakerNotes: '',
      visualSuggestions: [],
      order: powerpoint.slides.length + 1
    }
    setPowerpoint(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }))
    setEditingSlide(newSlide)
  }

  const updateSlide = (slideId: string, updates: Partial<Slide>) => {
    setPowerpoint(prev => ({
      ...prev,
      slides: prev.slides.map(slide => 
        slide.id === slideId ? { ...slide, ...updates } : slide
      )
    }))
  }

  const removeSlide = (slideId: string) => {
    setPowerpoint(prev => ({
      ...prev,
      slides: prev.slides.filter(slide => slide.id !== slideId)
        .map((slide, index) => ({ ...slide, order: index + 1 }))
    }))
  }

  const reorderSlides = (fromIndex: number, toIndex: number) => {
    const newSlides = [...powerpoint.slides]
    const [movedSlide] = newSlides.splice(fromIndex, 1)
    newSlides.splice(toIndex, 0, movedSlide)
    
    setPowerpoint(prev => ({
      ...prev,
      slides: newSlides.map((slide, index) => ({ ...slide, order: index + 1 }))
    }))
  }

  const generatePowerPoint = async () => {
    if (!powerpoint.title || !powerpoint.subject || !powerpoint.grade || !powerpoint.topic) {
      alert('Please fill in all required fields')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'powerpoint',
          subject: powerpoint.subject,
          grade: powerpoint.grade,
          topic: powerpoint.topic,
          duration: powerpoint.duration,
          objectives: powerpoint.metadata.objectives.filter(obj => obj.trim() !== ''),
          difficulty: powerpoint.metadata.difficulty,
          format: powerpoint.slideCount.toString()
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Parse the generated content to extract slides
        const generatedSlides = parseGeneratedContent(data.content)
        
        setPowerpoint(prev => ({
          ...prev,
          slides: generatedSlides,
          metadata: {
            ...prev.metadata,
            generatedAt: new Date().toISOString()
          }
        }))
        
        alert('PowerPoint generated successfully!')
      } else {
        const error = await response.json()
        alert(`Error generating PowerPoint: ${error.error}`)
      }
    } catch (error) {
      console.error('Error generating PowerPoint:', error)
      alert('Error generating PowerPoint')
    } finally {
      setIsGenerating(false)
    }
  }

  const parseGeneratedContent = (content: string): Slide[] => {
    // Parse the AI-generated content to extract slide information
    const slides: Slide[] = []
    const lines = content.split('\n').filter(line => line.trim())
    
    let currentSlide: Partial<Slide> | null = null
    let slideOrder = 1

    for (const line of lines) {
      if (line.match(/^#+\s*Slide\s*\d+/i) || line.match(/^#+\s*Slide\s*Title/i)) {
        if (currentSlide) {
          slides.push({
            id: Date.now().toString() + Math.random(),
            title: currentSlide.title || '',
            content: currentSlide.content || '',
            slideType: currentSlide.slideType || 'content',
            speakerNotes: currentSlide.speakerNotes || '',
            visualSuggestions: currentSlide.visualSuggestions || [],
            order: slideOrder++
          })
        }
        currentSlide = {
          title: line.replace(/^#+\s*/, ''),
          slideType: line.toLowerCase().includes('title') ? 'title' : 'content'
        }
      } else if (currentSlide) {
        if (line.startsWith('**Speaker Notes:**') || line.startsWith('*Speaker Notes:*')) {
          currentSlide.speakerNotes = line.replace(/^\*\*?Speaker Notes:\*\*?\s*/, '')
        } else if (line.startsWith('**Visual Suggestions:**') || line.startsWith('*Visual Suggestions:*')) {
          currentSlide.visualSuggestions = line.replace(/^\*\*?Visual Suggestions:\*\*?\s*/, '').split(',').map(s => s.trim())
        } else if (line.startsWith('-') || line.startsWith('*')) {
          currentSlide.content += (currentSlide.content ? '\n' : '') + line
        } else if (line.trim()) {
          currentSlide.content += (currentSlide.content ? '\n' : '') + line
        }
      }
    }

    // Add the last slide
    if (currentSlide) {
      slides.push({
        id: Date.now().toString() + Math.random(),
        title: currentSlide.title || '',
        content: currentSlide.content || '',
        slideType: currentSlide.slideType || 'content',
        speakerNotes: currentSlide.speakerNotes || '',
        visualSuggestions: currentSlide.visualSuggestions || [],
        order: slideOrder
      })
    }

    // If no slides were parsed, create a basic structure
    if (slides.length === 0) {
      slides.push({
        id: '1',
        title: powerpoint.topic,
        content: 'Generated content will appear here',
        slideType: 'title',
        speakerNotes: 'Welcome to the presentation',
        visualSuggestions: ['Title slide with topic'],
        order: 1
      })
    }

    return slides
  }

  const savePowerPoint = async () => {
    if (!powerpoint.title || !powerpoint.subject || !powerpoint.grade || powerpoint.slides.length === 0) {
      alert('Please fill in all required fields and add at least one slide.')
      return
    }

    setIsSaving(true)
    try {
      const url = isEditing ? `/api/powerpoint/${editingId}` : '/api/powerpoint'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: powerpoint.title,
          description: powerpoint.description,
          subject: powerpoint.subject,
          grade: powerpoint.grade,
          topic: powerpoint.topic,
          duration: powerpoint.duration,
          slideCount: powerpoint.slideCount,
          slides: powerpoint.slides,
          metadata: {
            ...powerpoint.metadata,
            updatedAt: new Date().toISOString()
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(isEditing ? 'PowerPoint updated successfully!' : 'PowerPoint saved successfully!')
        
        if (!isEditing) {
          // Reset form only for new PowerPoints
          setPowerpoint({
            title: '',
            description: '',
            subject: '',
            grade: '',
            topic: '',
            duration: 45,
            slideCount: 10,
            slides: [],
            metadata: {
              objectives: [''],
              difficulty: 'medium',
              format: 'standard',
              generatedAt: ''
            }
          })
        }
      } else {
        const error = await response.json()
        alert(`Error ${isEditing ? 'updating' : 'saving'} PowerPoint: ${error.error}`)
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'saving'} PowerPoint:`, error)
      alert(`Error ${isEditing ? 'updating' : 'saving'} PowerPoint. Please try again.`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownload = async (format: 'pdf' | 'pptx') => {
    try {
      const response = await fetch('/api/export/powerpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...powerpoint,
          format
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const element = document.createElement('a')
        element.href = url
        element.download = `${powerpoint.title}-presentation.${format === 'pdf' ? 'pdf' : 'pptx'}`
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
        window.URL.revokeObjectURL(url)
      } else {
        alert('Error generating document')
      }
    } catch (error) {
      console.error('Error downloading PowerPoint:', error)
      alert('Error downloading PowerPoint')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PowerPoint Generator
            </span>
          </h1>
          <p className="text-gray-600">Create AI-powered presentations for your classes</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.back()} variant="outline">
            Back
          </Button>
          <Button onClick={() => router.push('/teacher/powerpoint')} variant="outline">
            View All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Presentation className="mr-2 h-5 w-5" />
              Presentation Details
            </CardTitle>
            <CardDescription>
              Fill in the details to generate your PowerPoint presentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  name="subject"
                  value={powerpoint.subject || ''}
                  onChange={handleInputChange}
                  className="w-full flex h-10 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select Subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="English">English</option>
                  <option value="Integrated Science">Integrated Science</option>
                  <option value="Pretechnical Studies">Pretechnical Studies</option>
                  <option value="Kiswahili">Kiswahili</option>
                  <option value="Christian Religious Education">Christian Religious Education</option>
                  <option value="Science and Technology">Science and Technology</option>
                  <option value="Creative Arts">Creative Arts</option>
                  <option value="Social Studies">Social Studies</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Physical Education">Physical Education</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Computer Studies">Computer Studies</option>
                  <option value="Business Studies">Business Studies</option>
                  <option value="Economics">Economics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Physics">Physics</option>
                  <option value="Biology">Biology</option>
                  <option value="Literature">Literature</option>
                  <option value="Music">Music</option>
                  <option value="Drama">Drama</option>
                  <option value="Home Science">Home Science</option>
                  <option value="Environmental Studies">Environmental Studies</option>
                  <option value="Civics">Civics</option>
                  <option value="Life Skills">Life Skills</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade Level
                </label>
                <select
                  name="grade"
                  value={powerpoint.grade || ''}
                  onChange={handleInputChange}
                  className="w-full flex h-10 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select Grade</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presentation Title
              </label>
              <Input
                name="title"
                value={powerpoint.title || ''}
                onChange={handleInputChange}
                placeholder="Enter presentation title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic
              </label>
              <Input
                name="topic"
                value={powerpoint.topic || ''}
                onChange={handleInputChange}
                placeholder="Enter the presentation topic"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <Textarea
                name="description"
                value={powerpoint.description || ''}
                onChange={handleInputChange}
                placeholder="Brief description of the presentation"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <Input
                  name="duration"
                  type="number"
                  value={powerpoint.duration || 45}
                  onChange={handleNumberChange}
                  min="15"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Slides
                </label>
                <Input
                  name="slideCount"
                  type="number"
                  value={powerpoint.slideCount || 10}
                  onChange={handleNumberChange}
                  min="5"
                  max="50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Learning Objectives
              </label>
              {powerpoint.metadata.objectives.map((objective, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <Input
                    value={objective}
                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                    placeholder="Enter learning objective"
                  />
                  {powerpoint.metadata.objectives.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeObjective(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addObjective}
                className="mt-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Objective
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <select
                  name="difficulty"
                  value={powerpoint.metadata.difficulty}
                  onChange={(e) => setPowerpoint(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, difficulty: e.target.value }
                  }))}
                  className="w-full flex h-10 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  name="format"
                  value={powerpoint.metadata.format}
                  onChange={(e) => setPowerpoint(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, format: e.target.value }
                  }))}
                  className="w-full flex h-10 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="standard">Standard</option>
                  <option value="detailed">Detailed</option>
                  <option value="interactive">Interactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={generatePowerPoint}
                disabled={isGenerating || !powerpoint.subject || !powerpoint.grade || !powerpoint.topic}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Presentation className="mr-2 h-4 w-4" />
                    Generate PowerPoint
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Slides Preview */}
        <Card className="border-0 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Slides ({powerpoint.slides.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {showPreview ? 'Edit' : 'Preview'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={savePowerPoint}
                  disabled={isSaving || powerpoint.slides.length === 0}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {powerpoint.slides.length > 0 ? (
              <div className="space-y-4">
                {powerpoint.slides.map((slide, index) => {
                  const SlideIcon = defaultSlideTypes.find(t => t.value === slide.slideType)?.icon || FileText
                  const slideColor = defaultSlideTypes.find(t => t.value === slide.slideType)?.color || 'bg-gray-100 text-gray-800'
                  
                  return (
                    <Card key={slide.id} className="relative border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={slideColor}>
                              <SlideIcon className="mr-1 h-3 w-3" />
                              {defaultSlideTypes.find(t => t.value === slide.slideType)?.label}
                            </Badge>
                            <span className="text-sm text-gray-500">Slide {slide.order}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingSlide(slide)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeSlide(slide.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-lg">{slide.title || 'Untitled Slide'}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-gray-600 whitespace-pre-wrap">
                          {slide.content || 'No content'}
                        </div>
                        {slide.speakerNotes && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                            <strong>Speaker Notes:</strong> {slide.speakerNotes}
                          </div>
                        )}
                        {slide.visualSuggestions.length > 0 && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                            <strong>Visual Suggestions:</strong> {slide.visualSuggestions.join(', ')}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}

                {/* Add Slide Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {defaultSlideTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <Button
                        key={type.value}
                        variant="outline"
                        size="sm"
                        onClick={() => addSlide(type.value)}
                        className="justify-start"
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        Add {type.label}
                      </Button>
                    )
                  })}
                </div>

                {/* Export Buttons */}
                {powerpoint.slides.length > 0 && (
                  <div className="space-y-3 pt-4">
                    <div className="text-sm text-gray-600 text-center">
                      🎨 Real PowerPoint with Canva-like styling and images
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDownload('pdf')}
                        variant="outline"
                        className="flex-1"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                      </Button>
                      <Button
                        onClick={() => handleDownload('pptx')}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export Real PPTX
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      PPTX includes: Professional styling, charts, images, and interactive elements
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Presentation className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>Generate a PowerPoint or add slides manually to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Slide Editor Modal */}
      {editingSlide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Edit Slide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slide Title
                </label>
                <Input
                  value={editingSlide?.title || ''}
                  onChange={(e) => setEditingSlide(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slide Type
                </label>
                <select
                  value={editingSlide?.slideType || 'content'}
                  onChange={(e) => setEditingSlide(prev => prev ? { ...prev, slideType: e.target.value as Slide['slideType'] } : null)}
                  className="w-full flex h-10 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {defaultSlideTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <Textarea
                  value={editingSlide?.content || ''}
                  onChange={(e) => setEditingSlide(prev => prev ? { ...prev, content: e.target.value } : null)}
                  rows={6}
                  placeholder="Enter slide content..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speaker Notes
                </label>
                <Textarea
                  value={editingSlide?.speakerNotes || ''}
                  onChange={(e) => setEditingSlide(prev => prev ? { ...prev, speakerNotes: e.target.value } : null)}
                  rows={3}
                  placeholder="Enter speaker notes..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (editingSlide) {
                      updateSlide(editingSlide.id, editingSlide)
                      setEditingSlide(null)
                    }
                  }}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingSlide(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
