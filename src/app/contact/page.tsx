"use client"

import { PublicNav } from "@/components/ui/public-nav"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Calendar } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
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
            <span className="elimunova-text-gradient-rainbow">Contact Us</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="elimunova-card-gradient border-0">
              <CardHeader>
                <CardTitle className="elimunova-text-gradient-blue">Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter your first name"
                        className="elimunova-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter your last name"
                        className="elimunova-input"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="elimunova-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <Input
                      type="text"
                      placeholder="What's this about?"
                      className="elimunova-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Tell us how we can help you..."
                      className="w-full elimunova-input resize-none"
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="elimunova-button w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="elimunova-card-gradient border-0">
                <CardHeader>
                  <CardTitle className="elimunova-text-gradient-blue">Get in Touch</CardTitle>
                  <CardDescription>
                    We're here to help and answer any question you might have
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-blue-50/50 transition-colors duration-300 group cursor-pointer">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email Address</h3>
                      <a 
                        href="mailto:info@infinititechsolutions.org" 
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-300 font-medium"
                      >
                        info@infinititechsolutions.org
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-purple-50/50 transition-colors duration-300 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Phone / WhatsApp</h3>
                      <div className="flex flex-col gap-1">
                        <a 
                          href="tel:+254791269918" 
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-300 font-medium"
                        >
                          +254 791 269 918
                        </a>
                        <button
                          onClick={() => window.open('https://wa.me/254791269918?text=Hello! I need help with ElimuNova AI platform.', '_blank')}
                          className="text-green-600 hover:text-green-800 transition-colors duration-300 text-sm text-left font-medium hover:underline"
                        >
                          💬 Chat on WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-pink-50/50 transition-colors duration-300 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Office Address</h3>
                      <p className="text-gray-600 font-medium">Nakuru, Kenya</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-rose-50/50 transition-colors duration-300 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Business Hours</h3>
                      <div className="text-gray-600 text-sm space-y-1">
                        <p className="font-medium">Mon - Fri: 8:00 AM - 6:00 PM EAT</p>
                        <p className="font-medium">Sat: 9:00 AM - 4:00 PM EAT</p>
                        <p className="font-medium">Sun: Closed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="elimunova-card-gradient border-0">
                <CardHeader>
                  <CardTitle className="elimunova-text-gradient-blue">Quick Support</CardTitle>
                  <CardDescription>
                    Need immediate help? Try these options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/help">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-12 px-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-0 transition-all duration-300 group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                        <Mail className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Browse Help Center</div>
                        <div className="text-xs text-gray-600">Find answers to common questions</div>
                      </div>
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start h-12 px-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-0 transition-all duration-300 group"
                    onClick={() => window.open('https://wa.me/254791269918?text=Hello! I need help with ElimuNova AI platform.', '_blank')}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Start Live Chat</div>
                      <div className="text-xs text-gray-600">Get instant help via WhatsApp</div>
                    </div>
                  </Button>
                  <Link href="/demo">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-12 px-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-0 transition-all duration-300 group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Schedule a Demo</div>
                        <div className="text-xs text-gray-600">Book a personalized walkthrough</div>
                      </div>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
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
