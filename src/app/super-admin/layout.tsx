'use client'

import { useSession } from 'next-auth/react'
import { ProfessionalDashboardLayout } from '@/components/layout/professional-dashboard-layout'
import { 
  BarChart3, 
  School, 
  Users, 
  Settings, 
  CreditCard,
  Shield,
  FileText,
  Globe,
  Package
} from 'lucide-react'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()

  const sidebarItems = [
    { icon: BarChart3, label: "Dashboard", href: "/super-admin/dashboard" },
    { icon: School, label: "Schools", href: "/super-admin/schools" },
    { icon: Users, label: "Users", href: "/super-admin/users" },
    { icon: Package, label: "Packages", href: "/super-admin/packages" },
    { icon: CreditCard, label: "Billing", href: "/super-admin/billing" },
    { icon: FileText, label: "Reports", href: "/super-admin/reports" },
    { icon: Settings, label: "System Settings", href: "/super-admin/system-settings" },
    { icon: Shield, label: "Security", href: "/super-admin/security" },
    { icon: Globe, label: "Global Settings", href: "/super-admin/global" }
  ]

  if (!session) {
    return <div>Loading...</div>
  }

  return (
    <ProfessionalDashboardLayout
      userRole="SUPER_ADMIN"
      userName={session.user?.name || 'Super Admin'}
      userEmail={session.user?.email || ''}
      schoolName="ElimuNova AI Platform"
      sidebarItems={sidebarItems}
    >
      {children}
    </ProfessionalDashboardLayout>
  )
}
