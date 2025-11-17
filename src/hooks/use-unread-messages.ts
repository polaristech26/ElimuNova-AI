import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function useUnreadMessages() {
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user) {
      setLoading(false)
      return
    }

    const fetchUnreadCount = async () => {
      try {
        const endpoint = session.user.role === 'STUDENT' 
          ? '/api/student/messages/unread'
          : session.user.role === 'TEACHER'
          ? '/api/teacher/messages/unread'
          : null

        if (!endpoint) {
          setLoading(false)
          return
        }

        const response = await fetch(endpoint)
        if (response.ok) {
          const data = await response.json()
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error('Error fetching unread count:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUnreadCount()

    // Poll every 30 seconds for new messages
    const interval = setInterval(fetchUnreadCount, 30000)

    return () => clearInterval(interval)
  }, [session])

  return { unreadCount, loading }
}
