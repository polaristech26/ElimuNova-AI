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
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Share2,
  Calendar,
  Clock,
  GraduationCap,
  FileText,
  MoreHorizontal,
  Loader2,
  Users,
  Send,
  BarChart3,
  Image,
  Video,
  Target,
  Save,
  Brain
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PowerPoint {
  id: string
  title: string
  subject: string
  grade: string
  topic: string
  content: {
    slides: Array<{
      id: string
      title: string
      content: string
      slideType: string
      speakerNotes: string
      visualSuggestions: string[]
      order: number
    }>
    duration: number
    slideCount: number
    metadata: {
      objectives: string[]
      difficulty: string
      format: string
    }
  }
  metadata: any
  isShared: boolean
  createdAt: string
  updatedAt: string
  teacher: {
    id: string
    user: {
      firstName: string
      lastName: string
    }
  }
}

interface Slide {
  id: string
  title: string
  content: string
  slideType: 'title' | 'content' | 'image' | 'chart' | 'video' | 'interactive' | 'summary'
  speakerNotes: string
  visualSuggestions: string[]
  order: number
  imageUrl?: string
  hasImage?: boolean
  imageSource?: string
  imageMessage?: string
}

interface PowerPointForm {
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

const slideTypeIcons = {
  title: FileText,
  content: FileText,
  image: Image,
  chart: BarChart3,
  video: Video,
  interactive: Users,
  summary: Target
}

const slideTypeColors = {
  title: 'bg-blue-100 text-blue-800',
  content: 'bg-green-100 text-green-800',
  image: 'bg-purple-100 text-purple-800',
  chart: 'bg-orange-100 text-orange-800',
  video: 'bg-red-100 text-red-800',
  interactive: 'bg-cyan-100 text-cyan-800',
  summary: 'bg-indigo-100 text-indigo-800'
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

export default function PowerPointPage() {
  const [powerpoints, setPowerpoints] = useState<PowerPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [selectedPowerPoint, setSelectedPowerPoint] = useState<PowerPoint | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [powerpointToDelete, setPowerpointToDelete] = useState<PowerPoint | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [powerpointToShare, setPowerpointToShare] = useState<PowerPoint | null>(null)
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [sharing, setSharing] = useState(false)
  const [activeTab, setActiveTab] = useState('browse')
  
  // Generator state
  const [powerpointForm, setPowerpointForm] = useState<PowerPointForm>({
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
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  // Fetch PowerPoint presentations
  useEffect(() => {
    const fetchPowerPoints = async () => {
      try {
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (subjectFilter && subjectFilter !== 'all') params.append('subject', subjectFilter)
        if (gradeFilter && gradeFilter !== 'all') params.append('grade', gradeFilter)
        
        const response = await fetch(`/api/powerpoint?${params.toString()}`, {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setPowerpoints(data.powerpoints || [])
        }
      } catch (error) {
        console.error('Error fetching PowerPoint presentations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPowerPoints()
  }, [searchTerm, subjectFilter, gradeFilter])

  // Fetch students and classes for sharing
  useEffect(() => {
    const fetchStudentsAndClasses = async () => {
      try {
        console.log('Fetching students and classes...')
        const [studentsRes, classesRes] = await Promise.all([
          fetch('/api/student', { credentials: 'include' }),
          fetch('/api/classes', { credentials: 'include' })
        ])
        
        if (studentsRes.ok) {
          const studentsData = await studentsRes.json()
          console.log('Students fetched:', studentsData)
          setStudents(studentsData.students || [])
        } else {
          console.error('Error fetching students:', studentsRes.status, studentsRes.statusText)
        }
        
        if (classesRes.ok) {
          const classesData = await classesRes.json()
          console.log('Classes fetched:', classesData)
          setClasses(classesData.classes || [])
        } else {
          console.error('Error fetching classes:', classesRes.status, classesRes.statusText)
        }
      } catch (error) {
        console.error('Error fetching students and classes:', error)
      }
    }

    fetchStudentsAndClasses()
  }, [])

  const handleDelete = async () => {
    if (!powerpointToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/powerpoint/${powerpointToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setPowerpoints(prev => prev.filter(ppt => ppt.id !== powerpointToDelete.id))
        setIsDeleteModalOpen(false)
        setPowerpointToDelete(null)
        alert('PowerPoint deleted successfully!')
      } else {
        alert('Error deleting PowerPoint')
      }
    } catch (error) {
      console.error('Error deleting PowerPoint:', error)
      alert('Error deleting PowerPoint')
    } finally {
      setDeleting(false)
    }
  }

  const handleShare = async () => {
    if (!powerpointToShare) return

    if (selectedStudents.length === 0 && !selectedClass) {
      alert('Please select at least one student or class to share with')
      return
    }

    setSharing(true)
    try {
      console.log('Sharing PowerPoint:', {
        powerpointId: powerpointToShare.id,
        selectedStudents,
        selectedClass
      })
      
      const response = await fetch(`/api/ai-content/${powerpointToShare.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          studentIds: selectedStudents,
          classIds: selectedClass ? [selectedClass] : []
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`PowerPoint shared successfully! ${data.message || ''}`)
        setIsShareModalOpen(false)
        setPowerpointToShare(null)
        setSelectedStudents([])
        setSelectedClass('')
      } else {
        const errorData = await response.json()
        alert(`Error sharing PowerPoint: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error sharing PowerPoint:', error)
      alert('Error sharing PowerPoint')
    } finally {
      setSharing(false)
    }
  }

  const handleDownload = async (powerpoint: PowerPoint) => {
    try {
      const response = await fetch('/api/export/powerpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...powerpoint,
          format: 'pptx'
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const element = document.createElement('a')
        element.href = url
        element.download = `${powerpoint.title.replace(/[^a-z0-9]/gi, '_')}-presentation.pptx`
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
        window.URL.revokeObjectURL(url)
      } else {
        alert('Error generating PowerPoint')
      }
    } catch (error) {
      console.error('Error downloading PowerPoint:', error)
      alert('Error downloading PowerPoint')
    }
  }

  const filteredPowerPoints = powerpoints.filter(ppt => {
    const matchesSearch = ppt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ppt.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ppt.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ppt.topic.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = !subjectFilter || subjectFilter === 'all' || ppt.subject === subjectFilter
    const matchesGrade = !gradeFilter || gradeFilter === 'all' || ppt.grade === gradeFilter
    
    return matchesSearch && matchesSubject && matchesGrade
  })

  const subjects = [...new Set(powerpoints.map(ppt => ppt.subject))].sort()
  const grades = [...new Set(powerpoints.map(ppt => ppt.grade))].sort()

  // Generator functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPowerpointForm(prev => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numValue = value === '' ? 0 : parseInt(value, 10)
    setPowerpointForm(prev => ({ ...prev, [name]: numValue }))
  }

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...powerpointForm.metadata.objectives]
    newObjectives[index] = value
    setPowerpointForm(prev => ({
      ...prev,
      metadata: { ...prev.metadata, objectives: newObjectives }
    }))
  }

  const addObjective = () => {
    setPowerpointForm(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        objectives: [...prev.metadata.objectives, '']
      }
    }))
  }

  const removeObjective = (index: number) => {
    if (powerpointForm.metadata.objectives.length > 1) {
      const newObjectives = powerpointForm.metadata.objectives.filter((_, i) => i !== index)
      setPowerpointForm(prev => ({
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
      order: powerpointForm.slides.length + 1
    }
    setPowerpointForm(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }))
    setEditingSlide(newSlide)
  }

  const updateSlide = (slideId: string, updates: Partial<Slide>) => {
    setPowerpointForm(prev => ({
      ...prev,
      slides: prev.slides.map(slide => 
        slide.id === slideId ? { ...slide, ...updates } : slide
      )
    }))
  }

  const removeSlide = (slideId: string) => {
    setPowerpointForm(prev => ({
      ...prev,
      slides: prev.slides.filter(slide => slide.id !== slideId)
        .map((slide, index) => ({ ...slide, order: index + 1 }))
    }))
  }

  const generatePowerPoint = async () => {
    if (!powerpointForm.title || !powerpointForm.subject || !powerpointForm.grade || !powerpointForm.topic) {
      alert('Please fill in all required fields')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate-presentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          subject: powerpointForm.subject,
          grade: powerpointForm.grade,
          topic: powerpointForm.topic,
          duration: powerpointForm.duration,
          objectives: powerpointForm.metadata.objectives.filter(obj => obj.trim() !== ''),
          difficulty: powerpointForm.metadata.difficulty,
          slideCount: powerpointForm.slideCount
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Parse the generated content to extract slides
        const generatedSlides = parseGeneratedContent(data.presentation)
        
        // Generate images for slides with image prompts
        console.log('Generating images for slides...')
        const slidesWithImages = await generateImagesForSlides(generatedSlides)
        
        setPowerpointForm(prev => ({
          ...prev,
          slides: slidesWithImages,
          metadata: {
            ...prev.metadata,
            generatedAt: new Date().toISOString()
          }
        }))
        
        alert('PowerPoint generated successfully with images!')
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

  // Generate images for slides with image prompts
  const generateImagesForSlides = async (slides: Slide[]): Promise<Slide[]> => {
    const slidesWithImages = [...slides]
    
    for (let i = 0; i < slidesWithImages.length; i++) {
      const slide = slidesWithImages[i]
      
      // Check if slide has visual suggestions (image prompts)
      if (slide.visualSuggestions && slide.visualSuggestions.length > 0) {
        try {
          console.log(`Generating image for slide: ${slide.title}`)
          
          // Create image prompt from visual suggestions
          const imagePrompt = slide.visualSuggestions.join(', ') + ', educational illustration, colorful, suitable for students'
          
          // Generate image using our API with fallback system
          const imageResult = await generateSlideImage(imagePrompt)
          
          if (imageResult.imageUrl) {
            slidesWithImages[i] = {
              ...slide,
              imageUrl: imageResult.imageUrl,
              hasImage: true,
              imageSource: imageResult.source,
              imageMessage: imageResult.message
            }
            
            if (imageResult.source === 'placeholder') {
              console.log(`⚠️  Placeholder image used for slide: ${slide.title} - ${imageResult.message}`)
            } else {
              console.log(`✅ AI image generated for slide: ${slide.title} (source: ${imageResult.source})`)
            }
          } else {
            slidesWithImages[i] = {
              ...slide,
              hasImage: false
            }
            console.log(`❌ Failed to generate image for slide: ${slide.title}`)
          }
        } catch (error) {
          console.error(`Error generating image for slide ${slide.title}:`, error)
          slidesWithImages[i] = {
            ...slide,
            hasImage: false
          }
        }
        
        // Add delay between requests to avoid rate limiting
        if (i < slidesWithImages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000)) // Reduced delay since we have fallbacks
        }
      }
    }
    
    return slidesWithImages
  }

  // Generate individual slide image using our API
  const generateSlideImage = async (prompt: string): Promise<{ imageUrl: string | null; source?: string; message?: string }> => {
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          prompt: prompt,
          style: 'educational'
        })
      })

      if (response.ok) {
        const data = await response.json()
        return {
          imageUrl: data.imageUrl || null,
          source: data.source,
          message: data.message
        }
      } else {
        const errorData = await response.json()
        console.error('Image generation API error:', errorData)
        return { imageUrl: null }
      }
    } catch (error) {
      console.error('Image generation error:', error)
      return { imageUrl: null }
    }
  }

  const parseGeneratedContent = (content: string): Slide[] => {
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

    if (slides.length === 0) {
      slides.push({
        id: '1',
        title: powerpointForm.topic,
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
    if (!powerpointForm.title || !powerpointForm.subject || !powerpointForm.grade || powerpointForm.slides.length === 0) {
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
        credentials: 'include',
        body: JSON.stringify({
          title: powerpointForm.title,
          description: powerpointForm.description,
          subject: powerpointForm.subject,
          grade: powerpointForm.grade,
          topic: powerpointForm.topic,
          duration: powerpointForm.duration,
          slideCount: powerpointForm.slideCount,
          slides: powerpointForm.slides,
          metadata: {
            ...powerpointForm.metadata,
            updatedAt: new Date().toISOString()
          }
        })
      })

      if (response.ok) {
        alert(isEditing ? 'PowerPoint updated successfully!' : 'PowerPoint saved successfully!')
        
        if (!isEditing) {
          setPowerpointForm({
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
        
        // Refresh the powerpoints list
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (subjectFilter && subjectFilter !== 'all') params.append('subject', subjectFilter)
        if (gradeFilter && gradeFilter !== 'all') params.append('grade', gradeFilter)
        
        const refreshResponse = await fetch(`/api/powerpoint?${params.toString()}`, {
          credentials: 'include'
        })
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setPowerpoints(data.powerpoints || [])
        }
        
        setActiveTab('browse')
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

  const handleDownloadForm = async (format: 'pdf' | 'pptx') => {
    try {
      const response = await fetch('/api/export/powerpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...powerpointForm,
          format
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const element = document.createElement('a')
        element.href = url
        element.download = `${powerpointForm.title}-presentation.${format === 'pdf' ? 'pdf' : 'pptx'}`
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

  const startEditingPowerPoint = (powerpoint: PowerPoint) => {
    setPowerpointForm({
      id: powerpoint.id,
      title: powerpoint.title,
      description: '',
      subject: powerpoint.subject,
      grade: powerpoint.grade,
      topic: powerpoint.topic,
      duration: powerpoint.content.duration,
      slideCount: powerpoint.content.slideCount,
      slides: powerpoint.content.slides.map(slide => ({
        id: slide.id,
        title: slide.title,
        content: slide.content,
        slideType: slide.slideType as Slide['slideType'],
        speakerNotes: slide.speakerNotes,
        visualSuggestions: slide.visualSuggestions,
        order: slide.order
      })),
      metadata: {
        objectives: powerpoint.content.metadata.objectives || [''],
        difficulty: powerpoint.content.metadata.difficulty || 'medium',
        format: powerpoint.content.metadata.format || 'standard',
        generatedAt: new Date().toISOString()
      }
    })
    
    setIsEditing(true)
    setEditingId(powerpoint.id)
    setActiveTab('create')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Presentations
            </span>
          </h1>
          <p className="text-gray-600">Browse existing presentations or create new ones</p>
        </div>
        <Button 
          onClick={() => setActiveTab('create')} 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Presentation
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Presentations</TabsTrigger>
          <TabsTrigger value="create">Create Presentation</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">

      {/* Filters */}
      <Card className="border-0 shadow-none">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search presentations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {grades.map(grade => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* PowerPoint List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredPowerPoints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPowerPoints.map((powerpoint) => (
            <Card key={powerpoint.id} className="hover:shadow-lg transition-shadow border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{powerpoint.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {powerpoint.subject} • {powerpoint.grade}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedPowerPoint(powerpoint)
                        setIsViewModalOpen(true)
                      }}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => startEditingPowerPoint(powerpoint)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(powerpoint)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PPTX
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setPowerpointToShare(powerpoint)
                        setIsShareModalOpen(true)
                      }}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setPowerpointToDelete(powerpoint)
                          setIsDeleteModalOpen(true)
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Presentation className="mr-2 h-4 w-4" />
                    {powerpoint.content.slides.length} slides
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="mr-2 h-4 w-4" />
                    {powerpoint.content.duration} minutes
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    {powerpoint.content.metadata.difficulty}
                  </div>
                  
                  {/* Slide Types Preview */}
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(powerpoint.content.slides.map(slide => slide.slideType))).slice(0, 3).map(slideType => {
                      const Icon = slideTypeIcons[slideType as keyof typeof slideTypeIcons] || FileText
                      const colorClass = slideTypeColors[slideType as keyof typeof slideTypeColors] || 'bg-gray-100 text-gray-800'
                      return (
                        <Badge key={slideType} className={`${colorClass} text-xs`}>
                          <Icon className="mr-1 h-3 w-3" />
                          {slideType}
                        </Badge>
                      )
                    })}
                    {powerpoint.content.slides.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{powerpoint.content.slides.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="mr-1 h-3 w-3" />
                    Created {new Date(powerpoint.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-none">
          <CardContent className="text-center py-12">
            <Presentation className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No PowerPoint presentations found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || subjectFilter || gradeFilter 
                ? 'Try adjusting your search filters' 
                : 'Get started by creating your first PowerPoint presentation'
              }
            </p>
            <Button onClick={() => setActiveTab('create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create PowerPoint
            </Button>
          </CardContent>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          {/* Create PowerPoint Form */}
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
                      value={powerpointForm.subject || ''}
                      onChange={handleInputChange}
                      className="w-full flex h-10 items-center justify-between rounded-md border-0 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                      value={powerpointForm.grade || ''}
                      onChange={handleInputChange}
                      className="w-full flex h-10 items-center justify-between rounded-md border-0 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                    value={powerpointForm.title || ''}
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
                    value={powerpointForm.topic || ''}
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
                    value={powerpointForm.description || ''}
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
                      value={powerpointForm.duration || 45}
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
                      value={powerpointForm.slideCount || 10}
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
                  {powerpointForm.metadata.objectives.map((objective, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <Input
                        value={objective}
                        onChange={(e) => handleObjectiveChange(index, e.target.value)}
                        placeholder="Enter learning objective"
                      />
                      {powerpointForm.metadata.objectives.length > 1 && (
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
                      value={powerpointForm.metadata.difficulty}
                      onChange={(e) => setPowerpointForm(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, difficulty: e.target.value }
                      }))}
                      className="w-full flex h-10 items-center justify-between rounded-md border-0 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                      value={powerpointForm.metadata.format}
                      onChange={(e) => setPowerpointForm(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, format: e.target.value }
                      }))}
                      className="w-full flex h-10 items-center justify-between rounded-md border-0 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                    disabled={isGenerating || !powerpointForm.subject || !powerpointForm.grade || !powerpointForm.topic}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Generate with AI
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
                    Slides ({powerpointForm.slides.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={savePowerPoint}
                      disabled={isSaving || powerpointForm.slides.length === 0}
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
                {powerpointForm.slides.length > 0 ? (
                  <div className="space-y-4">
                    {powerpointForm.slides.map((slide, index) => {
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
                            {slide.imageUrl && (
                              <div className="mt-2">
                                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                  {slide.imageSource === 'placeholder' ? (
                                    <>
                                      <span className="text-yellow-600">📋</span>
                                      Placeholder Image:
                                    </>
                                  ) : slide.imageSource === 'stability-ai' ? (
                                    <>
                                      <span className="text-green-600">🎨</span>
                                      AI Generated (Stability):
                                    </>
                                  ) : slide.imageSource === 'openai-dalle' ? (
                                    <>
                                      <span className="text-blue-600">🤖</span>
                                      AI Generated (DALL-E):
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-gray-600">🖼️</span>
                                      Generated Image:
                                    </>
                                  )}
                                </div>
                                <img 
                                  src={slide.imageUrl} 
                                  alt={`Image for ${slide.title}`}
                                  className="w-full max-w-xs h-32 object-cover rounded border"
                                />
                                {slide.imageMessage && (
                                  <div className="text-xs text-gray-500 mt-1 italic">
                                    {slide.imageMessage}
                                  </div>
                                )}
                              </div>
                            )}
                            {slide.hasImage === false && slide.visualSuggestions.length > 0 && (
                              <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                                <strong>Image Generation:</strong> Failed to generate image for this slide
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
                    {powerpointForm.slides.length > 0 && (
                      <div className="space-y-3 pt-4">
                        <div className="text-sm text-gray-600 text-center">
                          🎨 Real PowerPoint with Canva-like styling and images
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleDownloadForm('pdf')}
                            variant="outline"
                            className="flex-1"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Export PDF
                          </Button>
                          <Button
                            onClick={() => handleDownloadForm('pptx')}
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
        </TabsContent>
      </Tabs>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPowerPoint?.title}</DialogTitle>
            <DialogDescription>
              {selectedPowerPoint?.subject} • {selectedPowerPoint?.grade} • {selectedPowerPoint?.content.slides.length} slides
            </DialogDescription>
          </DialogHeader>
          {selectedPowerPoint && (
            <div className="space-y-4">
              {selectedPowerPoint.content.slides.map((slide, index) => {
                const Icon = slideTypeIcons[slide.slideType as keyof typeof slideTypeIcons] || FileText
                const colorClass = slideTypeColors[slide.slideType as keyof typeof slideTypeColors] || 'bg-gray-100 text-gray-800'
                
                return (
                  <Card key={slide.id} className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={colorClass}>
                          <Icon className="mr-1 h-3 w-3" />
                          {slide.slideType}
                        </Badge>
                        <span className="text-sm text-gray-500">Slide {index + 1}</span>
                      </div>
                      <CardTitle className="text-lg">{slide.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap mb-3">
                        {slide.content}
                      </div>
                      {slide.speakerNotes && (
                        <div className="p-3 bg-blue-50 rounded text-sm text-blue-700 mb-2">
                          <strong>Speaker Notes:</strong> {slide.speakerNotes}
                        </div>
                      )}
                      {slide.visualSuggestions.length > 0 && (
                        <div className="p-3 bg-green-50 rounded text-sm text-green-700">
                          <strong>Visual Suggestions:</strong> {slide.visualSuggestions.join(', ')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete PowerPoint</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{powerpointToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share PowerPoint</DialogTitle>
            <DialogDescription>
              Share "{powerpointToShare?.title}" with students or classes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share with Students
              </label>
              <p className="text-sm text-gray-500 mb-2">Select individual students to share with</p>
              <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">
                {students.map(student => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`student-${student.id}`}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStudents(prev => [...prev, student.id])
                        } else {
                          setSelectedStudents(prev => prev.filter(id => id !== student.id))
                        }
                      }}
                    />
                    <label htmlFor={`student-${student.id}`} className="text-sm">
                      {student.user.firstName} {student.user.lastName}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share with Class
              </label>
              <p className="text-sm text-gray-500 mb-2">Or select a class to share with all students in that class</p>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsShareModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleShare} 
              disabled={sharing || (selectedStudents.length === 0 && !selectedClass)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {sharing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Share PowerPoint
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                  className="w-full flex h-10 items-center justify-between rounded-md border-0 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
