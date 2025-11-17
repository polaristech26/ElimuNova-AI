'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Share2,
  Copy,
  CheckCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Link from 'next/link'

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

export default function RubricsPage() {
  const [rubrics, setRubrics] = useState<Rubric[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Fetch rubrics from API
  useEffect(() => {
    const fetchRubrics = async () => {
      try {
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (subjectFilter !== 'all') params.append('subject', subjectFilter)
        if (gradeFilter !== 'all') params.append('grade', gradeFilter)
        
        const response = await fetch(`/api/rubrics?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setRubrics(data.rubrics || [])
        } else {
          console.error('Failed to fetch rubrics')
        }
      } catch (error) {
        console.error('Error fetching rubrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRubrics()
  }, [searchTerm, subjectFilter, gradeFilter])

  const handleView = (rubric: Rubric) => {
    setSelectedRubric(rubric)
    setShowPreview(true)
  }

  const handleEdit = (rubric: Rubric) => {
    // Navigate to rubric generator with edit mode
    window.location.href = `/teacher/rubric-generator?edit=${rubric.id}`
  }

  const handleDelete = async (rubricId: string) => {
    if (confirm('Are you sure you want to delete this rubric?')) {
      try {
        const response = await fetch(`/api/rubrics/${rubricId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setRubrics(prev => prev.filter(r => r.id !== rubricId))
        } else {
          alert('Error deleting rubric')
        }
      } catch (error) {
        console.error('Error deleting rubric:', error)
        alert('Error deleting rubric')
      }
    }
  }

  const handleExport = async (rubric: Rubric, format: 'pdf' | 'word') => {
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

  const handleCopy = (rubric: Rubric) => {
    const rubricData = typeof rubric.content === 'string' 
      ? JSON.parse(rubric.content) 
      : rubric.content

    const rubricText = generateRubricText(rubricData)
    navigator.clipboard.writeText(rubricText)
    alert('Rubric copied to clipboard!')
  }

  const generateRubricText = (rubricData: any) => {
    let text = `${rubricData.title}\n`
    text += `Subject: ${rubricData.subject} | Grade: ${rubricData.grade}\n`
    text += `Description: ${rubricData.description}\n\n`
    
    text += 'Performance Levels:\n'
    rubricData.performanceLevels.forEach((level: any) => {
      text += `- ${level.name} (${level.score} points): ${level.description}\n`
    })
    
    text += '\nCriteria:\n'
    rubricData.criteria.forEach((criterion: any, index: number) => {
      text += `${index + 1}. ${criterion.title} (Weight: ${criterion.weight}, Max Score: ${criterion.maxScore})\n`
      text += `   ${criterion.description}\n\n`
    })
    
    return text
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading rubrics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rubrics</h1>
          <p className="text-gray-600 mt-1">Manage your assessment rubrics</p>
        </div>
        <Link href="/teacher/rubric-generator">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Create New Rubric
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <Card className="bg-gradient-to-br from-white via-purple-50 to-blue-50 shadow-lg backdrop-blur-sm border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search rubrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/70 backdrop-blur-sm border-0 shadow-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English">English</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
                <option value="Other">Other</option>
              </select>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Grades</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
                <option value="Grade 4">Grade 4</option>
                <option value="Grade 5">Grade 5</option>
                <option value="Grade 6">Grade 6</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
                <option value="High School">High School</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rubrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rubrics.map((rubric) => {
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
                      <DropdownMenuItem onClick={() => handleView(rubric)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(rubric)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport(rubric, 'pdf')}>
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport(rubric, 'word')}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Word
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopy(rubric)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(rubric.id)}
                        className="text-red-600"
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

      {/* Empty State */}
      {rubrics.length === 0 && (
        <Card className="bg-gradient-to-br from-white via-purple-50 to-blue-50 shadow-lg backdrop-blur-sm border-0">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rubrics Yet</h3>
            <p className="text-gray-600 mb-6">Start creating assessment rubrics to get started.</p>
            <Link href="/teacher/rubric-generator">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Rubric
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Rubric Preview
            </DialogTitle>
            <DialogDescription>
              Preview your rubric before editing or exporting
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
                    {/* Rubric Header */}
                    <div className="text-center border-b border-gray-200 pb-4">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{rubricData.title}</h2>
                      <p className="text-gray-600">{rubricData.subject} • {rubricData.grade}</p>
                      {rubricData.description && (
                        <p className="text-gray-700 mt-2">{rubricData.description}</p>
                      )}
                    </div>

                    {/* Rubric Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Criteria</th>
                            {rubricData.performanceLevels?.map((level: any) => (
                              <th key={level.id} className="border border-gray-300 px-4 py-2 text-center font-semibold">
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
                              <td className="border border-gray-300 px-4 py-2">
                                <div className="font-semibold">{criterion.title}</div>
                                <div className="text-sm text-gray-600 mt-1">{criterion.description}</div>
                                <div className="text-xs text-gray-500 mt-1">Weight: {criterion.weight}</div>
                              </td>
                              {rubricData.performanceLevels?.map((level: any) => (
                                <td key={level.id} className="border border-gray-300 px-4 py-2 text-center">
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

                    {/* Total Points */}
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
    </div>
  )
}
