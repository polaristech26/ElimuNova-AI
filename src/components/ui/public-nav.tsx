'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"

export function PublicNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/#features') return pathname === '/' && typeof window !== 'undefined' && window.location.hash === '#features'
    return pathname === path
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <Logo size="md" />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/#features" 
            className={`font-medium transition-all duration-300 ${
              isActive('/#features') 
                ? 'elimunova-text-gradient scale-105' 
                : 'text-gray-700 hover:elimunova-text-gradient hover:scale-105'
            }`}
          >
            Features
          </Link>
          <Link 
            href="/pricing" 
            className={`font-medium transition-all duration-300 ${
              isActive('/pricing') 
                ? 'elimunova-text-gradient scale-105' 
                : 'text-gray-700 hover:elimunova-text-gradient hover:scale-105'
            }`}
          >
            Pricing
          </Link>
          <Link 
            href="/about" 
            className={`font-medium transition-all duration-300 ${
              isActive('/about') 
                ? 'elimunova-text-gradient scale-105' 
                : 'text-gray-700 hover:elimunova-text-gradient hover:scale-105'
            }`}
          >
            About
          </Link>
        </nav>
        
        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/auth/signin">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
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
        <div className="md:hidden bg-white/95 backdrop-blur-md">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link 
              href="/#features" 
              className={`font-medium py-2 transition-all duration-300 ${
                isActive('/#features') 
                  ? 'elimunova-text-gradient scale-105' 
                  : 'text-gray-700 hover:elimunova-text-gradient active:scale-95'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/pricing" 
              className={`font-medium py-2 transition-all duration-300 ${
                isActive('/pricing') 
                  ? 'elimunova-text-gradient scale-105' 
                  : 'text-gray-700 hover:elimunova-text-gradient active:scale-95'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              className={`font-medium py-2 transition-all duration-300 ${
                isActive('/about') 
                  ? 'elimunova-text-gradient scale-105' 
                  : 'text-gray-700 hover:elimunova-text-gradient active:scale-95'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="pt-4 space-y-3">
              <Link href="/auth/signin" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all duration-300 transform active:scale-95 shadow-md">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full elimunova-button active:scale-95">
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
