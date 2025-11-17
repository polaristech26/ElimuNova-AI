import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Lock, Database } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
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
            <span className="elimunova-text-gradient-rainbow">Privacy Policy</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="elimunova-card-gradient border-0">
              <CardHeader>
                <CardTitle className="elimunova-text-gradient-blue">Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  We collect information you provide directly to us, such as when you create an account, 
                  use our services, or contact us for support.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Account information (name, email, school details)</li>
                  <li>Educational content (lesson plans, assignments, student work)</li>
                  <li>Usage data (how you interact with our platform)</li>
                  <li>Communication data (support requests, feedback)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="elimunova-card-gradient border-0">
              <CardHeader>
                <CardTitle className="elimunova-text-gradient-blue">How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  We use the information we collect to provide, maintain, and improve our services:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Provide and personalize our AI-powered educational tools</li>
                  <li>Generate lesson plans, schemes of work, and assignments</li>
                  <li>Track student progress and provide analytics</li>
                  <li>Communicate with you about our services</li>
                  <li>Ensure platform security and prevent fraud</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="elimunova-card-gradient border-0">
              <CardHeader>
                <CardTitle className="elimunova-text-gradient-blue">Data Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  We implement appropriate technical and organizational measures to protect your data:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Encryption</h3>
                    <p className="text-sm text-gray-600">End-to-end encryption for all data</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Access Control</h3>
                    <p className="text-sm text-gray-600">Role-based access permissions</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Database className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Secure Storage</h3>
                    <p className="text-sm text-gray-600">Enterprise-grade data centers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="elimunova-card-gradient border-0">
              <CardHeader>
                <CardTitle className="elimunova-text-gradient-blue">Your Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Access and download your data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request data portability</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="elimunova-card-gradient border-0">
              <CardHeader>
                <CardTitle className="elimunova-text-gradient-blue">Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <div className="space-y-2 text-gray-600">
                  <p>Email: info@infinititechsolutions.org</p>
                  <p>Address: Nakuru, Kenya</p>
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
  )
}
