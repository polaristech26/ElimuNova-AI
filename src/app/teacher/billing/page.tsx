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
  Download,
  RefreshCw,
  Settings,
  ArrowRight,
  DollarSign,
  Users,
  BookOpen,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function TeacherBilling() {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600 mt-1">
            Manage your subscription, view billing history, and upgrade your plan.
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
            <Crown className="w-5 h-5 text-purple-600" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Your current plan and subscription details
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
                    <p className="text-sm text-gray-600">
                      {context?.userRole === 'TEACHER' && context?.schoolId 
                        ? 'School Subscription' 
                        : 'Independent Teacher'
                      }
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
                      {subscription.isTrial ? 'Trial Ends' : 'Renewal Date'}
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
                    <span className="text-sm font-medium text-gray-700">Plan Type</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {subscription.isTrial ? 'Free Trial' : subscription.packageName || 'Premium'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
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
                
                <Button variant="outline" className="bg-white/80">
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </Button>
                
                <Button variant="outline" className="bg-white/80">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Payment
                </Button>
              </div>
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
                Get 7 days of full access to all premium features. No credit card required!
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
                Subscribe to a premium plan to access all features and continue using EduGenius AI.
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Usage Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Students Enrolled</span>
                <span className="font-semibold">
                  {context?.schoolId ? 'School-managed' : '0 / ∞'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Subscription Status</span>
                <span className={`font-semibold ${
                  subscription?.isActive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {subscription?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Account Type</span>
                <span className="font-semibold">
                  {context?.schoolId ? 'School Teacher' : 'Independent'}
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              <BookOpen className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscription?.isTrial ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Free Trial</p>
                    <p className="text-sm text-gray-600">No payment required</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Payment Required</p>
                    <p className="text-sm text-gray-600">Set up payment method</p>
                  </div>
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Settings className="w-4 h-4 mr-2" />
              {subscription?.isTrial ? 'Add Payment Method' : 'Update Payment'}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="w-5 h-5 text-purple-600" />
              Subscription Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Plan</span>
                <span className="font-semibold">{subscription?.packageName || 'No Plan'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <Badge className={`${
                  subscription?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  subscription?.status === 'TRIAL' ? 'bg-blue-100 text-blue-800' :
                  subscription?.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {subscription?.status || 'No Status'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Type</span>
                <span className="font-semibold">
                  {subscription?.isTrial ? 'Trial' : 'Paid'}
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Download className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Prompt */}
      {subscription?.isTrial && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-purple-900 mb-2">
                  Upgrade to Premium
                </h3>
                <p className="text-purple-700 mb-4">
                  Get unlimited access to all features, priority support, and advanced AI tools.
                </p>
                <ul className="text-sm text-purple-600 space-y-1">
                  <li>• Unlimited lesson plans and schemes of work</li>
                  <li>• Advanced AI image and presentation generation</li>
                  <li>• Priority customer support</li>
                  <li>• Export and sharing capabilities</li>
                </ul>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-900 mb-2">$29.99</div>
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
    </div>
  )
}