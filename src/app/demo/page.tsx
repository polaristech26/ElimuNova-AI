import { PublicNav } from "@/components/ui/public-nav"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, BookOpen, Users, Brain, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  const demoSteps = [
    {
      step: "01",
      title: "Sign Up & Setup",
      description: "Create your account and set up your school profile in minutes",
      icon: Users,
      color: "from-blue-500 to-purple-600"
    },
    {
      step: "02", 
      title: "Generate Lesson Plans",
      description: "Use AI to create comprehensive, curriculum-aligned lesson plans",
      icon: BookOpen,
      color: "from-purple-500 to-pink-600"
    },
    {
      step: "03",
      title: "Create Schemes of Work",
      description: "Build detailed schemes of work for entire terms and subjects",
      icon: Brain,
      color: "from-pink-500 to-rose-600"
    },
    {
      step: "04",
      title: "Engage with Hope AI",
      description: "Get instant help and support from your AI teaching assistant",
      icon: Zap,
      color: "from-rose-500 to-red-600"
    }
  ]

  const features = [
    {
      title: "AI Lesson Plan Generator",
      description: "Watch how our AI creates detailed, engaging lesson plans in seconds",
      video: "/videos/lesson-plan-demo.mp4",
      poster: "/videos/lesson-plan-poster.jpg",
      hasVideo: true
    },
    {
      title: "Student Management",
      description: "See how easy it is to track student progress and manage assignments",
      video: "/videos/student-management-demo.mp4",
      poster: "/videos/student-management-poster.jpg",
      hasVideo: true
    },
    {
      title: "Hope AI Assistant",
      description: "Experience real-time AI assistance for all your teaching needs",
      video: "/videos/hope-ai-demo.mp4",
      poster: "/videos/hope-ai-poster.jpg",
      hasVideo: true
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
      <section className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="elimunova-text-gradient-rainbow">See ElimuNova AI</span>
            <br />
            <span className="elimunova-text-gradient">In Action</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Watch how our AI-powered platform transforms the way you create lesson plans, 
            manage students, and enhance your teaching experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="elimunova-button text-lg px-8 py-4">
              <Play className="mr-2 h-5 w-5" />
              Watch Full Demo
            </Button>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="elimunova-glass border-white/30 text-lg px-8 py-4 hover:bg-white/20">
                Try Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Steps */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="elimunova-text-gradient">How It Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started with ElimuNova AI in just 4 simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {demoSteps.map((step, index) => (
              <Card key={step.step} className="elimunova-card-gradient group hover:scale-105 transition-all duration-300 border-0">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-sm font-bold text-gray-500 mb-2">STEP {step.step}</div>
                  <CardTitle className="elimunova-text-gradient-blue">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-white/50 to-blue-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="elimunova-text-gradient">Interactive Demo</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience our key features with interactive demonstrations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={feature.title} className="elimunova-card-gradient group hover:scale-105 transition-all duration-300 border-0">
                <CardHeader>
                  <div className="relative">
                    {feature.hasVideo ? (
                      <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
                        <video 
                          className="w-full h-full object-cover"
                          controls
                          poster={feature.poster}
                        >
                          <source src={feature.video} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-4">
                        <div className="text-center">
                          <Play className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Demo Video</p>
                        </div>
                      </div>
                    )}
                    {!feature.hasVideo && (
                      <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button className="elimunova-button">
                          <Play className="mr-2 h-4 w-4" />
                          Play Demo
                        </Button>
                      </div>
                    )}
                  </div>
                  <CardTitle className="elimunova-text-gradient-blue">{feature.title}</CardTitle>
                  <CardDescription>
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Request */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="elimunova-card-gradient border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold elimunova-text-gradient-blue mb-4">
                  Want a Personal Demo?
                </CardTitle>
                <CardDescription className="text-lg">
                  Schedule a one-on-one demo with our education specialists to see how 
                  ElimuNova AI can transform your teaching experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Personalized</h3>
                    <p className="text-sm text-gray-600">Tailored to your specific needs</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Expert Guidance</h3>
                    <p className="text-sm text-gray-600">Learn from education specialists</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Quick Setup</h3>
                    <p className="text-sm text-gray-600">Get started in 30 minutes</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button size="lg" className="elimunova-button text-lg px-8 py-4">
                      Schedule Demo
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="lg" variant="outline" className="elimunova-glass border-white/30 text-lg px-8 py-4 hover:bg-white/20">
                      Start Free Trial
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 elimunova-gradient-rainbow">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Teaching?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of educators who are already using AI to enhance their teaching.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="elimunova-button-secondary text-lg px-8 py-4">
              Start Free Trial
            </Button>
          </Link>
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
                <li><Link href="/demo" className="hover:elimunova-text-gradient transition-all duration-300">Demo</Link></li>
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
