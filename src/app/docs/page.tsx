import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Code, Zap, Users, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
  const sections = [
    {
      title: "Getting Started",
      description: "Learn the basics and set up your account",
      icon: BookOpen,
      articles: ["Quick Start Guide", "Account Setup", "First Lesson Plan", "Understanding the Dashboard"]
    },
    {
      title: "AI Features",
      description: "Master our AI-powered tools",
      icon: Zap,
      articles: ["Lesson Plan Generator", "Scheme of Work Creator", "Hope AI Assistant", "Assignment Generator"]
    },
    {
      title: "API Reference",
      description: "Integrate with our API",
      icon: Code,
      articles: ["Authentication", "Endpoints", "SDKs", "Rate Limits"]
    },
    {
      title: "User Management",
      description: "Manage users and permissions",
      icon: Users,
      articles: ["Adding Students", "Teacher Management", "School Administration", "Role Permissions"]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl elimunova-animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-rose-600/20 rounded-full blur-3xl elimunova-animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-gray-700 hover:elimunova-text-gradient transition-all duration-300 font-medium">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:elimunova-text-gradient transition-all duration-300 font-medium">
              Pricing
            </Link>
            <Link href="/about" className="text-gray-700 hover:elimunova-text-gradient transition-all duration-300 font-medium">
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button variant="outline" className="elimunova-glass border-0 text-gray-700 hover:bg-white/20">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="elimunova-button">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-32 pb-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="elimunova-text-gradient-rainbow">Documentation</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Everything you need to know to get the most out of ElimuNova AI
          </p>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {sections.map((section, index) => (
              <Card key={section.title} className="elimunova-card-gradient group hover:scale-105 transition-all duration-300 border-0">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <section.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="elimunova-text-gradient-blue">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {section.articles.map((article, articleIndex) => (
                      <li key={articleIndex} className="flex items-center text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        {article}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full elimunova-glass border-0">
                    View Section
                  </Button>
                </CardContent>
              </Card>
            ))}
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
  )
}
