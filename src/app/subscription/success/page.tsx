'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Crown, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useSubscription } from '@/hooks/use-subscription'

export default function SubscriptionSuccess() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { refetch } = useSubscription()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Refresh subscription status after successful payment
    const refreshStatus = async () => {
      if (sessionId) {
        // Wait a moment for webhook to process
        setTimeout(async () => {
          await refetch()
          setLoading(false)
        }, 2000)
      } else {
        setLoading(false)
      }
    }

    refreshStatus()
  }, [sessionId, refetch])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full bg-white shadow-xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Premium!
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">
            Your subscription has been activated successfully. You now have access to all premium features.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Success Message */}
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-4">
              <Crown className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">
                  Subscription Activated
                </h3>
                <p className="text-green-700 text-sm">
                  You can now access unlimited AI lesson plans, advanced tools, and all premium features. 
                  Your subscription will automatically renew to ensure uninterrupted access.
                </p>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">What's next?</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Explore AI Tools</h4>
                <p className="text-blue-700 text-sm mb-3">
                  Generate lesson plans, create presentations, and use advanced AI features.
                </p>
                <Link href="/teacher/ai-tools">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Get Started
                  </Button>
                </Link>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Create Content</h4>
                <p className="text-purple-700 text-sm mb-3">
                  Start creating unlimited lesson plans and schemes of work.
                </p>
                <Link href="/teacher/lesson-plans/create">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    Create Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <Link href="/teacher/dashboard" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <Link href="/help" className="flex-1">
              <Button variant="outline" className="w-full">
                Get Help & Support
              </Button>
            </Link>
          </div>

          {/* Contact Support */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Need help? Contact our support team at{' '}
              <a href="mailto:support@edugenius.ai" className="text-blue-600 hover:underline">
                support@edugenius.ai
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}