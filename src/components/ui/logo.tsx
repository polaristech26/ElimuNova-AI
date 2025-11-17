import React from 'react'
import { Brain, Cpu, Zap, Sparkles } from 'lucide-react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  }

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* AI Logo Icon with Animated Gradient Background */}
      <div className={`${sizeClasses[size]} relative`}>
        {/* Outer Glow Ring */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full p-1 animate-pulse">
          {/* Inner Ring with Rotation */}
          <div className="w-full h-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full p-1" style={{animation: 'ai-rotation-slow 8s linear infinite'}}>
            {/* Main Container */}
            <div className="w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-full flex items-center justify-center relative overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1 left-1 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{animationDelay: '0s'}}></div>
                <div className="absolute top-2 right-2 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute bottom-2 left-2 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-1 right-1 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
              </div>
              
              {/* Central AI Brain Icon */}
              <div className="relative z-10">
                <Brain 
                  size={iconSizes[size]} 
                  className="text-white drop-shadow-lg"
                  style={{animation: 'ai-brain-pulse 2s ease-in-out infinite'}}
                />
              </div>
              
              {/* Floating AI Elements */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
                  <Cpu size={iconSizes[size] * 0.3} className="text-cyan-400 animate-bounce" style={{animationDelay: '0s', animationDuration: '2s'}} />
                </div>
                <div className="absolute bottom-0 right-0 transform translate-x-1 translate-y-1">
                  <Zap size={iconSizes[size] * 0.25} className="text-yellow-400 animate-bounce" style={{animationDelay: '1s', animationDuration: '2s'}} />
                </div>
                <div className="absolute top-1/2 left-0 transform -translate-x-1 -translate-y-1/2">
                  <Sparkles size={iconSizes[size] * 0.2} className="text-pink-400 animate-bounce" style={{animationDelay: '0.5s', animationDuration: '2s'}} />
                </div>
              </div>
              
              {/* Neural Network Lines */}
              <div className="absolute inset-0 opacity-30">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M20,20 Q50,10 80,20 Q50,30 20,20"
                    stroke="url(#neuralGradient)"
                    strokeWidth="0.5"
                    fill="none"
                    strokeDasharray="5,5"
                    style={{animation: 'ai-neural-flow 3s linear infinite'}}
                  />
                  <path
                    d="M20,80 Q50,90 80,80 Q50,70 20,80"
                    stroke="url(#neuralGradient)"
                    strokeWidth="0.5"
                    fill="none"
                    strokeDasharray="5,5"
                    style={{animation: 'ai-neural-flow 3s linear infinite', animationDelay: '1s'}}
                  />
                  <circle cx="50" cy="50" r="2" fill="url(#neuralGradient)" className="animate-ping" style={{animationDuration: '2s'}} />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Outer Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full blur-sm opacity-50 animate-pulse" style={{animationDuration: '4s'}}></div>
      </div>
      
      {/* Logo Text with Gradient */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${textSizeClasses[size]} bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-wide animate-pulse`} style={{animationDuration: '3s'}}>
            ELIMUNOVA
          </span>
          <span className={`text-sm font-medium bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent -mt-1 animate-pulse`} style={{animationDuration: '2s'}}>
            AI
          </span>
        </div>
      )}
    </div>
  )
}
