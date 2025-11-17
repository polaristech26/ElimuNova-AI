'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Search, 
  Plus, 
  Edit,
  Trash2,
  MoreHorizontal,
  User,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  Loader2,
  GraduationCap,
  BookOpen,
  School,
  UserPlus,
  Settings,
  Eye,
  Key,
  Copy,
  Lock
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import CreateClassModal from "@/components/modals/create-class-modal"
import EnrollStudentModal from "@/components/modals/enroll-student-modal"
import EditStudentModal from "@/components/modals/edit-student-modal"
import ViewStudentModal from "@/components/modals/view-student-modal"
import ViewStudentPasswordModal from "@/components/modals/view-student-password-modal"
import ShareLessonPlanModal from "@/components/modals/share-lesson-plan-modal"
import GeneratePasswordModal from "@/components/modals/generate-password-modal"

interface Student {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  status: string
  joinDate: string
  class?: {
    id: string
    name: string
    subject: string
    grade: string
  }
  credentials?: {
    username: string
    password: string
  }
}

interface Class {
  id: string
  name: string
  subject: string
  grade: string
  description?: string
  studentCount: number
  createdAt: string
  isActive: boolean
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('students')
  
  // Modal states
  const [showCreateClassModal, setShowCreateClassModal] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showViewPasswordModal, setShowViewPasswordModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([
      fetchStudents(),
      fetchClasses()
    ])
  }

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/teacher/students')
      
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      } else {
        console.error('Failed to fetch students')
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/teacher/classes')
      
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes || [])
      } else {
        console.error('Failed to fetch classes')
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  const handleEnrollSuccess = () => {
    fetchData()
    setShowEnrollModal(false)
  }

  const handleClassSuccess = () => {
    fetchClasses()
    setShowCreateClassModal(false)
  }

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student)
    setShowEditModal(true)
  }

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student)
    setShowViewModal(true)
  }

  const handleEditSuccess = () => {
    fetchData()
    setShowEditModal(false)
    setSelectedStudent(null)
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    try {
      const response = await fetch(`/api/teacher/students/${studentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setStudents(students.filter(student => student.id !== studentId))
      } else {
        console.error('Failed to delete student')
      }
    } catch (error) {
      console.error('Error deleting student:', error)
    }
  }

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class? This will unassign all students from this class.')) return

    try {
      const response = await fetch(`/api/teacher/classes/${classId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setClasses(classes.filter(cls => cls.id !== classId))
        fetchStudents() // Refresh students to update class assignments
      } else {
        console.error('Failed to delete class')
      }
    } catch (error) {
      console.error('Error deleting class:', error)
    }
  }

  const handleToggleStudentStatus = async (studentId: string, currentStatus: string) => {
    try {
      const response = await fetch(`/api/teacher/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: currentStatus === 'Inactive'
        })
      })

      if (response.ok) {
        fetchStudents()
      } else {
        console.error('Failed to update student status')
      }
    } catch (error) {
      console.error('Error updating student status:', error)
    }
  }

  const handleGenerateCredentials = (student: Student) => {
    setSelectedStudent(student)
    setShowPasswordModal(true)
  }

  const handlePasswordSuccess = () => {
    fetchStudents()
    setShowPasswordModal(false)
    setSelectedStudent(null)
  }

  const handleViewPassword = (student: Student) => {
    setSelectedStudent(student)
    setShowViewPasswordModal(true)
  }

  const handlePasswordViewSuccess = () => {
    fetchStudents()
    setShowViewPasswordModal(false)
    setSelectedStudent(null)
  }

  const handleShareLessonPlan = (classData: Class) => {
    setSelectedClass(classData)
    setShowShareModal(true)
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && student.status === 'Active') ||
                         (statusFilter === 'inactive' && student.status === 'Inactive')
    const matchesClass = classFilter === 'all' || 
                        (classFilter === 'unassigned' && !student.class) ||
                        (student.class && student.class.id === classFilter)
    
    return matchesSearch && matchesStatus && matchesClass
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading students and classes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students & Classes Management</h1>
          <p className="text-gray-600 mt-1">Manage your students, classes, and enrollments</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowCreateClassModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <School className="w-4 h-4 mr-2" />
            Create Class
          </Button>
          <Button 
            onClick={() => setShowEnrollModal(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Enroll Student
        </Button>
      </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur-sm border-0 shadow-sm">
          <TabsTrigger value="students" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            Students ({students.length})
          </TabsTrigger>
          <TabsTrigger value="classes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
            <School className="w-4 h-4 mr-2" />
            Classes ({classes.length})
          </TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          {/* Search and Filters */}
          <Card className="bg-gradient-to-br from-white via-purple-50 to-blue-50 shadow-lg backdrop-blur-sm border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                    placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/70 backdrop-blur-sm border-0 shadow-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-white/70 backdrop-blur-sm border-0 shadow-sm">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-white/70 backdrop-blur-sm border-0 shadow-sm">
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} ({cls.subject})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
          </div>
        </CardContent>
      </Card>

          {/* Students Table */}
          <Card className="bg-gradient-to-br from-white via-blue-50 to-purple-50 shadow-lg backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Students List</CardTitle>
              <CardDescription>
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-none">
                        <TableHead className="border-none">Student</TableHead>
                        <TableHead className="border-none">Email</TableHead>
                        <TableHead className="border-none">Class</TableHead>
                        <TableHead className="border-none">Status</TableHead>
                        <TableHead className="border-none">Join Date</TableHead>
                        <TableHead className="border-none">Credentials</TableHead>
                        <TableHead className="border-none">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id} className="border-none hover:bg-blue-50/50">
                          <TableCell className="border-none">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{student.name}</p>
                                {student.phone && (
                                  <p className="text-sm text-gray-500">{student.phone}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="border-none">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{student.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="border-none">
                            {student.class ? (
                              <div className="flex items-center space-x-2">
                                <BookOpen className="w-4 h-4 text-blue-500" />
                                <div>
                                  <p className="text-sm font-medium text-blue-600">{student.class.name}</p>
                                  <p className="text-xs text-gray-500">{student.class.subject} - {student.class.grade}</p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">No class assigned</span>
                            )}
                          </TableCell>
                          <TableCell className="border-none">
                            <Badge className={
                              student.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }>
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="border-none">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{formatDate(student.joinDate)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="border-none">
                            {student.credentials ? (
                              <div className="flex items-center space-x-2">
                                <Key className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-600">Set</span>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleGenerateCredentials(student)}
                                className="bg-white/70 backdrop-blur-sm border-0 shadow-sm hover:bg-white/90"
                              >
                                <Key className="w-4 h-4 mr-1" />
                                Set Password
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="border-none">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                                <DropdownMenuItem onClick={() => handleViewStudent(student)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewPassword(student)}>
                                  <Lock className="w-4 h-4 mr-2" />
                                  View Password
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleToggleStudentStatus(student.id, student.status)}
                                >
                                  {student.status === 'Active' ? (
                                    <>
                                      <UserX className="w-4 h-4 mr-2" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-4 h-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteStudent(student.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== 'all' || classFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'Get started by enrolling your first student'
                    }
                  </p>
                  {(!searchTerm && statusFilter === 'all' && classFilter === 'all') && (
                    <Button 
                      onClick={() => setShowEnrollModal(true)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Enroll First Student
            </Button>
                  )}
                </div>
              )}
          </CardContent>
        </Card>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <Card key={cls.id} className="bg-gradient-to-br from-white via-green-50 to-emerald-50 shadow-lg backdrop-blur-sm border-0 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {cls.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                        {cls.subject} • {cls.grade}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="hover:bg-white/50">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                        <DropdownMenuItem onClick={() => handleShareLessonPlan(cls)}>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Share Lesson Plans
                      </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClass(cls.id)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                          Delete Class
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                      <Badge className="bg-green-100 text-green-800">
                        {cls.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        {cls.studentCount} students
                    </div>
                  </div>
                  
                    {cls.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{cls.description}</p>
                    )}
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                      Created {formatDate(cls.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

          {classes.length === 0 && (
            <Card className="bg-gradient-to-br from-white via-gray-50 to-blue-50 shadow-lg backdrop-blur-sm border-0">
              <CardContent className="p-12 text-center">
                <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No classes created</h3>
                <p className="text-gray-500 mb-4">Create your first class to start organizing students</p>
                <Button 
                  onClick={() => setShowCreateClassModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <School className="w-4 h-4 mr-2" />
                  Create First Class
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateClassModal
        isOpen={showCreateClassModal}
        onClose={() => setShowCreateClassModal(false)}
        onSuccess={handleClassSuccess}
      />

      <EnrollStudentModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        onSuccess={handleEnrollSuccess}
        classes={classes}
      />

      <EditStudentModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedStudent(null)
        }}
        onSuccess={handleEditSuccess}
        student={selectedStudent}
        classes={classes}
      />

      <ViewStudentModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedStudent(null)
        }}
        student={selectedStudent}
        onEdit={handleEditStudent}
        onDelete={handleDeleteStudent}
        onGenerateCredentials={(studentId) => {
          const student = students.find(s => s.id === studentId)
          if (student) handleGenerateCredentials(student)
        }}
      />

      <ShareLessonPlanModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false)
          setSelectedClass(null)
        }}
        onSuccess={() => {
          setShowShareModal(false)
          setSelectedClass(null)
        }}
        classData={selectedClass}
      />

      <GeneratePasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false)
          setSelectedStudent(null)
        }}
        onSuccess={handlePasswordSuccess}
        studentName={selectedStudent?.name || 'Student'}
        studentId={selectedStudent?.id || ''}
      />

      <ViewStudentPasswordModal
        isOpen={showViewPasswordModal}
        onClose={() => {
          setShowViewPasswordModal(false)
          setSelectedStudent(null)
        }}
        onPasswordGenerated={handlePasswordViewSuccess}
        student={selectedStudent}
      />
    </div>
  )
}
