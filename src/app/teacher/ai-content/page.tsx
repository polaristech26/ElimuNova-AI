'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Brain, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  User,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Share2,
  FileText,
  Presentation,
  ClipboardList,
  Lightbulb,
  Image,
  Sparkles,
  Save,
  Copy,
  CheckCircle,
  Edit3,
  AlertCircle,
  Target,
  Video,
  BarChart3,
  Users,
  Loader2,
  Send
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import ImageGenerator from '@/components/ai/image-generator'
import PresentationGenerator from '@/components/ai/presentation-generator'

interface AIContent {
  id: string
  title: string
  content: string
  type: 'RUBRIC' | 'POWERPOINT' | 'ASSIGNMENT' | 'PROJECT'
  subject: string
  grade: string
  topic: string
  metadata: any
  isShared: boolean
  createdAt: string
  updatedAt: string
  _count: {
    sharedWithStudents: number
    sharedWithClasses: number
  }
}

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

interface Rubric {
  id: string
  title: string
  content: string
  subject: string
  grade: string
  topic: string
  metadata: any
  createdAt: string
  updatedAt: string
  rubricData?: {
    totalPoints: number
    performanceLevels: any[]
    criteria: any[]
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
}

interface PerformanceLevel {
  id: string
  name: string
  description: string
  score: number
  color: string
}

interface Criterion {
  id: string
  title: string
  description: string
  weight: number
  maxScore: number
}

interface RubricForm {
  title: string
  description: string
  subject: string
  grade: string
  totalPoints: number
  performanceLevels: PerformanceLevel[]
  criteria: Criterion[]
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

const defaultPerformanceLevels: PerformanceLevel[] = [
  { id: '1', name: 'Excellent', description: 'Exceeds expectations', score: 4, color: 'bg-green-100 text-green-800' },
  { id: '2', name: 'Good', description: 'Meets expectations', score: 3, color: 'bg-blue-100 text-blue-800' },
  { id: '3', name: 'Satisfactory', description: 'Partially meets expectations', score: 2, color: 'bg-yellow-100 text-yellow-800' },
  { id: '4', name: 'Needs Improvement', description: 'Below expectations', score: 1, color: 'bg-red-100 text-red-800' }
]

const defaultSlideTypes = [
  { value: 'title', label: 'Title Slide', icon: FileText, color: 'bg-blue-100 text-blue-800' },
  { value: 'content', label: 'Content Slide', icon: FileText, color: 'bg-green-100 text-green-800' },
  { value: 'image', label: 'Image Slide', icon: Image, color: 'bg-purple-100 text-purple-800' },
  { value: 'chart', label: 'Chart/Graph', icon: BarChart3, color: 'bg-orange-100 text-orange-800' },
  { value: 'video', label: 'Video Slide', icon: Video, color: 'bg-red-100 text-red-800' },
  { value: 'interactive', label: 'Interactive', icon: Users, color: 'bg-cyan-100 text-cyan-800' },
  { value: 'summary', label: 'Summary', icon: Target, color: 'bg-indigo-100 text-indigo-800' }
]

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

export default function AIContentPage() {
  const [content, setContent] = useState<AIContent[]>([])
  const [powerpoints, setPowerpoints] = useState<PowerPoint[]>([])
  const [rubrics, setRubrics] = useState<Rubric[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedContent, setSelectedContent] = useState<AIContent | null>(null)
  const [activeTab, setActiveTab] = useState('browse')
  const [activeContentType, setActiveContentType] = useState('presentations')
  
  // PowerPoint state
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
  const [isGeneratingPPT, setIsGeneratingPPT] = useState(false)
  const [isSavingPPT, setIsSavingPPT] = useState(false)
  
  // Rubric state
  const [rubricForm, setRubricForm] = useState<RubricForm>({
    title: '',
    description: '',
    subject: '',
    grade: '',
    totalPoints: 100,
    performanceLevels: [...defaultPerformanceLevels],
    criteria: []
  })
  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null)
  const [isGeneratingRubric, setIsGeneratingRubric] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null)
  
