'use client'

import { useSession } from 'next-auth/react'
import { ProfessionalDashboardLayout } from '@/components/layout/professional-dashboard-layout'
import { useSchoolInfo } from '@/hooks/use-school-info'
import { 
  BarChart3, 
  Users, 
  School, 
  Settings, 
  CreditCard,
  FileText,
  Calendar,
  Shield,
  Bell
} from 'lucide-react'

export default function SchoolAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const { schoolInfo, loading } = useSchoolInfo()

  const sidebarItems = [
    { icon: BarChart3, label: "Dashboard", href: "/school-admin/dashboard" },
    { icon: Users, label: "Teachers", href: "/school-admin/teachers" },
    { icon: School, label: "Students", href: "/school-admin/students" },
    { icon: Calendar, label: "Meetings", href: "/school-admin/meetings" },
    { icon: Bell, label: "Activities", href: "/school-admin/activities" },
    { icon: FileText, label: "Reports", href: "/school-admin/reports" },
    { icon: CreditCard, label: "Billing", href: "/school-admin/billing" },
    { icon: Settings, label: "Settings", href: "/school-admin/settings" },
    { icon: Shield, label: "Security", href: "/school-admin/security" }
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
      userRole="SCHOOL_ADMIN"
      userName={session.user?.name || 'School Admin'}
      userEmail={session.user?.email || ''}
      schoolName={schoolInfo?.school?.name || 'Loading...'}
      sidebarItems={sidebarItems}
    >
      {children}
    </ProfessionalDashboardLayout>
  )
}
