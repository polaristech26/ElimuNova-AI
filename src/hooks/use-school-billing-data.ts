'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface SchoolBillingData {
  school: {
    id: string
    name: string
    email: string
  }
  currentSubscription: {
    id: string
    packageId: string
    packageName: string
    price: number
    status: string
    isTrial: boolean
    endDate: Date
    trialEndsAt: Date | null
  } | null
  usage: {
    teachers: {
      active: number
      limit: number
      percentage: number
    }
    students: {
      active: number
      limit: number
      percentage: number
    }
    lessonPlans: number
    aiGenerations: number
    engagementRate: number
    growthRate: string
  }
  analytics: {
    engagement: string
    satisfaction: string
    activeUsers: number
    totalUsers: number
  }
  upgradePackage: {
    id: string
    name: string
    price: number
    maxTeachers: number
    maxStudents: number
    features: string[]
  } | null
  invoices: Array<{
    id: string
    date: string
    amount: number
    status: string
    period: string
  }>
  paymentMethod: {
    id: string
    type: string
    brand: string
    last4: string
    expiryMonth: number
    expiryYear: number
    isPrimary: boolean
  }
}

export function useSchoolBillingData() {
  const { data: session } = useSession()
  const [billingData, setBillingData] = useState<SchoolBillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBillingData = async () => {
    if (!session?.user?.id || session.user.role !== 'SCHOOL_ADMIN') {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/school-admin/billing-data')
      
      if (!response.ok) {
        throw new Error('Failed to fetch billing data')
      }

      const result = await response.json()
      setBillingData(result.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching billing data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBillingData()
  }, [session?.user?.id])

  return {
    billingData,
    loading,
    error,
    refetch: fetchBillingData
  }
}