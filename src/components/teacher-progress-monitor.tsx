"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Brain,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Target,
  MessageCircle,
  Star,
  Zap,
  Eye,
  RefreshCw,
  Loader2,
  AlertCircle
} from "lucide-react"

interface StudentProgress {
  id: string
  name: string
  email: string
  grade: string
  weeklyStudyTime: number
  monthlyStudyTime: number
  averageGrade: number | null
  completedAssignments: number
  pendingAssignments: number
  overdueAssignments: number
  recentAIActivity: number
  lastAISession: string | null
  lastStudySession: string | null
  lastSubmission: string | null
  analytics: any
}

interface MonitorData {
  classOverview: {
    totalStudents: number
    activeStudents: number
    totalStudyTime: number
    averageGrade: number
    totalAssignments: number
    completedAssignments: number
    completionRate: number
  }
  studentProgress: StudentProgress[]
  aiInsights: {
    topPerformers: StudentProgress[]
    needsAttention: StudentProgress[]
    mostActive: StudentProgress[]
    aiEngagement: StudentProgress[]
  }
  teacher: {
    name: string
    email: string
  }
}

export default function TeacherProgressMonitor() {
  const [monitorData, setMonitorData] = useState<MonitorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null)

  useEffect(() => {
    fetchMonitorData()
  }, [])

  const fetchMonitorData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/teacher/student-progress-monitor')
      
      if (!response.ok) {
        throw new Error('Failed to fetch monitor data')
      }
      
      const data = await response.json()
      setMonitorData(data)
    } catch (err) {
      console.error('Error fetching monitor data:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPerformanceColor = (grade: number | null) => {
    if (!grade) return 'text-gray-500'
    if (grade >= 80) return 'text-green-600'
    if (grade >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBadge = (grade: number | null) => {
    if (!grade) return { text: 'No Grades', color: 'bg-gray-100 text-gray-700' }
    if (grade >= 90) return { text: 'Excellent', color: 'bg-green-100 text-green-700' }
    if (grade >= 80) return { text: 'Good', color: 'bg-blue-100 text-blue-700' }
    if (grade >= 60) return { text: 'Fair', color: 'bg-yellow-100 text-yellow-700' }
    return { text: 'Needs Help', color: 'bg-red-100 text-red-700' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Student Progress</h3>
          <p className="text-gray-600">Analyzing student data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchMonitorData} className="bg-gradient-to-r from-blue-500 to-purple-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!monitorData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600">No student data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 rounded-3xl p-8 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Student Progress Monitor
            </h1>
            <p className="text-gray-600 text-lg">
              AI-powered insights and real-time tracking
            </p>
          </div>
        </div>
        <div className="flex justify-center space-x-4">
          <Badge className="bg-blue-100 text-blue-700 px-4 py-2 text-sm">
            <Brain className="w-4 h-4 mr-1" />
            AI-Enhanced Monitoring
          </Badge>
          <Badge className="bg-green-100 text-green-700 px-4 py-2 text-sm">
            <Activity className="w-4 h-4 mr-1" />
            Real-time Updates
          </Badge>
          <Badge className="bg-purple-100 text-purple-700 px-4 py-2 text-sm">
            <BarChart3 className="w-4 h-4 mr-1" />
            Comprehensive Analytics
          </Badge>
        </div>
      </div>

      {/* Class Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold">{monitorData.classOverview.totalStudents}</p>
              <p className="text-blue-200 text-xs">In your class</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Students</p>
              <p className="text-3xl font-bold">{monitorData.classOverview.activeStudents}</p>
              <p className="text-green-200 text-xs">This week</p>
            </div>
            <Activity className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Completion Rate</p>
              <p className="text-3xl font-bold">{monitorData.classOverview.completionRate}%</p>
              <p className="text-purple-200 text-xs">Assignments done</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Average Grade</p>
              <p className="text-3xl font-bold">{monitorData.classOverview.averageGrade}%</p>
              <p className="text-orange-200 text-xs">Class performance</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="flex items-center mb-4">
            <Star className="w-6 h-6 text-yellow-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">Top Performers</h3>
          </div>
          <div className="space-y-2">
            {monitorData.aiInsights.topPerformers.slice(0, 3).map((student, index) => (
              <div key={student.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">{student.name}</span>
                <Badge className="bg-yellow-100 text-yellow-700">
                  {student.averageGrade ? `${Math.round(student.averageGrade)}%` : 'N/A'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">Needs Attention</h3>
          </div>
          <div className="space-y-2">
            {monitorData.aiInsights.needsAttention.slice(0, 3).map((student, index) => (
              <div key={student.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">{student.name}</span>
                <Badge className="bg-red-100 text-red-700">
                  {student.overdueAssignments} overdue
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="flex items-center mb-4">
            <Clock className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">Most Active</h3>
          </div>
          <div className="space-y-2">
            {monitorData.aiInsights.mostActive.slice(0, 3).map((student, index) => (
              <div key={student.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">{student.name}</span>
                <Badge className="bg-blue-100 text-blue-700">
                  {formatStudyTime(student.weeklyStudyTime)}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="flex items-center mb-4">
            <Brain className="w-6 h-6 text-purple-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">AI Engagement</h3>
          </div>
          <div className="space-y-2">
            {monitorData.aiInsights.aiEngagement.slice(0, 3).map((student, index) => (
              <div key={student.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">{student.name}</span>
                <Badge className="bg-purple-100 text-purple-700">
                  {student.recentAIActivity} sessions
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Student Progress Details</h3>
          </div>
          <Button onClick={fetchMonitorData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Grade</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Performance</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Study Time</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Assignments</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">AI Activity</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Activity</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {monitorData.studentProgress.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge className="bg-blue-100 text-blue-700">
                      {student.grade}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${getPerformanceColor(student.averageGrade)}`}>
                        {student.averageGrade ? `${Math.round(student.averageGrade)}%` : 'N/A'}
                      </span>
                      <Badge className={getPerformanceBadge(student.averageGrade).color}>
                        {getPerformanceBadge(student.averageGrade).text}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <p className="text-gray-900 font-medium">{formatStudyTime(student.weeklyStudyTime)}</p>
                      <p className="text-gray-500">this week</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <div className="flex space-x-2">
                        <span className="text-green-600 font-medium">{student.completedAssignments}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-600">{student.completedAssignments + student.pendingAssignments}</span>
                      </div>
                      {student.overdueAssignments > 0 && (
                        <p className="text-red-600 text-xs">{student.overdueAssignments} overdue</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium">{student.recentAIActivity}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-600">
                      <p>Study: {formatDate(student.lastStudySession)}</p>
                      <p>AI: {formatDate(student.lastAISession)}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedStudent(student)}
                      className="bg-white/70 backdrop-blur-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{selectedStudent.name} - Detailed Progress</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStudent(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-2">Academic Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Grade:</span>
                      <span className={`font-bold ${getPerformanceColor(selectedStudent.averageGrade)}`}>
                        {selectedStudent.averageGrade ? `${Math.round(selectedStudent.averageGrade)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed Assignments:</span>
                      <span className="font-bold text-green-600">{selectedStudent.completedAssignments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending Assignments:</span>
                      <span className="font-bold text-yellow-600">{selectedStudent.pendingAssignments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Overdue Assignments:</span>
                      <span className="font-bold text-red-600">{selectedStudent.overdueAssignments}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-2">Study Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weekly Study Time:</span>
                      <span className="font-bold text-blue-600">{formatStudyTime(selectedStudent.weeklyStudyTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Study Time:</span>
                      <span className="font-bold text-blue-600">{formatStudyTime(selectedStudent.monthlyStudyTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Study Session:</span>
                      <span className="font-bold text-gray-600">{formatDate(selectedStudent.lastStudySession)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-2">AI Tutor Engagement</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total AI Sessions:</span>
                      <span className="font-bold text-purple-600">{selectedStudent.recentAIActivity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last AI Session:</span>
                      <span className="font-bold text-gray-600">{formatDate(selectedStudent.lastAISession)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Submission:</span>
                      <span className="font-bold text-gray-600">{formatDate(selectedStudent.lastSubmission)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-2">Recommendations</h4>
                  <div className="space-y-2 text-sm">
                    {selectedStudent.averageGrade && selectedStudent.averageGrade < 60 && (
                      <p className="text-red-600 font-medium">• Consider additional tutoring support</p>
                    )}
                    {selectedStudent.overdueAssignments > 2 && (
                      <p className="text-orange-600 font-medium">• Help with time management</p>
                    )}
                    {selectedStudent.recentAIActivity === 0 && (
                      <p className="text-blue-600 font-medium">• Encourage AI tutor usage</p>
                    )}
                    {selectedStudent.weeklyStudyTime < 300 && (
                      <p className="text-green-600 font-medium">• Suggest increased study time</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
