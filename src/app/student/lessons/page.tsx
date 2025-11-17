"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function LessonsRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the correct lessons page
    router.replace('/student/lesson-plans')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to AI Lessons...</p>
      </div>
    </div>
  )
}
