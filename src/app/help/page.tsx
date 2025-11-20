"use client"

import { PublicNav } from "@/components/ui/public-nav"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, BookOpen, MessageCircle, Video, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I create my first lesson plan?",
      answer: "Navigate to the Lesson Plans section, click 'Create New', fill in the subject, grade, and topic details, then click 'Generate with AI' to create your lesson plan."
    },
    {
      question: "Can I edit AI-generated content?",
      answer: "Yes! All AI-generated content is fully editable. You can modify lesson plans, schemes of work, and assignments to fit your specific needs."
    },
    {
      question: "How does the Hope AI assistant work?",
      answer: "Hope is your personal AI teaching assistant. Simply type your questions about teaching, lesson planning, or classroom management, and get instant, helpful responses."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use enterprise-grade security with end-to-end encryption to protect all your educational data and student information."
    }
  ]

  const resources = [
    {
      icon: BookOpen,
      title: "Getting Started Guide",
      description: "Learn the basics of using ElimuNova AI",
      type: "Guide",
      href: "/help/getting-started"
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch step-by-step video tutorials",
      type: "Video",
      href: "/help/video-tutorials"
    },
    {
      icon: FileText,
      title: "Best Practices",
      description: "Tips and tricks for effective teaching",
      type: "Article",
      href: "/help/best-practices"
    },
    {
      icon: MessageCircle,
      title: "Community Forum",
      description: "Connect with other educators",
      type: "Community",
      href: "/help/community"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <div className="max-w-full overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl elimunova-animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-rose-600/20 rounded-full blur-3xl elimunova-animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <PublicNav />

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-32 pb-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="elimunova-text-gradient-rainbow">Help Center</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Find answers to your questions and learn how to make the most of ElimuNova AI
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search for help articles, tutorials, and guides..."
                className="w-full pl-12 pr-4 py-4 elimunova-input text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Resources */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="elimunova-text-gradient">Quick Resources</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started quickly with these helpful resources
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {resources.map((resource, index) => (
              <Link key={resource.title} href={resource.href}>
                <Card className="elimunova-card-gradient group hover:scale-105 transition-all duration-300 cursor-pointer border-0">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <resource.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-sm font-medium text-blue-600 mb-2">{resource.type}</div>
                    <CardTitle className="elimunova-text-gradient-blue">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center mb-4">
                      {resource.description}
                    </CardDescription>
                    <Button variant="outline" className="w-full elimunova-glass">
                      View Resource
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-white/50 to-blue-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="elimunova-text-gradient">Frequently Asked Questions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find quick answers to common questions
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="elimunova-card-gradient border-0">
                <CardHeader>
                  <CardTitle className="elimunova-text-gradient-blue">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {faq.answer}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="elimunova-card-gradient border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold elimunova-text-gradient-blue mb-4">
                  Still Need Help?
                </CardTitle>
                <CardDescription className="text-lg">
                  Our support team is here to help you succeed. Get in touch with us for personalized assistance.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                    <p className="text-sm text-gray-600">Get instant help from our support team</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                    <p className="text-sm text-gray-600">Send us a detailed message</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Video Call</h3>
                    <p className="text-sm text-gray-600">Schedule a one-on-one session</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button size="lg" className="elimunova-button text-lg px-8 py-4">
                      Contact Support
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="elimunova-glass border-0 text-lg px-8 py-4 hover:bg-white/20"
                    onClick={() => window.open('https://wa.me/254791269918?text=Hello! I need help with ElimuNova AI platform.', '_blank')}
                  >
                    Start Live Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Logo className="mb-4" />
              <p className="text-gray-400">
                Transforming education with AI-powered tools for teachers and students.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 elimunova-text-gradient-blue">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/#features" className="hover:elimunova-text-gradient transition-all duration-300">Features</Link></li>
                <li><Link href="/pricing" className="hover:elimunova-text-gradient transition-all duration-300">Pricing</Link></li>
                <li><Link href="/api" className="hover:elimunova-text-gradient transition-all duration-300">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 elimunova-text-gradient-blue">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:elimunova-text-gradient transition-all duration-300">Help Center</Link></li>
                <li><Link href="/contact" className="hover:elimunova-text-gradient transition-all duration-300">Contact Us</Link></li>
                <li><Link href="/docs" className="hover:elimunova-text-gradient transition-all duration-300">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 elimunova-text-gradient-blue">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:elimunova-text-gradient transition-all duration-300">About</Link></li>
                <li><Link href="/privacy" className="hover:elimunova-text-gradient transition-all duration-300">Privacy</Link></li>
                <li><Link href="/terms" className="hover:elimunova-text-gradient transition-all duration-300">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ElimuNova AI. All rights reserved.</p>
            <p className="mt-2">
              Developed by{' '}
              <a 
                href="https://infinititechsolutions.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="elimunova-text-gradient hover:underline transition-all duration-300"
              >
                InfinitiTech Solutions
              </a>
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}