  // Sharing state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [itemToShare, setItemToShare] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [sharing, setSharing] = useState(false)

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingContent, setEditingContent] = useState<AIContent | null>(null)

  // Fetch all content from APIs
  useEffect(() => {
    const fetchAllContent = async () => {
      try {
        const [contentRes, powerpointsRes, rubricsRes, studentsRes, classesRes] = await Promise.all([
          fetch('/api/ai-content'),
          fetch('/api/powerpoint'),
          fetch('/api/rubrics'),
          fetch('/api/teacher/students'),
          fetch('/api/teacher/classes')
        ])
        
        if (contentRes.ok) {
          const data = await contentRes.json()
          setContent(Array.isArray(data.content) ? data.content : [])
        } else {
          console.error('Failed to fetch AI content:', contentRes.status)
          setContent([])
        }
        
        if (powerpointsRes.ok) {
          const data = await powerpointsRes.json()
          setPowerpoints(Array.isArray(data.powerpoints) ? data.powerpoints : [])
        } else {
          console.error('Failed to fetch PowerPoints:', powerpointsRes.status)
          setPowerpoints([])
        }
        
        if (rubricsRes.ok) {
          const data = await rubricsRes.json()
          setRubrics(Array.isArray(data.rubrics) ? data.rubrics : [])
        } else {
          console.error('Failed to fetch rubrics:', rubricsRes.status)
          setRubrics([])
        }
        
        if (studentsRes.ok) {
          const data = await studentsRes.json()
          setStudents(Array.isArray(data.students) ? data.students : [])
        } else {
          console.error('Failed to fetch students:', studentsRes.status)
          setStudents([])
        }
        
        if (classesRes.ok) {
          const data = await classesRes.json()
          setClasses(Array.isArray(data.classes) ? data.classes : [])
        } else {
          console.error('Failed to fetch classes:', classesRes.status)
          setClasses([])
        }
      } catch (error) {
        console.error('Error fetching content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllContent()
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RUBRIC': return <FileText className="w-4 h-4" />
      case 'POWERPOINT': return <Presentation className="w-4 h-4" />
      case 'ASSIGNMENT': return <ClipboardList className="w-4 h-4" />
      case 'PROJECT': return <Lightbulb className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'RUBRIC': return 'bg-blue-100 text-blue-800'
      case 'POWERPOINT': return 'bg-purple-100 text-purple-800'
      case 'ASSIGNMENT': return 'bg-green-100 text-green-800'
      case 'PROJECT': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleView = (content: AIContent) => {
    setSelectedContent(content)
    // You can implement a view modal here
  }

  const handleEdit = (content: AIContent) => {
    setSelectedContent(content)
    setIsEditModalOpen(true)
  }

  const handleEditPowerPoint = (powerpoint: PowerPoint) => {
    // Convert PowerPoint to AIContent format for editing
    const aiContent: AIContent = {
      id: powerpoint.id,
      title: powerpoint.title,
      content: JSON.stringify(powerpoint.content),
      type: 'POWERPOINT' as any,
      subject: powerpoint.subject,
      grade: powerpoint.grade,
      topic: powerpoint.topic,
      metadata: powerpoint.metadata,
      isShared: powerpoint.isShared,
      createdAt: powerpoint.createdAt,
      updatedAt: powerpoint.updatedAt,
      teacher: powerpoint.teacher,
      _count: { sharedWithStudents: 0, sharedWithClasses: 0 }
    }
    setSelectedContent(aiContent)
    setIsEditModalOpen(true)
  }

  const handleEditRubric = (rubric: Rubric) => {
    // Convert Rubric to AIContent format for editing
    const aiContent: AIContent = {
      id: rubric.id,
      title: rubric.title,
      content: JSON.stringify(rubric.content),
      type: 'RUBRIC' as any,
      subject: rubric.subject,
      grade: rubric.grade,
      topic: rubric.topic,
      metadata: rubric.metadata,
      isShared: rubric.isShared,
      createdAt: rubric.createdAt,
      updatedAt: rubric.updatedAt,
      teacher: rubric.teacher,
      _count: { sharedWithStudents: 0, sharedWithClasses: 0 }
    }
    setSelectedContent(aiContent)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (contentId: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      try {
        const response = await fetch(`/api/ai-content/${contentId}`, {
          method: 'DELETE',
          credentials: 'include'
        })
        if (response.ok) {
          setContent(prev => prev.filter(c => c.id !== contentId))
          alert('Content deleted successfully!')
        } else {
          alert('Error deleting content')
        }
      } catch (error) {
        console.error('Error deleting content:', error)
        alert('Error deleting content')
      }
    }
  }

  const handleShareContent = async (content: AIContent) => {
    setItemToShare(content)
    setIsShareModalOpen(true)
  }

  const handleUpdateContent = async () => {
    if (!selectedContent) return

    try {
      const response = await fetch(`/api/ai-content/${selectedContent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          title: selectedContent.title,
          content: selectedContent.content,
          metadata: selectedContent.metadata
        })
      })

      if (response.ok) {
        // Update the content in the local state
        setContent(prev => prev.map(c => 
          c.id === selectedContent.id ? selectedContent : c
        ))
        setIsEditModalOpen(false)
        alert('Content updated successfully!')
      } else {
        alert('Error updating content')
      }
    } catch (error) {
      console.error('Error updating content:', error)
      alert('Error updating content')
    }
  }

  const handleDownload = async (content: AIContent) => {
    try {
      if (content.type === 'POWERPOINT') {
        // Download as PowerPoint for presentations
        const response = await fetch('/api/export/powerpoint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            id: content.id,
            title: content.title,
            content: content.content,
            format: 'pptx'
          })
        })

        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const element = document.createElement('a')
          element.href = url
          element.download = `${content.title.replace(/[^a-z0-9]/gi, '_')}.pptx`
          document.body.appendChild(element)
          element.click()
          document.body.removeChild(element)
          window.URL.revokeObjectURL(url)
        } else {
          alert('Error downloading PowerPoint')
        }
      } else {
        // Download as text for other content types
        const element = document.createElement('a')
        const file = new Blob([content.content], { type: 'text/plain' })
        element.href = URL.createObjectURL(file)
        element.download = `${content.title}.txt`
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
      }
    } catch (error) {
      console.error('Error downloading content:', error)
      alert('Error downloading content')
    }
  }

  const handleGeneratorSuccess = (newContent: AIContent) => {
    setContent(prev => [newContent, ...prev])
  }

  // PowerPoint handlers
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

    setIsGeneratingPPT(true)
    try {
      const response = await fetch('/api/ai/generate-presentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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
        const generatedSlides = parseGeneratedContent(data.presentation)
        
        setPowerpointForm(prev => ({
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
      setIsGeneratingPPT(false)
    }
  }

  const parseGeneratedContent = (content: string): Slide[] => {
    const slides: Slide[] = []
    
    // Split by slide markers
    const sections = content.split(/(?=^#\s*Slide\s*\d+)/m)

    for (const section of sections) {
      if (!section.trim()) continue

      const lines = section.trim().split('\n')
      
      // Extract title (first line after # Slide X:)
      const titleLine = lines[0]
      const titleMatch = titleLine.match(/^#\s*Slide\s*\d+:\s*(.+)$/)
      const title = titleMatch ? titleMatch[1].trim() : 'Untitled Slide'
      
      // Extract different sections
      let slideContent: string[] = []
      let speakerNotes = ''
      let imagePrompt = ''
      let layoutType = 'content'
      
      let currentSection = ''
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        
        if (line.startsWith('**Content:**')) {
          currentSection = 'content'
          continue
        } else if (line.startsWith('**Speaker Notes:**')) {
          currentSection = 'notes'
          continue
        } else if (line.startsWith('**Image Prompt:**')) {
          currentSection = 'imagePrompt'
          continue
        } else if (line.startsWith('**Layout:**')) {
          currentSection = 'layout'
          continue
        } else if (line === '---' || line === '') {
          continue
        }
        
        // Process content based on current section
        if (currentSection === 'content' && line) {
          // Clean up bullet points and add to content
          const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim()
          if (cleanLine) {
            slideContent.push(cleanLine)
          }
        } else if (currentSection === 'notes' && line) {
          speakerNotes += (speakerNotes ? ' ' : '') + line
        } else if (currentSection === 'imagePrompt' && line) {
          imagePrompt += (imagePrompt ? ' ' : '') + line
        } else if (currentSection === 'layout' && line) {
          layoutType = line.toLowerCase().trim()
        }
      }

      // Create slide if we have content
      if (title && slideContent.length > 0) {
        // Determine slide type based on title and layout
        let slideType: Slide['slideType'] = 'content'
        if (title.toLowerCase().includes('introduction') || title.toLowerCase().includes('title') || layoutType === 'title') {
          slideType = 'title'
        } else if (title.toLowerCase().includes('summary') || title.toLowerCase().includes('conclusion')) {
          slideType = 'summary'
        } else if (layoutType === 'image') {
          slideType = 'image'
        } else if (layoutType === 'chart' || title.toLowerCase().includes('chart') || title.toLowerCase().includes('graph')) {
          slideType = 'chart'
        }

        slides.push({
          id: Date.now().toString() + Math.random(),
          title,
          content: slideContent.join('\n'),
          slideType,
          speakerNotes: speakerNotes || `Teaching notes for: ${title}`,
          visualSuggestions: imagePrompt ? [imagePrompt] : [`Educational illustration for: ${title}`],
          order: slides.length + 1
        })
      }
    }

    // Fallback parsing if the enhanced format didn't work
    if (slides.length === 0) {
      const fallbackSlides = parseFallbackContent(content)
      return fallbackSlides
    }

    return slides
  }

  // Fallback parser for simpler content formats
  const parseFallbackContent = (content: string): Slide[] => {
    const slides: Slide[] = []
    const lines = content.split('\n').filter(line => line.trim())
    
    let currentSlide: Partial<Slide> | null = null
    let slideOrder = 1

    for (const line of lines) {
      if (line.match(/^#+\s*Slide\s*\d+/i) || line.match(/^#+\s*/)) {
        if (currentSlide) {
          slides.push({
            id: Date.now().toString() + Math.random(),
            title: currentSlide.title || '',
            content: currentSlide.content || '',
            slideType: currentSlide.slideType || 'content',
            speakerNotes: currentSlide.speakerNotes || '',
            visualSuggestions: currentSlide.visualSuggestions || [`Educational illustration for: ${currentSlide.title}`],
            order: slideOrder++
          })
        }
        
        const title = line.replace(/^#+\s*(Slide\s*\d+:\s*)?/, '').trim()
        currentSlide = {
          title,
          slideType: title.toLowerCase().includes('title') || title.toLowerCase().includes('introduction') ? 'title' : 'content',
          content: '',
          speakerNotes: '',
          visualSuggestions: []
        }
      } else if (currentSlide) {
        if (line.startsWith('**Speaker Notes:**') || line.startsWith('*Speaker Notes:*')) {
          currentSlide.speakerNotes = line.replace(/^\*\*?Speaker Notes:\*\*?\s*/, '')
        } else if (line.startsWith('**Visual Suggestions:**') || line.startsWith('*Visual Suggestions:*')) {
          currentSlide.visualSuggestions = line.replace(/^\*\*?Visual Suggestions:\*\*?\s*/, '').split(',').map(s => s.trim())
        } else if (line.startsWith('-') || line.startsWith('*') || line.startsWith('•')) {
          currentSlide.content += (currentSlide.content ? '\n' : '') + line
        } else if (line.trim() && !line.startsWith('**')) {
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
        visualSuggestions: currentSlide.visualSuggestions || [`Educational illustration for: ${currentSlide.title}`],
        order: slideOrder
      })
    }

    // If still no slides, create a basic one
    if (slides.length === 0) {
      slides.push({
        id: '1',
        title: powerpointForm.topic || 'AI Generated Presentation',
        content: 'Generated content will appear here',
        slideType: 'title',
        speakerNotes: 'Welcome to the presentation',
        visualSuggestions: ['Title slide with educational theme'],
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

    setIsSavingPPT(true)
    try {
      const response = await fetch('/api/powerpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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
        alert('PowerPoint saved successfully!')
        
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
        
        // Refresh powerpoints
        const refreshResponse = await fetch('/api/powerpoint')
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setPowerpoints(data.powerpoints || [])
        }
        
        setActiveTab('browse')
      } else {
        const error = await response.json()
        alert(`Error saving PowerPoint: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving PowerPoint:', error)
      alert('Error saving PowerPoint. Please try again.')
    } finally {
      setIsSavingPPT(false)
    }
  }

  // Rubric handlers
  const addCriterion = () => {
    const newCriterion: Criterion = {
      id: Date.now().toString(),
      title: '',
      description: '',
      weight: 1,
      maxScore: 4
    }
    setRubricForm(prev => ({
      ...prev,
      criteria: [...prev.criteria, newCriterion]
    }))
    setEditingCriterion(newCriterion)
  }

  const updateCriterion = (id: string, updates: Partial<Criterion>) => {
    setRubricForm(prev => ({
      ...prev,
      criteria: prev.criteria.map(c => c.id === id ? { ...c, ...updates } : c)
    }))
  }

  const deleteCriterion = (id: string) => {
    setRubricForm(prev => ({
      ...prev,
      criteria: prev.criteria.filter(c => c.id !== id)
    }))
  }

  const updatePerformanceLevel = (id: string, updates: Partial<PerformanceLevel>) => {
    setRubricForm(prev => ({
      ...prev,
      performanceLevels: prev.performanceLevels.map(p => p.id === id ? { ...p, ...updates } : p)
    }))
  }

  const addPerformanceLevel = () => {
    const newLevel: PerformanceLevel = {
      id: Date.now().toString(),
      name: '',
      description: '',
      score: rubricForm.performanceLevels.length + 1,
      color: 'bg-gray-100 text-gray-800'
    }
    setRubricForm(prev => ({
      ...prev,
      performanceLevels: [...prev.performanceLevels, newLevel]
    }))
  }

  const deletePerformanceLevel = (id: string) => {
    if (rubricForm.performanceLevels.length <= 2) return
    setRubricForm(prev => ({
      ...prev,
      performanceLevels: prev.performanceLevels.filter(p => p.id !== id)
    }))
  }

  const calculateTotalPoints = () => {
    return rubricForm.criteria.reduce((total, criterion) => {
      return total + (criterion.maxScore * criterion.weight)
    }, 0)
  }

  const saveRubric = async () => {
    if (!rubricForm.title || !rubricForm.subject || !rubricForm.grade || rubricForm.criteria.length === 0) {
      alert('Please fill in all required fields and add at least one criterion.')
      return
    }

    setIsGeneratingRubric(true)
    try {
      const response = await fetch('/api/rubrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: rubricForm.title,
          description: rubricForm.description,
          subject: rubricForm.subject,
          grade: rubricForm.grade,
          totalPoints: rubricForm.totalPoints,
          performanceLevels: rubricForm.performanceLevels,
          criteria: rubricForm.criteria,
          metadata: {
            calculatedPoints: calculateTotalPoints(),
            updatedAt: new Date().toISOString()
          }
        })
      })

      if (response.ok) {
        alert('Rubric saved successfully!')
        
        setRubricForm({
          title: '',
          description: '',
          subject: '',
          grade: '',
          totalPoints: 100,
          performanceLevels: [...defaultPerformanceLevels],
          criteria: []
        })
        
        // Refresh rubrics
        const refreshResponse = await fetch('/api/rubrics')
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setRubrics(data.rubrics || [])
        }
        
        setActiveTab('browse')
      } else {
        const error = await response.json()
        alert(`Error saving rubric: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving rubric:', error)
      alert('Error saving rubric. Please try again.')
    } finally {
      setIsGeneratingRubric(false)
    }
  }

  const generateRubric = async () => {
    if (!rubricForm.title || !rubricForm.subject || !rubricForm.grade || rubricForm.criteria.length === 0) {
      alert('Please fill in all required fields and add at least one criterion.')
      return
    }

    setIsGeneratingRubric(true)
    try {
      const response = await fetch('/api/ai/generate-rubric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: rubricForm.subject,
          grade: rubricForm.grade,
          topic: rubricForm.title,
          description: rubricForm.description,
          performanceLevels: rubricForm.performanceLevels,
          criteria: rubricForm.criteria,
          totalPoints: rubricForm.totalPoints
        })
      })

      if (response.ok) {
        const data = await response.json()
        setRubricForm(prev => ({
          ...prev,
          description: data.rubric.description || prev.description,
          criteria: data.rubric.criteria || prev.criteria,
          performanceLevels: data.rubric.performanceLevels || prev.performanceLevels
        }))
        alert('Rubric enhanced with AI! You can now save it.')
      }
    } catch (error) {
      console.error('Error generating rubric:', error)
      alert('Error generating rubric. Please try again.')
    } finally {
      setIsGeneratingRubric(false)
    }
  }

  // Sharing handlers
  const handleShare = async () => {
    if (!itemToShare) return

    if (selectedStudents.length === 0 && !selectedClass) {
      alert('Please select at least one student or class to share with')
      return
    }

    setSharing(true)
    try {
      const response = await fetch(`/api/ai-content/${itemToShare.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentIds: selectedStudents,
          classIds: selectedClass ? [selectedClass] : []
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Content shared successfully! ${data.message || ''}`)
        setIsShareModalOpen(false)
        setItemToShare(null)
        setSelectedStudents([])
        setSelectedClass('')
      } else {
        const errorData = await response.json()
        alert(`Error sharing content: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error sharing content:', error)
      alert('Error sharing content')
    } finally {
      setSharing(false)
    }
  }

  const handleDownloadPowerPoint = async (powerpoint: PowerPoint) => {
    try {
      const response = await fetch('/api/export/powerpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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

  const handleDownloadForm = async (format: 'pdf' | 'pptx') => {
    if (powerpointForm.slides.length === 0) {
      alert('No slides to export. Please generate a presentation first.')
      return
    }

    try {
      // Convert slides to the format expected by the export API
      const exportSlides = powerpointForm.slides.map(slide => ({
        title: slide.title,
        content: slide.content.split('\n').filter(line => line.trim()),
        notes: slide.speakerNotes,
        imagePrompt: slide.visualSuggestions?.[0] || `Educational illustration for: ${slide.title}`,
        layout: slide.slideType === 'title' ? 'title' : 
                slide.slideType === 'image' ? 'image' : 
                slide.slideType === 'chart' ? 'split' : 'content'
      }))

      const response = await fetch('/api/ai/generate-presentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: powerpointForm.title,
          slides: exportSlides,
          generateImages: true,
          imageStyle: 'educational',
          theme: 'education'
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const element = document.createElement('a')
        element.href = url
        element.download = `${powerpointForm.title.replace(/[^a-z0-9]/gi, '_')}.${format === 'pdf' ? 'pdf' : 'pptx'}`
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
        window.URL.revokeObjectURL(url)
        
        alert(`${format.toUpperCase()} exported successfully with AI-generated images!`)
      } else {
        const error = await response.json()
        alert(`Error exporting ${format.toUpperCase()}: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error(`Error exporting ${format}:`, error)
      alert(`Error exporting ${format.toUpperCase()}. Please try again.`)
    }
  }

  const handleExportRubric = async (rubric: Rubric, format: 'pdf' | 'word') => {
    try {
      const rubricData = typeof rubric.content === 'string' 
        ? JSON.parse(rubric.content) 
        : rubric.content

      const response = await fetch('/api/export/rubric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rubric: rubricData,
          format
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${rubric.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_rubric.${format === 'pdf' ? 'pdf' : 'doc'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert(`Error exporting to ${format.toUpperCase()}`)
      }
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error)
      alert(`Error exporting to ${format.toUpperCase()}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading AI content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Content Hub
            </span>
          </h1>
          <p className="text-gray-600 mt-1">Create, manage, and share all your AI-generated educational content</p>
        </div>
        <Button 
          onClick={() => setActiveTab('create')} 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Brain className="w-4 h-4 mr-2" />
          Create AI Content
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Content</TabsTrigger>
          <TabsTrigger value="create">Create Content</TabsTrigger>
          <TabsTrigger value="tools">AI Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">

          {/* Search and Filter */}
          <Card className="bg-gradient-to-br from-white via-purple-50 to-blue-50 shadow-lg backdrop-blur-sm border-0">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search all content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/70 backdrop-blur-sm border-0 shadow-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 rounded-md border-0 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Types</option>
                    <option value="presentations">Presentations</option>
                    <option value="rubrics">Rubrics</option>
                    <option value="assignments">Assignments</option>
                    <option value="images">Images</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Type Tabs */}
          <Tabs defaultValue="presentations" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-sm">
              <TabsTrigger value="presentations">Presentations</TabsTrigger>
              <TabsTrigger value="rubrics">Rubrics</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>

            <TabsContent value="presentations" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {powerpoints
                  .filter(ppt => 
                    !searchTerm || 
                    ppt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ppt.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ppt.grade.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((powerpoint) => (
                    <Card key={powerpoint.id} className="bg-gradient-to-br from-white via-purple-50 to-blue-50 shadow-lg backdrop-blur-sm border-0 hover:shadow-xl transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Presentation className="w-4 h-4" />
                            <Badge className="bg-purple-100 text-purple-800">
                              Presentation
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleEditPowerPoint(powerpoint)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadPowerPoint(powerpoint)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download PPTX
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setItemToShare(powerpoint)
                                setIsShareModalOpen(true)
                              }}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(powerpoint.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {powerpoint.title}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          {powerpoint.subject} • {powerpoint.grade}
                        </CardDescription>
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
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{new Date(powerpoint.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="rubrics" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rubrics
                  .filter(rubric => 
                    !searchTerm || 
                    rubric.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    rubric.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    rubric.grade.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((rubric) => {
                    const rubricData = typeof rubric.content === 'string' 
                      ? JSON.parse(rubric.content) 
                      : rubric.content

                    return (
                      <Card key={rubric.id} className="bg-gradient-to-br from-white via-purple-50 to-blue-50 shadow-lg backdrop-blur-sm border-0 hover:shadow-xl transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <Badge className="bg-blue-100 text-blue-800">
                                Rubric
                              </Badge>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedRubric(rubric)
                                  setShowPreview(true)
                                }}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditRubric(rubric)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportRubric(rubric, 'pdf')}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Export PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportRubric(rubric, 'word')}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Export Word
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(rubric.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                            {rubric.title}
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            {rubric.subject} • {rubric.grade}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{new Date(rubric.createdAt).toLocaleDateString()}</span>
                            </div>
                            {rubricData && (
                              <>
                                <div className="flex items-center text-sm text-gray-600">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  <span>{rubricData.criteria?.length || 0} criteria</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <FileText className="h-4 w-4 mr-2" />
                                  <span>{rubricData.totalPoints || 100} total points</span>
                                </div>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </TabsContent>

            <TabsContent value="assignments" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content
                  .filter(item => item.type === 'ASSIGNMENT')
                  .filter(item => 
                    !searchTerm || 
                    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.grade.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((item) => (
                    <Card key={item.id} className="bg-gradient-to-br from-white via-purple-50 to-blue-50 shadow-lg backdrop-blur-sm border-0 hover:shadow-xl transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <ClipboardList className="w-4 h-4" />
                            <Badge className="bg-green-100 text-green-800">
                              Assignment
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleView(item)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(item)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownload(item)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setItemToShare(item)
                                setIsShareModalOpen(true)
                              }}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          {item.subject} • {item.grade} • {item.topic}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-2" />
                            <span>Shared with {item._count.sharedWithStudents + item._count.sharedWithClasses} recipients</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="images" className="mt-6">
              <div className="text-center py-12">
                <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Image Gallery</h3>
                <p className="text-gray-600 mb-6">Generated images will appear here once you create them using the AI Tools.</p>
                <Button onClick={() => setActiveTab('tools')}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Go to AI Tools
                </Button>
              </div>
            </TabsContent>
          </Tabs>

        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          {/* Content Type Selector */}
          <Card className="bg-gradient-to-br from-white via-purple-50 to-blue-50 shadow-lg backdrop-blur-sm border-0">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">What would you like to create?</h3>
                <p className="text-gray-600">Choose the type of content you want to generate with AI</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => setActiveContentType('presentations')}
                  variant={activeContentType === 'presentations' ? 'default' : 'outline'}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Presentation className="w-8 h-8" />
                  <span>Presentations</span>
                </Button>
                <Button
                  onClick={() => setActiveContentType('rubrics')}
                  variant={activeContentType === 'rubrics' ? 'default' : 'outline'}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <FileText className="w-8 h-8" />
                  <span>Rubrics</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Content Creation Forms */}
          {activeContentType === 'presentations' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PowerPoint Form - I'll add this content */}
              <Card className="border-0 shadow-lg">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <Input
                        name="subject"
                        value={powerpointForm.subject}
                        onChange={handleInputChange}
                        placeholder="e.g., Mathematics"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                      <Input
                        name="grade"
                        value={powerpointForm.grade}
                        onChange={handleInputChange}
                        placeholder="e.g., Grade 7"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <Input
                      name="title"
                      value={powerpointForm.title}
                      onChange={handleInputChange}
                      placeholder="Enter presentation title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                    <Input
                      name="topic"
                      value={powerpointForm.topic}
                      onChange={handleInputChange}
                      placeholder="Enter the presentation topic"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                      <Input
                        name="duration"
                        type="number"
                        value={powerpointForm.duration}
                        onChange={handleNumberChange}
                        min="15"
                        max="120"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of Slides</label>
                      <Input
                        name="slideCount"
                        type="number"
                        value={powerpointForm.slideCount}
                        onChange={handleNumberChange}
                        min="5"
                        max="50"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={generatePowerPoint}
                    disabled={isGeneratingPPT || !powerpointForm.subject || !powerpointForm.grade || !powerpointForm.topic}
                    className="w-full"
                  >
                    {isGeneratingPPT ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Generate Presentation
                      </>
                    )}
                  </Button>
                  {powerpointForm.slides.length > 0 && (
                    <Button
                      onClick={savePowerPoint}
                      disabled={isSavingPPT}
                      variant="outline"
                      className="w-full"
                    >
                      {isSavingPPT ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Presentation
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Slides Preview */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Slides ({powerpointForm.slides.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {powerpointForm.slides.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {powerpointForm.slides.map((slide, index) => {
                        const SlideIcon = defaultSlideTypes.find(t => t.value === slide.slideType)?.icon || FileText
                        const slideColor = defaultSlideTypes.find(t => t.value === slide.slideType)?.color || 'bg-gray-100 text-gray-800'
                        
                        return (
                          <Card key={slide.id} className="border shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Badge className={slideColor}>
                                    <SlideIcon className="mr-1 h-3 w-3" />
                                    {defaultSlideTypes.find(t => t.value === slide.slideType)?.label || slide.slideType}
                                  </Badge>
                                  <span className="text-sm text-gray-500">Slide {slide.order}</span>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingSlide(slide)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                              <CardTitle className="text-sm font-semibold">{slide.title || 'Untitled Slide'}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="text-xs text-gray-600 line-clamp-3">
                                {slide.content}
                              </div>
                              {slide.speakerNotes && (
                                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                  <strong>Notes:</strong> {slide.speakerNotes.substring(0, 100)}...
                                </div>
                              )}
                              {slide.visualSuggestions && slide.visualSuggestions.length > 0 && (
                                <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                                  <strong>Image:</strong> {slide.visualSuggestions[0].substring(0, 80)}...
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                      
                      {/* Export Options */}
                      <div className="pt-4 border-t">
                        <div className="text-sm text-gray-600 text-center mb-3">
                          🎨 Professional PowerPoint with AI-generated images
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleDownloadForm('pdf')}
                            variant="outline"
                            className="flex-1"
                            disabled={powerpointForm.slides.length === 0}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Export PDF
                          </Button>
                          <Button
                            onClick={() => handleDownloadForm('pptx')}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            disabled={powerpointForm.slides.length === 0}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Export PPTX
                          </Button>
                        </div>
                        <div className="text-xs text-gray-500 text-center mt-2">
                          PPTX includes: Professional styling, AI-generated images, and interactive elements
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Presentation className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>Generate a presentation to see slides here</p>
                      <p className="text-xs mt-2">AI will create content + images automatically</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeContentType === 'rubrics' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Rubric Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Rubric Title *</Label>
                        <Input
                          value={rubricForm.title}
                          onChange={(e) => setRubricForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Essay Writing Rubric"
                        />
                      </div>
                      <div>
                        <Label>Subject *</Label>
                        <Input
                          value={rubricForm.subject}
                          onChange={(e) => setRubricForm(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="e.g., English"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Grade Level *</Label>
                        <Input
                          value={rubricForm.grade}
                          onChange={(e) => setRubricForm(prev => ({ ...prev, grade: e.target.value }))}
                          placeholder="e.g., Grade 7"
                        />
                      </div>
                      <div>
                        <Label>Total Points</Label>
                        <Input
                          type="number"
                          value={rubricForm.totalPoints}
                          onChange={(e) => setRubricForm(prev => ({ ...prev, totalPoints: parseInt(e.target.value) || 100 }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={rubricForm.description}
                        onChange={(e) => setRubricForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this rubric will assess..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-purple-600" />
                        Assessment Criteria
                      </CardTitle>
                      <Button onClick={addCriterion} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Criterion
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {rubricForm.criteria.map((criterion, index) => (
                      <div key={criterion.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Criterion {index + 1}</h4>
                          <Button
                            onClick={() => deleteCriterion(criterion.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            value={criterion.title}
                            onChange={(e) => updateCriterion(criterion.id, { title: e.target.value })}
                            placeholder="Criterion title"
                          />
                          <Input
                            type="number"
                            value={criterion.weight}
                            onChange={(e) => updateCriterion(criterion.id, { weight: parseInt(e.target.value) || 1 })}
                            placeholder="Weight"
                          />
                        </div>
                      </div>
                    ))}
                    {rubricForm.criteria.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Edit3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No criteria added yet. Click "Add Criterion" to get started.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Actions Panel */}
              <div className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={saveRubric}
                      disabled={isGeneratingRubric}
                      className="w-full"
                    >
                      {isGeneratingRubric ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Rubric
                    </Button>
                    <Button
                      onClick={generateRubric}
                      disabled={isGeneratingRubric}
                      variant="outline"
                      className="w-full"
                    >
                      {isGeneratingRubric ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Brain className="w-4 h-4 mr-2" />
                      )}
                      Enhance with AI
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Points:</span>
                      <span className="font-semibold">{rubricForm.totalPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Criteria:</span>
                      <span className="font-semibold">{rubricForm.criteria.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Performance Levels:</span>
                      <span className="font-semibold">{rubricForm.performanceLevels.length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <Tabs defaultValue="images" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="images" className="flex items-center space-x-2">
                <Image className="w-4 h-4" />
                <span>Image Generator</span>
              </TabsTrigger>
              <TabsTrigger value="presentations" className="flex items-center space-x-2">
                <Presentation className="w-4 h-4" />
                <span>Presentation Tools</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="images" className="mt-6">
              <ImageGenerator />
            </TabsContent>

            <TabsContent value="presentations" className="mt-6">
              <PresentationGenerator />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Share Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Content</DialogTitle>
            <DialogDescription>
              Share "{itemToShare?.title}" with students or classes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share with Students
              </label>
              <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">
                {students && students.length > 0 ? students.map(student => (
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
                      {student.user?.firstName || 'Unknown'} {student.user?.lastName || 'Student'}
                    </label>
                  </div>
                )) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No students found</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share with Class
              </label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes && classes.length > 0 ? classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name || 'Unnamed Class'}
                    </SelectItem>
                  )) : (
                    <SelectItem value="" disabled>
                      No classes found
                    </SelectItem>
                  )}
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
            >
              {sharing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Share Content
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Content Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>
              Edit "{selectedContent?.title}"
            </DialogDescription>
          </DialogHeader>
          
          {selectedContent && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={selectedContent.title}
                  onChange={(e) => setSelectedContent(prev => prev ? {...prev, title: e.target.value} : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={selectedContent.content}
                  onChange={(e) => setSelectedContent(prev => prev ? {...prev, content: e.target.value} : null)}
                  rows={10}
                />
              </div>
              
              {selectedContent.metadata && (
                <div>
                  <Label htmlFor="edit-metadata">Metadata (JSON)</Label>
                  <Textarea
                    id="edit-metadata"
                    value={JSON.stringify(selectedContent.metadata, null, 2)}
                    onChange={(e) => {
                      try {
                        const metadata = JSON.parse(e.target.value)
                        setSelectedContent(prev => prev ? {...prev, metadata} : null)
                      } catch (error) {
                        // Invalid JSON, don't update
                      }
                    }}
                    rows={5}
                  />
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateContent}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rubric Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Rubric Preview
            </DialogTitle>
            <DialogDescription>
              Preview your rubric details
            </DialogDescription>
          </DialogHeader>
          
          {selectedRubric && (
            <div className="space-y-6">
              {(() => {
                const rubricData = typeof selectedRubric.content === 'string' 
                  ? JSON.parse(selectedRubric.content) 
                  : selectedRubric.content

                return (
                  <>
                    <div className="text-center border-b border-gray-200 pb-4">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{rubricData.title}</h2>
                      <p className="text-gray-600">{rubricData.subject} • {rubricData.grade}</p>
                      {rubricData.description && (
                        <p className="text-gray-700 mt-2">{rubricData.description}</p>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border-0">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border-0 px-4 py-2 text-left font-semibold">Criteria</th>
                            {rubricData.performanceLevels?.map((level: any) => (
                              <th key={level.id} className="border-0 px-4 py-2 text-center font-semibold">
                                {level.name}
                                <br />
                                <span className="text-sm text-gray-600">({level.score} pts)</span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rubricData.criteria?.map((criterion: any, index: number) => (
                            <tr key={criterion.id}>
                              <td className="border-0 px-4 py-2">
                                <div className="font-semibold">{criterion.title}</div>
                                <div className="text-sm text-gray-600 mt-1">{criterion.description}</div>
                                <div className="text-xs text-gray-500 mt-1">Weight: {criterion.weight}</div>
                              </td>
                              {rubricData.performanceLevels?.map((level: any) => (
                                <td key={level.id} className="border-0 px-4 py-2 text-center">
                                  <div className="text-sm text-gray-700">
                                    {level.description}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="text-right text-lg font-semibold">
                      Total Points: {rubricData.totalPoints || 100}
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Slide Editor Modal */}
      {editingSlide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Edit Slide: {editingSlide.title || 'Untitled'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Content */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Slide Title</Label>
                    <Input
                      value={editingSlide?.title || ''}
                      onChange={(e) => setEditingSlide(prev => prev ? { ...prev, title: e.target.value } : null)}
                      placeholder="Enter slide title"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Slide Type</Label>
                    <select
                      value={editingSlide?.slideType || 'content'}
                      onChange={(e) => setEditingSlide(prev => prev ? { ...prev, slideType: e.target.value as Slide['slideType'] } : null)}
                      className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      {defaultSlideTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Content</Label>
                    <Textarea
                      value={editingSlide?.content || ''}
                      onChange={(e) => setEditingSlide(prev => prev ? { ...prev, content: e.target.value } : null)}
                      rows={8}
                      placeholder="Enter slide content (use bullet points for better formatting)"
                      className="resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tip: Use bullet points (•) or dashes (-) for better formatting
                    </p>
                  </div>
                </div>

                {/* Right Column - Notes & Images */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Speaker Notes</Label>
                    <Textarea
                      value={editingSlide?.speakerNotes || ''}
                      onChange={(e) => setEditingSlide(prev => prev ? { ...prev, speakerNotes: e.target.value } : null)}
                      rows={4}
                      placeholder="Enter teaching notes and tips for this slide"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Image Description</Label>
                    <Textarea
                      value={editingSlide?.visualSuggestions?.[0] || ''}
                      onChange={(e) => setEditingSlide(prev => prev ? { 
                        ...prev, 
                        visualSuggestions: [e.target.value] 
                      } : null)}
                      rows={4}
                      placeholder="Describe what image should be generated for this slide (e.g., 'Educational diagram showing photosynthesis process with labeled parts')"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      AI will generate an image based on this description
                    </p>
                  </div>

                  {/* Preview */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Preview</h4>
                    <div className="text-xs text-gray-600">
                      <div className="font-medium">{editingSlide?.title || 'Slide Title'}</div>
                      <div className="mt-1 whitespace-pre-wrap line-clamp-3">
                        {editingSlide?.content || 'Slide content will appear here...'}
                      </div>
                      {editingSlide?.visualSuggestions?.[0] && (
                        <div className="mt-2 p-2 bg-green-100 rounded text-green-700">
                          🎨 Image: {editingSlide.visualSuggestions[0].substring(0, 60)}...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    if (editingSlide) {
                      updateSlide(editingSlide.id, editingSlide)
                      setEditingSlide(null)
                    }
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingSlide(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (editingSlide && confirm('Are you sure you want to delete this slide?')) {
                      removeSlide(editingSlide.id)
                      setEditingSlide(null)
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Criterion Edit Modal */}
      <Dialog open={!!editingCriterion} onOpenChange={() => setEditingCriterion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Criterion</DialogTitle>
          </DialogHeader>
          
          {editingCriterion && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editingCriterion.title}
                  onChange={(e) => setEditingCriterion(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingCriterion.description}
                  onChange={(e) => setEditingCriterion(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Weight</Label>
                  <Input
                    type="number"
                    value={editingCriterion.weight}
                    onChange={(e) => setEditingCriterion(prev => prev ? { ...prev, weight: parseInt(e.target.value) || 1 } : null)}
                  />
                </div>
                <div>
                  <Label>Max Score</Label>
                  <Input
                    type="number"
                    value={editingCriterion.maxScore}
                    onChange={(e) => setEditingCriterion(prev => prev ? { ...prev, maxScore: parseInt(e.target.value) || 4 } : null)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingCriterion(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (editingCriterion) {
                      updateCriterion(editingCriterion.id, editingCriterion)
                      setEditingCriterion(null)
                    }
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
