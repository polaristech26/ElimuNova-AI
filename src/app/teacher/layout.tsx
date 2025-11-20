'use client'

import { useSession } from 'next-auth/react'
import { ProfessionalDashboardLayout } from '@/components/layout/professional-dashboard-layout'
import { useSchoolInfo } from '@/hooks/use-school-info'
import { useUnreadMessages } from '@/hooks/use-unread-messages'
import { 
  BookOpen, 
  Users, 
  FileText, 
  BarChart3, 
  Calendar,
  Brain,
  ClipboardList,
  Users2,
  Presentation,
  Sparkles,
  Mail,
  CreditCard
} from 'lucide-react'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const { schoolInfo, loading } = useSchoolInfo()
  const { unreadCount } = useUnreadMessages()

  const sidebarItems = [
    { icon: BarChart3, label: "Dashboard", href: "/teacher/dashboard" },
    { icon: BookOpen, label: "Lesson Plans", href: "/teacher/lesson-plans" },
    { icon: FileText, label: "Schemes of Work", href: "/teacher/schemes-of-work" },
    { icon: ClipboardList, label: "Assignments", href: "/teacher/assignments" },
    { icon: Brain, label: "AI Content", href: "/teacher/ai-content" },
    { icon: Sparkles, label: "AI Tools (Images & PPT)", href: "/teacher/ai-tools" },
    { icon: FileText, label: "Rubrics", href: "/teacher/rubrics" },
    { icon: FileText, label: "Rubric Generator", href: "/teacher/rubric-generator" },
    { icon: Presentation, label: "PowerPoint", href: "/teacher/powerpoint" },
    { icon: Presentation, label: "PowerPoint Generator", href: "/teacher/powerpoint-generator" },
    { icon: Users, label: "Students", href: "/teacher/students" },
    { 
      icon: Mail, 
      label: "Messages", 
      href: "/teacher/messages",
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    { icon: Users2, label: "Meetings", href: "/teacher/meetings" },
    { icon: Calendar, label: "Schedule", href: "/teacher/schedule" },
    { icon: CreditCard, label: "Billing", href: "/teacher/billing" },
    { icon: Brain, label: "Hope AI", href: "/teacher/alexa" },
    { icon: BarChart3, label: "Analytics", href: "/teacher/analytics" }
  ]

  if (!session || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <ProfessionalDashboardLayout
      userRole="TEACHER"
      userName={session.user?.name || 'Teacher'}
      userEmail={session.user?.email || ''}
      schoolName={schoolInfo?.school?.name || 'Loading...'}
      sidebarItems={sidebarItems}
    >
      {children}
    </ProfessionalDashboardLayout>
  )
}
