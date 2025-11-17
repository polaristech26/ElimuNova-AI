'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Target
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
  const router = useRouter()

  // Fetch PowerPoint presentations
  useEffect(() => {
    const fetchPowerPoints = async () => {
      try {
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (subjectFilter && subjectFilter !== 'all') params.append('subject', subjectFilter)
        if (gradeFilter && gradeFilter !== 'all') params.append('grade', gradeFilter)
        
        const response = await fetch(`/api/powerpoint?${params.toString()}`)
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
          fetch('/api/student'),
          fetch('/api/classes')
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
        method: 'DELETE'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PowerPoint Presentations
            </span>
          </h1>
          <p className="text-gray-600">Manage your AI-generated presentations</p>
        </div>
        <Button onClick={() => router.push('/teacher/powerpoint-generator')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Create PowerPoint
        </Button>
      </div>

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
                      <DropdownMenuItem onClick={() => router.push(`/teacher/powerpoint-generator?edit=${powerpoint.id}`)}>
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
            <Button onClick={() => router.push('/teacher/powerpoint-generator')}>
              <Plus className="mr-2 h-4 w-4" />
              Create PowerPoint
            </Button>
          </CardContent>
        </Card>
      )}

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
    </div>
  )
}
