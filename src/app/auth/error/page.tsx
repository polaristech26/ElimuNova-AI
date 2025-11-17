'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Invalid email or password. Please try again.'
      case 'OAuthSignin':
        return 'Error occurred during sign in. Please try again.'
      case 'OAuthCallback':
        return 'Error occurred during callback. Please try again.'
      case 'OAuthCreateAccount':
        return 'Could not create account. Please try again.'
      case 'EmailCreateAccount':
        return 'Could not create account. Please try again.'
      case 'Callback':
        return 'Error occurred during callback. Please try again.'
      case 'OAuthAccountNotLinked':
        return 'Account already exists with different provider.'
      case 'EmailSignin':
        return 'Check your email for the sign in link.'
      case 'SessionRequired':
        return 'Please sign in to access this page.'
      case 'Default':
      default:
        return 'An error occurred during authentication. Please try again.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Tip:</strong> Make sure you're using the correct email and password. 
              If you're a new student, use the credentials provided by your teacher.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link href="/auth/signin" className="block">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
            
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Go to Home
              </Button>
            </Link>
          </div>

          {error && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Error code: {error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
