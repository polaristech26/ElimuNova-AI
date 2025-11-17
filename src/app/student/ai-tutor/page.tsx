"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Send, 
  MessageCircle, 
  BookOpen, 
  TrendingUp, 
  Clock,
  Star,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText,
  Bot,
  Lightbulb,
  Target,
  Zap,
  Sparkles,
  BookMarked,
  HelpCircle,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Download
} from "lucide-react"

interface AITutorSession {
  id: string
  sessionType: string
  subject: string | null
  topic: string | null
  question: string
  response: string
  rating: number | null
  isHelpful: boolean | null
  createdAt: string
}

export default function AITutorPage() {
  const [question, setQuestion] = useState("")
  const [sessionType, setSessionType] = useState("general_help")
  const [subject, setSubject] = useState("")
  const [topic, setTopic] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessions, setSessions] = useState<AITutorSession[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentResponse, setCurrentResponse] = useState<string | null>(null)
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/student/ai-tutor')
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (err) {
      console.error('Error fetching sessions:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsLoading(true)
    setIsGeneratingResponse(true)
    setError(null)
    setCurrentResponse(null)

    try {
      const response = await fetch('/api/student/ai-tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionType,
          subject: subject || null,
          topic: topic || null,
          question: question.trim(),
          context: {
            currentTime: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      
      // Add the new session to the list
      setSessions(prev => [data.session, ...prev])
      
      // Show the response
      setCurrentResponse(data.response)
      
      // Clear the form
      setQuestion("")
      setSubject("")
      setTopic("")
    } catch (err) {
      console.error('Error submitting question:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
      setIsGeneratingResponse(false)
    }
  }

  const rateSession = async (sessionId: string, rating: number) => {
    try {
      // In a real implementation, you would update the rating in the database
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, rating }
          : session
      ))
    } catch (err) {
      console.error('Error rating session:', err)
    }
  }

  const markHelpful = async (sessionId: string, isHelpful: boolean) => {
    try {
      // In a real implementation, you would update the helpful status in the database
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, isHelpful }
          : session
      ))
    } catch (err) {
      console.error('Error marking session:', err)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-blue-50 via-purple-50 to-cyan-50 rounded-3xl p-8 shadow-lg">
        <div className="flex items-center justify-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Your AI Learning Companion
            </h1>
            <p className="text-gray-600 text-lg">
              Get instant help with any subject, assignment, or learning challenge
            </p>
          </div>
        </div>
        <div className="flex justify-center space-x-4">
          <Badge className="bg-blue-100 text-blue-700 px-4 py-2 text-sm">
            <Sparkles className="w-4 h-4 mr-1" />
            24/7 Available
          </Badge>
          <Badge className="bg-purple-100 text-purple-700 px-4 py-2 text-sm">
            <Brain className="w-4 h-4 mr-1" />
            Personalized Learning
          </Badge>
          <Badge className="bg-green-100 text-green-700 px-4 py-2 text-sm">
            <Target className="w-4 h-4 mr-1" />
            Instant Answers
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-3xl p-8 shadow-xl backdrop-blur-sm">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                <h2 className="text-2xl font-bold text-gray-900">Ask Your AI Tutor</h2>
                <p className="text-gray-600">Get personalized help with any subject or topic</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    What do you need help with?
                  </label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value)}
                    className="w-full p-4 bg-white/70 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-700"
                  >
                    <option value="general_help">General Help</option>
                    <option value="lesson">Lesson Help</option>
                    <option value="assignment_help">Assignment Help</option>
                    <option value="progress_review">Progress Review</option>
                  </select>
                  </div>
                  <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Subject (Optional)
                  </label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Mathematics, Science, English"
                    className="bg-white/70 backdrop-blur-sm rounded-2xl border-0 shadow-sm"
                  />
                  </div>
                </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Specific Topic (Optional)
                </label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Algebra, Photosynthesis, Essay Writing"
                  className="bg-white/70 backdrop-blur-sm rounded-2xl border-0 shadow-sm"
                />
                  </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Question
                </label>
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask me anything about your studies... Be as specific as possible for the best help!"
                  rows={5}
                  className="w-full p-4 bg-white/70 backdrop-blur-sm rounded-2xl border-0 shadow-sm resize-none"
                />
                  </div>

              {error && (
                <div className="flex items-center p-4 bg-red-50/80 backdrop-blur-sm rounded-2xl">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

                <Button
                type="submit" 
                disabled={isLoading || !question.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    AI is thinking...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-3" />
                    Ask AI Tutor
                  </>
                )}
                </Button>
            </form>

            {/* AI Response Display */}
            {(isGeneratingResponse || currentResponse) && (
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">AI Tutor Response</h3>
                    <p className="text-sm text-gray-600">Your personalized learning guidance</p>
                  </div>
              </div>
              
                {isGeneratingResponse ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
                    <span className="text-gray-600 font-medium">Generating your personalized response...</span>
                  </div>
                ) : currentResponse ? (
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {currentResponse}
                  </div>
                    <div className="mt-4 flex space-x-3">
                  <Button
                    size="sm"
                        variant="outline"
                        className="bg-white/70 backdrop-blur-sm"
                    onClick={() => {
                          navigator.clipboard.writeText(currentResponse)
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Response
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/70 backdrop-blur-sm"
                        onClick={() => setCurrentResponse(null)}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Ask Another Question
                  </Button>
                </div>
                  </div>
                ) : null}
                      </div>
                    )}
                  </div>
                </div>

        {/* Recent Sessions */}
        <div>
          <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mr-3">
                <Clock className="w-5 h-5 text-white" />
                  </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Recent Sessions</h3>
                <p className="text-gray-600 text-sm">Your AI tutor history</p>
                      </div>
                  </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sessions.length > 0 ? (
                sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="p-4 bg-gradient-to-r from-white/80 to-blue-50/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        {session.sessionType.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                </div>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2 font-medium">
                      {session.question}
                    </p>
                    {session.subject && (
                      <p className="text-xs text-gray-500 mb-3 font-medium">{session.subject}</p>
                    )}
                    
                    {/* Rating and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-2">Rate:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => rateSession(session.id, star)}
                            className="mr-1 hover:scale-110 transition-transform"
                          >
                            <Star 
                              className={`w-3 h-3 ${
                                star <= (session.rating || 0) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                          <div className="flex items-center space-x-2">
                        <button
                          onClick={() => markHelpful(session.id, true)}
                          className={`text-xs px-3 py-1 rounded-full transition-all ${
                            session.isHelpful === true
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-800'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3 inline mr-1" />
                          Helpful
                        </button>
                      </div>
                            </div>
                          </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm font-medium">No sessions yet</p>
                  <p className="text-xs">Start by asking a question above</p>
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
              </div>

      {/* Quick Help Topics */}
      <div className="w-full overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Quick Help Topics</h2>
            <p className="text-gray-600 text-base sm:text-lg">Common areas where students need help</p>
              </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Button 
              variant="outline" 
              className="bg-white/70 backdrop-blur-sm h-auto p-4 sm:p-6 flex flex-col items-center rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 hover:scale-105 w-full overflow-hidden"
              onClick={() => {
                setSessionType("assignment_help")
                setQuestion("I need help with my assignment. Can you explain the requirements and guide me through the solution?")
              }}
            >
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-blue-600 flex-shrink-0" />
              <span className="font-bold text-gray-900 mb-1 text-sm sm:text-base text-center w-full px-2">Assignment Help</span>
              <span className="text-xs text-gray-600 text-center line-clamp-2 w-full px-2 break-words">Get guidance on assignments and projects</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-white/70 backdrop-blur-sm h-auto p-4 sm:p-6 flex flex-col items-center rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 hover:scale-105 w-full overflow-hidden"
              onClick={() => {
                setSessionType("lesson")
                setQuestion("Can you explain this topic in a simple way and provide examples?")
              }}
            >
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-green-600 flex-shrink-0" />
              <span className="font-bold text-gray-900 mb-1 text-sm sm:text-base text-center w-full px-2">Lesson Help</span>
              <span className="text-xs text-gray-600 text-center line-clamp-2 w-full px-2 break-words">Understand difficult concepts</span>
            </Button>
            
                    <Button
              variant="outline" 
              className="bg-white/70 backdrop-blur-sm h-auto p-4 sm:p-6 flex flex-col items-center rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 hover:scale-105 w-full overflow-hidden"
              onClick={() => {
                setSessionType("progress_review")
                setQuestion("Can you review my progress and suggest areas for improvement?")
              }}
            >
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-purple-600 flex-shrink-0" />
              <span className="font-bold text-gray-900 mb-1 text-sm sm:text-base text-center w-full px-2">Progress Review</span>
              <span className="text-xs text-gray-600 text-center line-clamp-2 w-full px-2 break-words">Get personalized feedback</span>
                    </Button>

                  <Button
              variant="outline" 
              className="bg-white/70 backdrop-blur-sm h-auto p-4 sm:p-6 flex flex-col items-center rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 hover:scale-105 w-full overflow-hidden"
              onClick={() => {
                setSessionType("general_help")
                setQuestion("I'm feeling stuck with my studies. Can you help me create a study plan and motivate me?")
              }}
            >
              <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-yellow-600 flex-shrink-0" />
              <span className="font-bold text-gray-900 mb-1 text-sm sm:text-base text-center w-full px-2">Study Motivation</span>
              <span className="text-xs text-gray-600 text-center line-clamp-2 w-full px-2 break-words">Get motivated and stay on track</span>
                  </Button>
                </div>
              </div>
        </div>

      {/* AI Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
                  </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Instant Answers</h3>
          <p className="text-gray-600 text-sm">Get immediate help with any question, 24/7</p>
                  </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-white" />
                </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Personalized Learning</h3>
          <p className="text-gray-600 text-sm">AI adapts to your learning style and pace</p>
              </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white" />
              </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Guidance</h3>
          <p className="text-gray-600 text-sm">Step-by-step help for complex problems</p>
        </div>
      </div>
    </div>
  )
}
