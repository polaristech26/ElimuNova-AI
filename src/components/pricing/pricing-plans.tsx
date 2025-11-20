'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Crown, Zap, Loader2 } from "lucide-react"
import { useSubscription } from '@/hooks/use-subscription'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Package {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  maxTeachers: number
  maxStudents: number
  features: string[]
  isActive: boolean
}

interface PricingPlansProps {
  packages: Package[]
}

export function PricingPlans({ packages }: PricingPlansProps) {
  const { data: session } = useSession()
  const { subscription, hasAccess, isTrialEligible, startTrial, createCheckout } = useSubscription()
  const [loading, setLoading] = useState<string | null>(null)

  const usd = (n: number) => new Intl.NumberFormat("en-US", { 
    style: "currency", 
    currency: "USD" 
  }).format(n)

  const colors = [
    "from-blue-500 to-purple-600",
    "from-purple-500 to-pink-600", 
    "from-pink-500 to-rose-600",
    "from-green-500 to-emerald-600",
    "from-orange-500 to-red-600",
    "from-indigo-500 to-blue-600"
  ] as const

  const handleStartTrial = async () => {
    if (!session) {
      window.location.href = '/auth/signin'
      return
    }

    setLoading('trial')
    try {
      const success = await startTrial()
      if (success) {
        window.location.href = '/teacher/dashboard'
      }
    } catch (error) {
      console.error('Failed to start trial:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleUpgrade = async (packageId: string) => {
    if (!session) {
      window.location.href = '/auth/signin'
      return
    }

    setLoading(packageId)
    try {
      await createCheckout(packageId)
    } catch (error) {
      console.error('Failed to create checkout:', error)
    } finally {
      setLoading(null)
    }
  }

  const getButtonText = (pkg: Package) => {
    if (!session) return 'Sign In to Get Started'
    if (subscription?.packageName === pkg.name && hasAccess) return 'Current Plan'
    if (isTrialEligible) return 'Start Free Trial'
    return 'Upgrade Now'
  }

  const getButtonAction = (pkg: Package) => {
    if (!session) return () => window.location.href = '/auth/signin'
    if (subscription?.packageName === pkg.name && hasAccess) return () => {}
    if (isTrialEligible) return handleStartTrial
    return () => handleUpgrade(pkg.id)
  }

  const isCurrentPlan = (pkg: Package) => {
    return subscription?.packageName === pkg.name && hasAccess
  }

  const isPopular = (pkg: Package, index: number) => {
    // Mark middle-priced package as popular, or the second one if we have multiple
    return packages.length >= 3 && index === Math.floor(packages.length / 2)
  }

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Unlock the full potential of AI-powered education. Start with a 7-day free trial, 
          then choose the plan that fits your needs.
        </p>
        
        {/* Current Subscription Status */}
        {session && subscription && (
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200">
            {subscription.isTrial ? (
              <>
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">
                  Free Trial - {subscription.daysRemaining} days remaining
                </span>
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">
                  Current: {subscription.packageName}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {packages.map((pkg, index) => (
          <Card 
            key={pkg.id}
            className={`relative bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${
              isCurrentPlan(pkg) ? 'ring-2 ring-purple-500' : ''
            }`}
          >
            {/* Popular Badge */}
            {isPopular(pkg, index) && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 text-sm font-medium">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            {/* Current Plan Badge */}
            {isCurrentPlan(pkg) && (
              <div className="absolute -top-4 right-4">
                <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 text-sm font-medium">
                  <Crown className="w-3 h-3 mr-1" />
                  Current
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center`}>
                <Crown className="w-8 h-8 text-white" />
              </div>
              
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {pkg.name}
              </CardTitle>
              
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  {usd(pkg.price)}
                </span>
                <span className="text-gray-600 ml-1">/month</span>
              </div>
              
              <CardDescription className="text-gray-600 text-base">
                {pkg.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Package Limits */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{pkg.maxTeachers}</div>
                  <div className="text-sm text-gray-600">Teachers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{pkg.maxStudents}</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Features included:</h4>
                <ul className="space-y-2">
                  {pkg.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <Button
                onClick={getButtonAction(pkg)}
                disabled={loading === pkg.id || loading === 'trial' || isCurrentPlan(pkg)}
                className={`w-full py-3 text-base font-semibold transition-all duration-300 ${
                  isCurrentPlan(pkg)
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : isPopular(pkg, index)
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
                    : `bg-gradient-to-r ${colors[index % colors.length]} hover:shadow-lg text-white`
                }`}
              >
                {loading === pkg.id || loading === 'trial' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  getButtonText(pkg)
                )}
              </Button>

              {/* Trial Info */}
              {isTrialEligible && !session && (
                <p className="text-center text-sm text-gray-500">
                  Sign in to start your 7-day free trial
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ or Additional Info */}
      <div className="text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Questions about our plans?
          </h3>
          <p className="text-gray-600 mb-6">
            All plans include a 7-day free trial. No credit card required to start.
            Cancel anytime during your trial period.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button variant="outline" className="bg-white/80 backdrop-blur-sm">
                Contact Sales
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="outline" className="bg-white/80 backdrop-blur-sm">
                View FAQ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}