import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface SchoolInfo {
  school: {
    id: string
    name: string
    address?: string
    phone?: string
    email?: string
    website?: string
    logo?: string
    createdAt: string
  }
  admin?: {
    firstName: string
    lastName: string
    email: string
  }
  teacher?: {
    firstName: string
    lastName: string
    email: string
  }
  student?: {
    firstName: string
    lastName: string
    email: string
  }
}

export function useSchoolInfo() {
  const { data: session, status } = useSession()
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isIndependent, setIsIndependent] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      setLoading(false)
      return
    }

    const fetchSchoolInfo = async () => {
      try {
        setLoading(true)
        setError(null)

        let endpoint = ''
        switch (session.user.role) {
          case 'SCHOOL_ADMIN':
            endpoint = '/api/school-admin/school-info'
            break
          case 'TEACHER':
            endpoint = '/api/teacher/school-info'
            break
          case 'STUDENT':
            endpoint = '/api/student/school-info'
            break
          default:
            throw new Error('Invalid user role')
        }

        const response = await fetch(endpoint)
        if (!response.ok) {
          // If no school info found, user is independent
          if (response.status === 404) {
            setIsIndependent(true)
            setSchoolInfo(null)
            return
          }
          throw new Error('Failed to fetch school information')
        }

        const data = await response.json()
        setSchoolInfo(data)
        setIsIndependent(false)
      } catch (err) {
        console.error('Error fetching school info:', err)
        // For teachers and students, assume independent mode if school info fails
        if (session.user.role === 'TEACHER' || session.user.role === 'STUDENT') {
          setIsIndependent(true)
          setSchoolInfo(null)
          setError(null) // Clear error for independent users
        } else {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSchoolInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, session?.user?.role, status])

  return { schoolInfo, loading, error, isIndependent }
}
