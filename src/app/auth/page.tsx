'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LogIn, 
  UserPlus, 
  GraduationCap,
  BookOpen,
  Users,
  Brain
} from 'lucide-react'
import Link from 'next/link'

export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to signin after a short delay to show the auth options
    const timer = setTimeout(() => {
      router.push('/auth/signin')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mr-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">ElimuNova AI</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">Transforming Education with Artificial Intelligence</p>
          <p className="text-gray-500">Choose your authentication method to continue</p>
        </div>

        {/* Auth Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Sign In */}
          <Card className="bg-gradient-to-br from-white via-blue-50 to-purple-50 shadow-xl border-0 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
              <CardDescription className="text-gray-600">
                Access your account and continue your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/auth/signin">
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-6">
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In to Your Account
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Sign Up */}
          <Card className="bg-gradient-to-br from-white via-purple-50 to-pink-50 shadow-xl border-0 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Sign Up</CardTitle>
              <CardDescription className="text-gray-600">
                Create a new account and start your educational journey
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/auth/signup">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create New Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Why Choose ElimuNova AI?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-6 bg-white/50 rounded-lg backdrop-blur-sm">
              <GraduationCap className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Learning</h3>
              <p className="text-gray-600 text-center">AI-powered personalized learning experiences</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white/50 rounded-lg backdrop-blur-sm">
              <BookOpen className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Content</h3>
              <p className="text-gray-600 text-center">Schemes of work, lesson plans, and assessments</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white/50 rounded-lg backdrop-blur-sm">
              <Users className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Collaborative Platform</h3>
              <p className="text-gray-600 text-center">Connect teachers, students, and administrators</p>
            </div>
          </div>
        </div>

        {/* Auto-redirect notice */}
        <div className="text-center mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800">
            <strong>Redirecting to sign in...</strong> You'll be automatically taken to the sign-in page in a few seconds.
          </p>
        </div>
      </div>
    </div>
  )
}
