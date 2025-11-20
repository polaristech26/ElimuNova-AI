"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Brain, 
  Users, 
  School, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Target,
  Clock,
  Award
} from 'lucide-react'

interface IndependentUserWelcomeProps {
  userRole: 'TEACHER' | 'STUDENT'
  userName: string
  onComplete: () => void
}

export function IndependentUserWelcome({ userRole, userName, onComplete }: IndependentUserWelcomeProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const teacherFeatures = [
    {
      icon: BookOpen,
      title: "AI Lesson Plans",
      description: "Generate comprehensive lesson plans for any subject and grade level",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Brain,
      title: "Hope AI Assistant",
      description: "Get instant teaching support and curriculum guidance",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Target,
      title: "Schemes of Work",
      description: "Create detailed curriculum plans and track progress",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Sparkles,
      title: "AI Content Generation",
      description: "Generate images, presentations, and educational materials",
      color: "from-orange-500 to-red-600"
    }
  ]

  const studentFeatures = [
    {
      icon: Brain,
      title: "AI Tutor",
      description: "Get personalized help with any subject, anytime",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: BookOpen,
      title: "Interactive Lessons",
      description: "Access AI-generated lessons tailored to your learning style",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Target,
      title: "Progress Tracking",
      description: "Monitor your learning journey and achievements",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Award,
      title: "Self-Paced Learning",
      description: "Learn at your own pace without classroom restrictions",
      color: "from-orange-500 to-red-600"
    }
  ]

  const features = userRole === 'TEACHER' ? teacherFeatures : studentFeatures

  const steps = [
    {
      title: `Welcome to Independent ${userRole === 'TEACHER' ? 'Teaching' : 'Learning'}!`,
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            {userRole === 'TEACHER' ? (
              <BookOpen className="w-10 h-10 text-white" />
            ) : (
              <Brain className="w-10 h-10 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Hello, {userName}! 👋
            </h2>
            <p className="text-gray-600 text-lg">
              {userRole === 'TEACHER' 
                ? "You're set up as an independent teacher. This means you can use all of ElimuNova AI's powerful features without being tied to a specific school."
                : "You're set up as an independent learner. This means you can access personalized AI tutoring and learning materials without being enrolled in a specific school."
              }
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                {userRole === 'TEACHER' ? 'Full Teaching Suite Access' : 'Complete Learning Platform Access'}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Your AI-Powered Features",
      content: (
        <div className="space-y-6">
          <p className="text-center text-gray-600">
            {userRole === 'TEACHER' 
              ? "Here's what you can do as an independent teacher:"
              : "Here's what you can do as an independent learner:"
            }
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 bg-gradient-to-br from-white to-gray-50 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Ready to Get Started?",
      content: (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              You're All Set! 🎉
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              {userRole === 'TEACHER' 
                ? "Your independent teaching workspace is ready. You can start creating lesson plans, using AI tools, and managing your content right away."
                : "Your personalized learning environment is ready. You can start learning with AI tutoring, accessing lessons, and tracking your progress immediately."
              }
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Start Tips:</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {userRole === 'TEACHER' ? (
                <>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Try creating your first AI lesson plan</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Ask Hope AI for teaching advice</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Explore the AI content generation tools</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Start a conversation with your AI tutor</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Browse available AI lessons</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Set up your learning goals</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )
    }
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-0">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">
            {steps[currentStep].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-8">
            {steps[currentStep].content}
          </div>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Progress</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 0}
              className="bg-white/70"
            >
              Previous
            </Button>
            <Button 
              onClick={nextStep}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}