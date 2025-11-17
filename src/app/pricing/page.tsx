import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function PricingPage() {
  // Fetch active packages from DB (server component)
  const packages = await prisma.package.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" }
  })

  // Map DB packages to UI plans while preserving styling and structure
  const colors = [
    "from-blue-500 to-purple-600",
    "from-purple-500 to-pink-600",
    "from-pink-500 to-rose-600",
  ] as const

  const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)

  const plans = packages.map((pkg, index) => ({
    name: pkg.name,
    price: usd(pkg.price),
    period: "/month",
    description: pkg.description || "",
    features: Array.isArray(pkg.features) ? pkg.features.filter(feature => feature && feature.trim() !== "") : [],
    popular: false,
    color: colors[index % colors.length]
  }))

  // Mark the mid-tier (by price) as most popular if at least 3 plans exist
  if (plans.length >= 3) {
    plans[Math.floor(plans.length / 2)].popular = true
  }

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
            <Link href="/pricing" className="elimunova-text-gradient font-medium">
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
            <span className="elimunova-text-gradient-rainbow">Simple, Transparent</span>
            <br />
            <span className="elimunova-text-gradient">Pricing</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose the perfect plan for your educational needs. All plans include our core AI features.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={plan.name} className={`elimunova-card-gradient group hover:scale-105 transition-all duration-300 relative border-0 ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold elimunova-text-gradient-blue mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600 mb-4">{plan.description}</CardDescription>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold elimunova-text-gradient">{plan.price}</span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <div className={`w-5 h-5 bg-gradient-to-r ${plan.color} rounded-full flex items-center justify-center mr-3`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup">
                  <Button className={`w-full ${plan.popular ? 'elimunova-button' : 'elimunova-button-secondary'}`}>
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Comparison */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-white/50 to-blue-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="elimunova-text-gradient">Compare Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what's included in each plan
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Feature rows */}
              <div className="space-y-4">
                <div className="h-12 flex items-center font-semibold text-gray-900">Features</div>
                {plans.length > 0 && plans[0].features.map((feature, index) => (
                  <div key={index} className="h-12 flex items-center text-gray-700">{feature}</div>
                ))}
              </div>

              {plans.map((plan, index) => (
                <div key={plan.name} className="space-y-4 text-center">
                  <div className="h-12 flex items-center justify-center font-semibold elimunova-text-gradient-blue">{plan.name}</div>
                  {plans[0].features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="h-12 flex items-center justify-center">
                      {plan.features.includes(feature) ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
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
            Start your free trial today and experience the power of AI in education.
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
