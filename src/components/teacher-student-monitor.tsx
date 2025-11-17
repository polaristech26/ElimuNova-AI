"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Brain,
  Bell,
  Loader2
} from "lucide-react"

interface StudentProgress {
  id: string
  name: string
  email: string
  class: string
  analytics: {
    totalStudyTime: number
    averageGrade: number | null
    completedAssignments: number
    pendingAssignments: number
    overdueAssignments: number
    lastActiveDate: string | null
    streakDays: number
  }
  recentStudySessions: Array<{
    id: string
    subject: string
    topic: string | null
    duration: number
    startTime: string
    notes: string | null
  }>
  recentAITutorSessions: Array<{
    id: string
    sessionType: string
    subject: string | null
    topic: string | null
    question: string
    rating: number | null
    isHelpful: boolean | null
    createdAt: string
  }>
  assignments: Array<{
    id: string
    title: string
    dueDate: string
    status: string
    grade: number | null
  }>
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

interface TeacherStudentMonitorProps {
  teacherId: string
}

export function TeacherStudentMonitor({ teacherId }: TeacherStudentMonitorProps) {
  const [students, setStudents] = useState<StudentProgress[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [teacherId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch student progress
      const progressResponse = await fetch(`/api/teacher/student-progress?period=week`)
      if (progressResponse.ok) {
        const progressData = await progressResponse.json()
        setStudents(progressData.students || [])
      }

      // Fetch notifications
      const notificationsResponse = await fetch('/api/teacher/notifications?limit=10')
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json()
        setNotifications(notificationsData.notifications || [])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/teacher/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        )
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading student progress...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <Card className="bg-gradient-to-br from-white via-blue-50 to-purple-50 shadow-lg backdrop-blur-sm border-0">
        <CardHeader>
          <CardTitle className="edugenius-text-gradient-blue flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Recent Notifications
          </CardTitle>
          <CardDescription>Student activity and progress updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-lg border-l-4 ${
                    notification.isRead 
                      ? 'bg-gray-50 border-gray-300' 
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="ml-2"
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Student Progress Overview */}
      <Card className="bg-gradient-to-br from-white via-blue-50 to-purple-50 shadow-lg backdrop-blur-sm border-0">
        <CardHeader>
          <CardTitle className="edugenius-text-gradient-blue flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Student Progress Overview
          </CardTitle>
          <CardDescription>Track your students' learning progress and engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div key={student.id} className="p-4 bg-gradient-to-r from-white/70 to-blue-50/70 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{student.name}</h3>
                  <div className="flex items-center space-x-2">
                    {student.analytics.overdueAssignments > 0 && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    {student.analytics.streakDays > 0 && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Study Time:</span>
                    <span className="font-medium">{formatStudyTime(student.analytics.totalStudyTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Grade:</span>
                    <span className="font-medium">
                      {student.analytics.averageGrade ? `${Math.round(student.analytics.averageGrade)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assignments:</span>
                    <span className="font-medium">
                      {student.analytics.completedAssignments} completed, {student.analytics.pendingAssignments} pending
                    </span>
                  </div>
                  {student.analytics.overdueAssignments > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Overdue:</span>
                      <span className="font-medium">{student.analytics.overdueAssignments}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">AI Help:</span>
                    <span className="font-medium">{student.recentAITutorSessions.length} sessions</span>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Recent Activity</h4>
                  <div className="space-y-1">
                    {student.recentStudySessions.slice(0, 2).map((session) => (
                      <div key={session.id} className="flex items-center text-xs text-gray-600">
                        <BookOpen className="w-3 h-3 mr-1" />
                        <span>{session.subject}</span>
                        <span className="ml-auto">{formatStudyTime(session.duration)}</span>
                      </div>
                    ))}
                    {student.recentAITutorSessions.slice(0, 1).map((session) => (
                      <div key={session.id} className="flex items-center text-xs text-gray-600">
                        <Brain className="w-3 h-3 mr-1" />
                        <span>AI Help: {session.subject || 'General'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Study Time</p>
                <p className="text-2xl font-bold">
                  {formatStudyTime(students.reduce((total, student) => total + student.analytics.totalStudyTime, 0))}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">AI Help Requests</p>
                <p className="text-2xl font-bold">
                  {students.reduce((total, student) => total + student.recentAITutorSessions.length, 0)}
                </p>
              </div>
              <Brain className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Overdue Assignments</p>
                <p className="text-2xl font-bold">
                  {students.reduce((total, student) => total + student.analytics.overdueAssignments, 0)}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
