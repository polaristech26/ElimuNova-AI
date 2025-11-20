'use client'

import { useState } from 'react'
import { useSubscription } from '@/hooks/use-subscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Calendar, 
  Crown, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  RefreshCw,
  ArrowRight,
  DollarSign,
  BookOpen,
  Loader2,
  GraduationCap,
  Users,
  School
} from 'lucide-react'
import Link from 'next/link'

export default function StudentBilling() {
  const { subscription, context, hasAccess, isTrialEligible, startTrial, createCheckout, refetch } = useSubscription()
  const [loading, setLoading] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const handleStartTrial = async () => {
    setLoading('trial')
    try {
      const success = await startTrial()
      if (success) {
        await refetch()
      }
    } catch (error) {
      console.error('Failed to start trial:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleUpgrade = async (packageId: string) => {
    setLoading(packageId)
    try {
      await createCheckout(packageId)
    } catch (error) {
      console.error('Failed to create checkout:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'TRIAL': return 'bg-blue-100 text-blue-800'
      case 'TRIAL_EXPIRED': return 'bg-red-100 text-red-800'
      case 'EXPIRED': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-4 h-4" />
      case 'TRIAL': return <Zap className="w-4 h-4" />
      case 'TRIAL_EXPIRED': return <AlertTriangle className="w-4 h-4" />
      case 'EXPIRED': return <AlertTriangle className="w-4 h-4" />
      case 'CANCELLED': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getSubscriptionType = () => {
    if (context?.schoolId) {
      return 'School Subscription'
    } else if (context?.userId) {
      return 'Independent Student'
    }
    return 'Student Account'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription & Access</h1>
          <p className="text-gray-600 mt-1">
            View your subscription status and manage your learning access.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
          <Link href="/pricing">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Crown className="w-4 h-4 mr-2" />
              View Plans
            </Button>
          </Link>
        </div>
      </div>

      {/* Current Subscription Status */}
      <Card className="bg-gradient-to-br from-white via-blue-50 to-purple-50 shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            Learning Access Status
          </CardTitle>
          <CardDescription>
            Your current subscription and learning access details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscription ? (
            <>
              {/* Status Overview */}
              <div className="flex items-center justify-between p-4 bg-white/70 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    {getStatusIcon(subscription.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {subscription.packageName || 'Basic Plan'}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      {context?.schoolId ? (
                        <>
                          <School className="w-3 h-3" />
                          School Subscription
                        </>
                      ) : (
                        <>
                          <Users className="w-3 h-3" />
                          {getSubscriptionType()}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(subscription.status)}>
                  {getStatusIcon(subscription.status)}
                  <span className="ml-1">{subscription.status.replace('_', ' ')}</span>
                </Badge>
              </div>

              {/* Subscription Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white/70 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {subscription.isTrial ? 'Trial Ends' : 'Access Until'}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {subscription.endDate 
                      ? new Date(subscription.endDate).toLocaleDateString()
                      : subscription.trialEndsAt
                      ? new Date(subscription.trialEndsAt).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>

                <div className="p-4 bg-white/70 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Days Remaining</span>
                  </div>
                  <p className={`text-lg font-semibold ${
                    subscription.daysRemaining <= 3 ? 'text-red-600' :
                    subscription.daysRemaining <= 7 ? 'text-orange-600' :
                    'text-green-600'
                  }`}>
                    {subscription.daysRemaining} days
                  </p>
                </div>

                <div className="p-4 bg-white/70 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Access Type</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {subscription.isTrial ? 'Free Trial' : subscription.packageName || 'Premium'}
                  </p>
                </div>
              </div>

              {/* School vs Independent Info */}
              {context?.schoolId ? (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <School className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">School Subscription</h4>
                      <p className="text-sm text-blue-700">
                        Your access is managed by your school. Contact your teacher or school administrator 
                        for subscription-related questions or changes.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Independent Student Actions */
                <div className="flex flex-col sm:flex-row gap-3">
                  {subscription.isTrial ? (
                    <Button 
                      onClick={() => handleUpgrade('cmi77qgq20001q6qowh3a35jp')}
                      disabled={loading === 'cmi77qgq20001q6qowh3a35jp'}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {loading === 'cmi77qgq20001q6qowh3a35jp' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Crown className="w-4 h-4 mr-2" />
                      )}
                      Upgrade to Premium
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleUpgrade('cmi77qgq20001q6qowh3a35jp')}
                      disabled={loading === 'cmi77qgq20001q6qowh3a35jp'}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {loading === 'cmi77qgq20001q6qowh3a35jp' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Renew Subscription
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : isTrialEligible ? (
            /* No Subscription - Trial Eligible */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start Your Free Trial
              </h3>
              <p className="text-gray-600 mb-6">
                Get 7 days of full access to all premium learning features. No credit card required!
              </p>
              <Button 
                onClick={handleStartTrial}
                disabled={loading === 'trial'}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {loading === 'trial' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Start Free Trial
              </Button>
            </div>
          ) : (
            /* No Subscription - Not Eligible */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Active Subscription
              </h3>
              <p className="text-gray-600 mb-6">
                Subscribe to a premium plan to access all learning features and AI tools.
              </p>
              <Link href="/pricing">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Crown className="w-4 h-4 mr-2" />
                  View Plans & Subscribe
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Features Access */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Learning Features
          </CardTitle>
          <CardDescription>
            Features available with your current subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">AI Tutor Sessions</p>
                <p className="text-sm text-gray-600">
                  {hasAccess ? 'Unlimited access' : 'Limited to 3 per day'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Study Materials</p>
                <p className="text-sm text-gray-600">
                  {hasAccess ? 'All subjects available' : 'Basic materials only'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Progress Tracking</p>
                <p className="text-sm text-gray-600">
                  {hasAccess ? 'Advanced analytics' : 'Basic progress only'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">AI Tools</p>
                <p className="text-sm text-gray-600">
                  {hasAccess ? 'All AI tools available' : 'Limited usage'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Prompt for Independent Students */}
      {!context?.schoolId && subscription?.isTrial && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-purple-900 mb-2">
                  Upgrade Your Learning Experience
                </h3>
                <p className="text-purple-700 mb-4">
                  Get unlimited access to all learning features, AI tutoring, and advanced study tools.
                </p>
                <ul className="text-sm text-purple-600 space-y-1">
                  <li>• Unlimited AI tutor sessions</li>
                  <li>• Access to all subjects and materials</li>
                  <li>• Advanced progress tracking and analytics</li>
                  <li>• Priority support and new features</li>
                </ul>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-900 mb-2">$19.99</div>
                <div className="text-sm text-purple-600 mb-4">/month</div>
                <Button 
                  onClick={() => handleUpgrade('cmi77qgq20001q6qowh3a35jp')}
                  disabled={loading === 'cmi77qgq20001q6qowh3a35jp'}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {loading === 'cmi77qgq20001q6qowh3a35jp' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  Upgrade Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* School Subscription Info */}
      {context?.schoolId && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  School-Managed Subscription
                </h3>
                <p className="text-blue-700 mb-4">
                  Your learning access is provided through your school's subscription. 
                  This means you have full access to all features as long as your school maintains their subscription.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    Contact School Admin
                  </Button>
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    View School Features
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}