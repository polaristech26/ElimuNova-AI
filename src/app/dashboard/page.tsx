'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function DashboardRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    console.log('📍 Dashboard redirect - Status:', status)
    console.log('📍 Dashboard redirect - Session:', session)
    console.log('📍 Dashboard redirect - Role:', session?.user?.role)
    
    if (status === 'loading') {
      console.log('⏳ Still loading session...')
      return
    }

    if (!session) {
      console.log('❌ No session, redirecting to signin')
      router.push('/auth/signin')
      return
    }

    // Redirect based on user role
    console.log('🔀 Redirecting based on role:', session.user.role)
    switch (session.user.role) {
      case 'SUPER_ADMIN':
        console.log('➡️ Redirecting to /super-admin/dashboard')
        router.push('/super-admin/dashboard')
        break
      case 'SCHOOL_ADMIN':
        console.log('➡️ Redirecting to /school-admin/dashboard')
        router.push('/school-admin/dashboard')
        break
      case 'TEACHER':
        console.log('➡️ Redirecting to /teacher/dashboard')
        router.push('/teacher/dashboard')
        break
      case 'STUDENT':
        console.log('➡️ Redirecting to /student/dashboard')
        router.push('/student/dashboard')
        break
      default:
        console.log('⚠️ Unknown role, redirecting to signin')
        router.push('/auth/signin')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
