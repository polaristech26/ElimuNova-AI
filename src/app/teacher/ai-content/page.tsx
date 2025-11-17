'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Lightbulb
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import AIGeneratorModal from '@/components/modals/ai-generator-modal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

export default function AIContentPage() {
  const [content, setContent] = useState<AIContent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showGenerator, setShowGenerator] = useState(false)
  const [selectedContent, setSelectedContent] = useState<AIContent | null>(null)

  // Fetch content from API
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (typeFilter !== 'all') params.append('type', typeFilter)
        
        const response = await fetch(`/api/ai-content?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setContent(data.content || [])
        } else {
          console.error('Failed to fetch AI content')
        }
      } catch (error) {
        console.error('Error fetching AI content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [searchTerm, typeFilter])

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
    // You can implement an edit modal here
  }

  const handleDelete = async (contentId: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      try {
        const response = await fetch(`/api/ai-content/${contentId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setContent(prev => prev.filter(c => c.id !== contentId))
        }
      } catch (error) {
        console.error('Error deleting content:', error)
      }
    }
  }

  const handleShare = async (content: AIContent) => {
    // You can implement a share modal here
    console.log('Share content:', content)
  }

  const handleDownload = (content: AIContent) => {
    const element = document.createElement('a')
    const file = new Blob([content.content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${content.title}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleGeneratorSuccess = (newContent: AIContent) => {
    setContent(prev => [newContent, ...prev])
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
          <h1 className="text-3xl font-bold text-gray-900">AI Generated Content</h1>
          <p className="text-gray-600 mt-1">Manage your AI-generated educational content</p>
        </div>
        <Button 
          onClick={() => setShowGenerator(true)} 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Brain className="w-4 h-4 mr-2" />
          Generate New Content
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="bg-gradient-to-br from-white via-purple-50 to-blue-50 shadow-lg backdrop-blur-sm border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search content..."
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
                className="px-3 py-2 rounded-md border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Types</option>
                <option value="rubric">Rubrics</option>
                <option value="powerpoint">PowerPoints</option>
                <option value="assignment">Assignments</option>
                <option value="project">Projects</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white/70 backdrop-blur-sm">
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="rubric">Rubrics</TabsTrigger>
          <TabsTrigger value="powerpoint">PowerPoints</TabsTrigger>
          <TabsTrigger value="assignment">Assignments</TabsTrigger>
          <TabsTrigger value="project">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <Card key={item.id} className="bg-gradient-to-br from-white via-purple-50 to-blue-50 shadow-lg backdrop-blur-sm border-0 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      <Badge className={getTypeColor(item.type)}>
                        {item.type}
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
                        <DropdownMenuItem onClick={() => handleShare(item)}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600"
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
                    {item.isShared && (
                      <div className="flex items-center text-sm text-green-600">
                        <Share2 className="h-4 w-4 mr-2" />
                        <span>Currently shared</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Individual type tabs */}
        {['rubric', 'powerpoint', 'assignment', 'project'].map((type) => (
          <TabsContent key={type} value={type} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content
                .filter(item => item.type.toLowerCase() === type)
                .map((item) => (
                  <Card key={item.id} className="bg-gradient-to-br from-white via-purple-50 to-blue-50 shadow-lg backdrop-blur-sm border-0 hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <Badge className={getTypeColor(item.type)}>
                            {item.type}
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
                            <DropdownMenuItem onClick={() => handleShare(item)}>
                              <Share2 className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600"
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
                        {item.isShared && (
                          <div className="flex items-center text-sm text-green-600">
                            <Share2 className="h-4 w-4 mr-2" />
                            <span>Currently shared</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Empty State */}
      {content.length === 0 && (
        <Card className="bg-gradient-to-br from-white via-purple-50 to-blue-50 shadow-lg backdrop-blur-sm border-0">
          <CardContent className="p-12 text-center">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No AI Content Yet</h3>
            <p className="text-gray-600 mb-6">Start generating educational content with AI to get started.</p>
            <Button 
              onClick={() => setShowGenerator(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Brain className="w-4 h-4 mr-2" />
              Generate Your First Content
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <AIGeneratorModal
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        onSuccess={handleGeneratorSuccess}
      />
    </div>
  )
}
