'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ClipboardList, 
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
  Users,
  CheckCircle,
  AlertCircle,
  FileText,
  Brain
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import CreateAssignmentModal from '@/components/modals/create-assignment-modal'
import EditAssignmentModal from '@/components/modals/edit-assignment-modal'
import ViewAssignmentModal from '@/components/modals/view-assignment-modal'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import AIGeneratorModal from '@/components/modals/ai-generator-modal'

interface Assignment {
  id: string
  title: string
  description: string
  content: string
  dueDate: string
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'OVERDUE'
  createdAt: string
  updatedAt: string
  teacher: {
    id: string
    name: string
    email: string
  }
  lessonPlan?: {
    id: string
    title: string
    subject: string
    grade: string
  }
  students: Array<{
    id: string
    name: string
  }>
  submissions: Array<{
    id: string
    content: string
    attachments: string[]
    grade?: number
    feedback?: string
    submittedAt: string
    gradedAt?: string
    student: {
      id: string
      name: string
    }
  }>
  stats: {
    totalStudents: number
    totalSubmissions: number
    gradedSubmissions: number
    pendingSubmissions: number
  }
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [viewAssignmentId, setViewAssignmentId] = useState<string | null>(null)

  // Fetch assignments from API
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (statusFilter !== 'all') params.append('status', statusFilter)
        
        const response = await fetch(`/api/assignments?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setAssignments(data.assignments || [])
        } else {
          console.error('Failed to fetch assignments')
        }
      } catch (error) {
        console.error('Error fetching assignments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [searchTerm, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800'
      case 'GRADED': return 'bg-green-100 text-green-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'SUBMITTED': return <FileText className="w-4 h-4" />
      case 'GRADED': return <CheckCircle className="w-4 h-4" />
      case 'OVERDUE': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const handleCreateNew = () => {
    setShowCreateModal(true)
  }

  const handleView = (id: string) => {
    setViewAssignmentId(id)
    setShowViewModal(true)
  }

  const handleEdit = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setShowEditModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return
    
    try {
      const response = await fetch(`/api/assignments/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setAssignments(prev => prev.filter(assignment => assignment.id !== id))
      } else {
        console.error('Failed to delete assignment')
      }
    } catch (error) {
      console.error('Error deleting assignment:', error)
    }
  }

  const handleDownload = (id: string) => {
    // Download assignment
    console.log('Download assignment:', id)
  }

  const refreshAssignments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await fetch(`/api/assignments?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setAssignments(data.assignments || [])
      }
    } catch (error) {
      console.error('Error refreshing assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModalSuccess = () => {
    refreshAssignments()
  }

  const handleCloseModals = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setShowViewModal(false)
    setShowAIGenerator(false)
    setSelectedAssignment(null)
    setViewAssignmentId(null)
  }

  const handleAIGeneratorSuccess = (content: any) => {
    // Handle the generated content - could save it as a new assignment
    console.log('Generated content:', content)
    // You could automatically create an assignment with the generated content
    refreshAssignments()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-1">Manage and organize your assignments</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowAIGenerator(true)} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Brain className="w-4 h-4 mr-2" />
            AI Generator
          </Button>
          <Button onClick={handleCreateNew} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Create New Assignment
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="bg-gradient-to-br from-white via-purple-50 to-blue-50 shadow-lg backdrop-blur-sm border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/70 backdrop-blur-sm border-0 shadow-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white/70 backdrop-blur-sm border-0 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="GRADED">Graded</option>
                <option value="OVERDUE">Overdue</option>
              </select>
              <Button 
                variant="outline" 
                onClick={refreshAssignments}
                disabled={loading}
                className="bg-white/70 backdrop-blur-sm border-0 shadow-sm hover:bg-white/90"
              >
                <Filter className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Grid */}
      {assignments.length === 0 ? (
        <Card className="bg-gradient-to-br from-white via-gray-50 to-blue-50 shadow-lg backdrop-blur-sm border-0">
          <CardContent className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by creating your first assignment.'}
            </p>
            <Button onClick={handleCreateNew} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="bg-gradient-to-br from-white via-purple-50 to-blue-50 shadow-lg backdrop-blur-sm border-0 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {assignment.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {assignment.lessonPlan ? `${assignment.lessonPlan.subject} • ${assignment.lessonPlan.grade}` : 'General Assignment'}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="hover:bg-white/50">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                      <DropdownMenuItem onClick={() => handleView(assignment.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(assignment)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(assignment.id)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(assignment.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={`${getStatusColor(assignment.status)} flex items-center gap-1`}>
                      {getStatusIcon(assignment.status)}
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1).toLowerCase()}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      Due {new Date(assignment.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    {assignment.stats.totalStudents} students assigned
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    {assignment.stats.totalSubmissions} submissions
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-2" />
                    {assignment.teacher.name}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    Created {new Date(assignment.createdAt).toLocaleDateString()}
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Submission Progress</span>
                      <span>{assignment.stats.totalStudents > 0 ? Math.round((assignment.stats.totalSubmissions / assignment.stats.totalStudents) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${assignment.stats.totalStudents > 0 ? (assignment.stats.totalSubmissions / assignment.stats.totalStudents) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-white/70 backdrop-blur-sm border-0 shadow-sm hover:bg-white/90"
                      onClick={() => handleView(assignment.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-white/70 backdrop-blur-sm border-0 shadow-sm hover:bg-white/90"
                      onClick={() => handleEdit(assignment)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateAssignmentModal
        isOpen={showCreateModal}
        onClose={handleCloseModals}
        onSuccess={handleModalSuccess}
      />

      <EditAssignmentModal
        isOpen={showEditModal}
        onClose={handleCloseModals}
        onSuccess={handleModalSuccess}
        assignment={selectedAssignment}
      />

      <ViewAssignmentModal
        isOpen={showViewModal}
        onClose={handleCloseModals}
        assignmentId={viewAssignmentId}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AIGeneratorModal
        isOpen={showAIGenerator}
        onClose={handleCloseModals}
        onSuccess={handleAIGeneratorSuccess}
      />
    </div>
  )
}
