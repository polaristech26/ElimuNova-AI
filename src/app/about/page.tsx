import { PublicNav } from "@/components/ui/public-nav"
import { Logo } from "@/components/ui/logo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Users, Target, Heart, Award } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  const team = [
    {
      name: "Dr. Mary Mwangi",
      role: "CEO & Co-Founder",
      description: "Engineering and technology instructor.",
      image: "/team/mary-mwangi.jpg"
    },
    {
      name: "Joseph Mwaura",
      role: "CTO & Co-Founder",
      description: "AI engineer with expertise in educational technology",
      image: "/team/joseph-mwaura.jpg"
    },
    {
      name: "Ezekiel Manyara",
      role: "Shool Director",
      description: "Technology specialist and school administrator",
      image: "/team/ezekiel-manyara.jpg"
    }
  ]

  const values = [
    {
      icon: Brain,
      title: "Innovation",
      description: "We continuously push the boundaries of what's possible in educational technology."
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "We believe in the power of teachers, students, and technology working together."
    },
    {
      icon: Target,
      title: "Excellence",
      description: "We strive for the highest quality in everything we create and deliver."
    },
    {
      icon: Heart,
      title: "Empathy",
      description: "We understand the challenges educators face and design solutions with care."
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
      <PublicNav />

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-32 pb-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="elimunova-text-gradient-rainbow">About ElimuNova AI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We're on a mission to transform education through the power of artificial intelligence, 
            making quality education accessible to everyone, everywhere.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="elimunova-text-gradient">Our Mission</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                At ElimuNova AI, we believe that every teacher deserves powerful tools to create 
                engaging, personalized learning experiences. Our AI-powered platform empowers 
                educators to focus on what they do best - inspiring and guiding students.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                We're building the future of education, where artificial intelligence works 
                alongside human creativity to unlock the full potential of every learner.
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Trusted by 10,000+ Educators</h3>
                  <p className="text-gray-600">Across 50+ countries worldwide</p>
                </div>
              </div>
            </div>
            <div className="elimunova-card-gradient p-8 border-0">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold elimunova-text-gradient-blue mb-2">50K+</div>
                  <div className="text-gray-600">Students Impacted</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold elimunova-text-gradient-blue mb-2">1M+</div>
                  <div className="text-gray-600">Lesson Plans Created</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold elimunova-text-gradient-blue mb-2">95%</div>
                  <div className="text-gray-600">Teacher Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold elimunova-text-gradient-blue mb-2">24/7</div>
                  <div className="text-gray-600">AI Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-white/50 to-blue-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="elimunova-text-gradient">Our Values</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={value.title} className="elimunova-card-gradient group hover:scale-105 transition-all duration-300 border-0">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="elimunova-text-gradient-blue">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="elimunova-text-gradient">Meet Our Team</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The passionate people behind ElimuNova AI
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={member.name} className="elimunova-card-gradient group hover:scale-105 transition-all duration-300 border-0">
                <CardHeader className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 relative overflow-hidden rounded-full shadow-lg">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <CardTitle className="elimunova-text-gradient-blue">{member.name}</CardTitle>
                  <CardDescription className="font-medium text-gray-700">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {member.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-white/50 to-blue-50/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              <span className="elimunova-text-gradient">Our Story</span>
            </h2>
            <div className="space-y-6 text-lg text-gray-600">
              <p>
                ElimuNova AI was born from a simple observation: teachers were spending countless hours 
                on administrative tasks instead of focusing on what they love most - teaching and inspiring students.
              </p>
              <p>
              Our founders, Dr. Mary Mwangi and Joseph Mwaura, first connected at an education technology conference where they discovered a shared commitment to transforming learning through AI. With years of experience in academia, Dr. Mary Mwangi understood the daily challenges educators face. Joseph, an innovative leader in technology, recognized AI’s potential to deliver sustainable, data-driven solutions to those challenges.
              </p>
              <p>
              Today, we proudly serve thousands of educators worldwide, equipping them with tools to deliver engaging, personalized, and impactful learning experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 elimunova-gradient-rainbow">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join Our Mission
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Be part of the educational revolution. Start your journey with ElimuNova AI today.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="elimunova-button-secondary text-lg px-8 py-4">
              Get Started Free
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
