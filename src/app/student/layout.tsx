'use client'

import { useSession } from 'next-auth/react'
import { ProfessionalDashboardLayout } from '@/components/layout/professional-dashboard-layout'
import { useSchoolInfo } from '@/hooks/use-school-info'
import { useUnreadMessages } from '@/hooks/use-unread-messages'
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  Calendar,
  Brain,
  FileText,
  Trophy,
  MessageSquare,
  Sparkles,
  CreditCard
} from 'lucide-react'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const { schoolInfo, loading } = useSchoolInfo()
  const { unreadCount } = useUnreadMessages()

  const sidebarItems = [
    { icon: BarChart3, label: "Dashboard", href: "/student/dashboard" },
    { icon: BookOpen, label: "Lessons", href: "/student/lessons" },
    { icon: ClipboardList, label: "Assignments", href: "/student/assignments" },
    { icon: FileText, label: "Resources", href: "/student/resources" },
    { icon: Brain, label: "AI Tutor", href: "/student/ai-tutor" },
    { icon: Sparkles, label: "AI Tools (Images & PPT)", href: "/student/ai-tools" },
    { icon: Trophy, label: "Progress", href: "/student/progress" },
    { icon: Calendar, label: "Schedule", href: "/student/schedule" },
    { icon: CreditCard, label: "Billing", href: "/student/billing" },
    {
      icon: MessageSquare,
      label: "Messages",
      href: "/student/messages",
      badge: unreadCount > 0 ? unreadCount : undefined
    }
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
      userRole="STUDENT"
      userName={session.user?.name || 'Student'}
      userEmail={session.user?.email || ''}
      schoolName={schoolInfo?.school?.name || 'Loading...'}
      sidebarItems={sidebarItems}
    >
      {children}
    </ProfessionalDashboardLayout>
  )
}
