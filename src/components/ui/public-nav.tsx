'use client'

import { useState } from 'react'
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"

export function PublicNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <Logo size="md" />
        </Link>
        
        {/* Desktop Navigation */}
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
        
        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/auth/signin">
            <Button variant="outline" className="elimunova-glass border-0 text-gray-700 hover:bg-white/20">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="elimunova-button">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-700 hover:bg-white/20 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link 
              href="/#features" 
              className="text-gray-700 hover:elimunova-text-gradient transition-all duration-300 font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/pricing" 
              className="text-gray-700 hover:elimunova-text-gradient transition-all duration-300 font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              className="text-gray-700 hover:elimunova-text-gradient transition-all duration-300 font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <Link href="/auth/signin" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full elimunova-glass border-0 text-gray-700 hover:bg-white/20">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full elimunova-button">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
