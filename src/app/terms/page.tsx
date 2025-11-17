import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Scale, Shield, Users } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
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
            <span className="elimunova-text-gradient-rainbow">Terms of Service</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Please read these terms carefully before using our services.
          </p>
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="elimunova-card-gradient border-0">
              <CardHeader>
                <CardTitle className="elimunova-text-gradient-blue">Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  By accessing and using ElimuNova AI, you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, 
                  please do not use this service.
                </p>
              </CardContent>
            </Card>

            <Card className="elimunova-card-gradient border-0">
              <CardHeader>
                <CardTitle className="elimunova-text-gradient-blue">Use License</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Permission is granted to temporarily use ElimuNova AI for personal, non-commercial 
                  transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on the website</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="elimunova-card-gradient border-0">
              <CardHeader>
                <CardTitle className="elimunova-text-gradient-blue">User Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  As a user of ElimuNova AI, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Provide accurate and complete information when creating your account</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Use the service in compliance with applicable laws and regulations</li>
                  <li>Respect the intellectual property rights of others</li>
                  <li>Not use the service for any unlawful or prohibited activities</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="elimunova-card-gradient border-0">
              <CardHeader>
                <CardTitle className="elimunova-text-gradient-blue">AI-Generated Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Our AI-generated content is provided as a starting point and should be reviewed and 
                  customized by qualified educators. You acknowledge that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>AI-generated content may not be perfect or complete</li>
                  <li>You are responsible for reviewing and validating all content</li>
                  <li>Content should be adapted to meet specific educational requirements</li>
                  <li>We are not liable for the use or misuse of AI-generated content</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="elimunova-card-gradient border-0">
              <CardHeader>
                <CardTitle className="elimunova-text-gradient-blue">Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  In no event shall ElimuNova AI or its suppliers be liable for any damages 
                  (including, without limitation, damages for loss of data or profit, or due to 
                  business interruption) arising out of the use or inability to use the materials 
                  on ElimuNova AI, even if ElimuNova AI or an authorized representative has been 
                  notified orally or in writing of the possibility of such damage.
                </p>
              </CardContent>
            </Card>

            <Card className="elimunova-card-gradient border-0">
              <CardHeader>
                <CardTitle className="elimunova-text-gradient-blue">Termination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We may terminate or suspend your account and access to the service immediately, 
                  without prior notice or liability, for any reason whatsoever, including without 
                  limitation if you breach the Terms. Upon termination, your right to use the 
                  service will cease immediately.
                </p>
              </CardContent>
            </Card>

            <Card className="elimunova-card-gradient border-0">
              <CardHeader>
                <CardTitle className="elimunova-text-gradient-blue">Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We reserve the right, at our sole discretion, to modify or replace these Terms 
                  at any time. If a revision is material, we will try to provide at least 30 days 
                  notice prior to any new terms taking effect.
                </p>
              </CardContent>
            </Card>

            <Card className="elimunova-card-gradient border-0">
              <CardHeader>
                <CardTitle className="elimunova-text-gradient-blue">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
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
