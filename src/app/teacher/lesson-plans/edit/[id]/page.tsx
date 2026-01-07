'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  BookOpen, 
  Loader2, 
  Save, 
  Download, 
  Share2,
  Plus,
  Trash2,
  FileText,
  ArrowLeft
} from 'lucide-react'

interface LessonPlan {
  id: string
  title: string
  subject: string
  grade: string
  content: any
  createdAt: string
  updatedAt: string
}

export default function EditLessonPlanPage() {
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState<'pdf' | 'word' | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    grade: '',
    content: ''
  })
  const router = useRouter()
  const params = useParams()

  // Fetch lesson plan data
  useEffect(() => {
    const fetchLessonPlan = async () => {
      try {
        const response = await fetch(`/api/lesson-plans/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setLessonPlan(data)
          setFormData({
            title: data.title,
            subject: data.subject,
            grade: data.grade,
            content: data.content?.generatedContent || ''
          })
        } else {
          alert('Lesson plan not found')
          router.push('/teacher/lesson-plans')
        }
      } catch (error) {
        console.error('Error fetching lesson plan:', error)
        alert('Error fetching lesson plan')
        router.push('/teacher/lesson-plans')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchLessonPlan()
    }
  }, [params.id, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!lessonPlan) return

    setSaving(true)
    try {
      const response = await fetch(`/api/lesson-plans/${lessonPlan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          subject: formData.subject,
          grade: formData.grade,
          content: {
            ...lessonPlan.content,
            generatedContent: formData.content,
            updatedAt: new Date().toISOString()
          }
        }),
      })

      if (response.ok) {
        alert('Lesson plan updated successfully!')
        router.push('/teacher/lesson-plans')
      } else {
        const errorData = await response.json()
        alert('Error updating lesson plan: ' + (errorData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating lesson plan:', error)
      alert('Error updating lesson plan')
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = async (format: 'pdf' | 'word') => {
    if (!lessonPlan) return

    setDownloading(format)
    try {
      const response = await fetch('/api/export/lesson-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: formData.content,
          title: formData.title,
          subject: formData.subject,
          grade: formData.grade,
          topic: lessonPlan.content?.topic || '',
          duration: lessonPlan.content?.duration || 45,
          format: format
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const element = document.createElement('a')
        element.href = url
        element.download = `${formData.title}-lesson-plan.${format === 'pdf' ? 'html' : 'doc'}`
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
        window.URL.revokeObjectURL(url)
      } else {
        alert('Error generating document')
      }
    } catch (error) {
      console.error('Error downloading lesson plan:', error)
      alert('Error downloading lesson plan')
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!lessonPlan) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Lesson Plan Not Found</h1>
        <Button onClick={() => router.push('/teacher/lesson-plans')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lesson Plans
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Edit Lesson Plan</span>
          </h1>
          <p className="text-gray-600">Update your lesson plan details and content</p>
        </div>
        <Button 
          onClick={() => router.push('/teacher/lesson-plans')} 
          variant="outline" 
          className="bg-gradient-to-r from-white via-blue-50 to-purple-50 border-0 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-gradient-to-br from-white via-blue-50 to-purple-50 shadow-lg backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <BookOpen className="mr-2 h-5 w-5" />
              Lesson Plan Details
            </CardTitle>
            <CardDescription>
              Update the basic information for your lesson plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter lesson plan title"
                className="flex h-10 w-full rounded-md border-0 bg-gradient-to-r from-white via-blue-50 to-purple-50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-300"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full flex h-10 items-center justify-between rounded-md border-0 bg-gradient-to-r from-white via-blue-50 to-purple-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-300"
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
                  value={formData.grade}
                  onChange={handleInputChange}
                  className="w-full flex h-10 items-center justify-between rounded-md border-0 bg-gradient-to-r from-white via-blue-50 to-purple-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-300"
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

            <Button
              onClick={handleSave}
              disabled={saving || !formData.title || !formData.subject || !formData.grade}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Content Editor */}
        <Card className="bg-gradient-to-br from-white via-blue-50 to-purple-50 shadow-lg backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Lesson Plan Content
            </CardTitle>
            <CardDescription>
              Edit the AI-generated content for your lesson plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter your lesson plan content..."
                className="min-h-[400px] bg-white rounded-lg border-0 p-4 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              />
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => handleDownload('pdf')} 
                  variant="outline" 
                  disabled={downloading === 'pdf'}
                  className="bg-gradient-to-r from-white via-red-50 to-pink-50 border-0 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {downloading === 'pdf' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Download PDF
                </Button>
                <Button 
                  onClick={() => handleDownload('word')} 
                  variant="outline" 
                  disabled={downloading === 'word'}
                  className="bg-gradient-to-r from-white via-blue-50 to-cyan-50 border-0 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {downloading === 'word' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Download Word
                </Button>
                <Button variant="outline" className="bg-gradient-to-r from-white via-green-50 to-emerald-50 border-0 shadow-sm hover:shadow-md transition-all duration-300">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
