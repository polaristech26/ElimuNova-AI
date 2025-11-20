'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, ArrowLeft, CreditCard, HelpCircle } from 'lucide-react'
import Link from 'next/link'

export default function SubscriptionCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full bg-white shadow-xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Subscription Cancelled
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">
            Your subscription process was cancelled. No charges have been made to your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Cancellation Message */}
          <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
            <div className="text-center">
              <h3 className="font-semibold text-orange-900 mb-2">
                No Worries!
              </h3>
              <p className="text-orange-700 text-sm">
                You can still start your free trial or choose a different plan anytime. 
                Your account remains active and you can continue using the free features.
              </p>
            </div>
          </div>

          {/* What You Can Do */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">What would you like to do?</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Try Different Plan</h4>
                    <p className="text-blue-700 text-sm">
                      Browse our pricing options and find the perfect plan for you.
                    </p>
                  </div>
                  <Link href="/pricing">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <CreditCard className="w-4 h-4 mr-2" />
                      View Plans
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-green-900 mb-1">Start Free Trial</h4>
                    <p className="text-green-700 text-sm">
                      Get 7 days of full access to all premium features at no cost.
                    </p>
                  </div>
                  <Link href="/teacher/dashboard">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Start Trial
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-purple-900 mb-1">Need Help?</h4>
                    <p className="text-purple-700 text-sm">
                      Contact our support team if you have questions about pricing or features.
                    </p>
                  </div>
                  <Link href="/contact">
                    <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Get Help
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <Link href="/teacher/dashboard" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            
            <Link href="/pricing" className="flex-1">
              <Button variant="outline" className="w-full">
                <CreditCard className="w-4 h-4 mr-2" />
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Support Contact */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Questions about our plans?{' '}
              <a href="mailto:support@edugenius.ai" className="text-blue-600 hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}