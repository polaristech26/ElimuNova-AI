"use client"

import React, { useState, useEffect } from 'react'
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  Clock,
  Search
} from "lucide-react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { NotificationsModal } from "@/components/modals/notifications-modal"
import { SettingsModal } from "@/components/modals/settings-modal"
import { UserProfileModal } from "@/components/modals/user-profile-modal"
import { SearchResultsModal } from "@/components/modals/search-results-modal"
import { Toaster } from "@/components/ui/toaster"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT'
  userName: string
  userEmail: string
  schoolName?: string
  sidebarItems: Array<{
    icon: React.ComponentType<any>
    label: string
    href: string
    badge?: number
  }>
}

export function ProfessionalDashboardLayout({ 
  children, 
  userRole, 
  userName, 
  userEmail, 
  schoolName,
  sidebarItems 
}: DashboardLayoutProps) {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [userProfile, setUserProfile] = useState<{
    firstName: string
    lastName: string
    avatar?: string
  }>({
    firstName: userName,
    lastName: '',
    avatar: undefined
  })

  useEffect(() => {
    setIsClient(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fetch user profile function
  const fetchUserProfile = async () => {
    if (!session?.user?.id) return
    
    try {
      const response = await fetch(`/api/user-profile?userId=${session.user.id}`)
      if (response.ok) {
        const profile = await response.json()
        setUserProfile({
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatar: profile.avatar
        })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProfile()
    }
  }, [session?.user?.id])

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      if (!session?.user?.id) return
      
      try {
        const response = await fetch(`/api/notifications?userId=${session.user.id}&limit=100`)
        if (response.ok) {
          const notifications = await response.json()
          const unread = notifications.filter((n: any) => !n.isRead).length
          setUnreadNotifications(unread)
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }

    if (session?.user?.id) {
      fetchUnreadNotifications()
    }
  }, [session?.user?.id])

  const fetchUnreadNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${session?.user?.id}&limit=100`)
      if (response.ok) {
        const notifications = await response.json()
        const unread = notifications.filter((n: any) => !n.isRead).length
        setUnreadNotifications(unread)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchOpen(true)
    }
  }

  const handleSearchInputClick = () => {
    if (searchQuery.trim()) {
      setSearchOpen(true)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Administrator'
      case 'SCHOOL_ADMIN': return 'School Administrator'
      case 'TEACHER': return 'Teacher'
      case 'STUDENT': return 'Student'
      default: return role
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-white via-blue-50 to-purple-50 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            <Link href="/" className="hidden sm:block">
              <Logo size="sm" />
            </Link>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search schools, users, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={handleSearchInputClick}
                className="w-full pl-10 pr-4 py-2 bg-white/70 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white/90 transition-all duration-300 shadow-sm cursor-pointer"
              />
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={() => setNotificationsOpen(true)}
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Button>

            {/* Settings */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile.firstName} {userProfile.lastName}
                </p>
                <p className="text-xs text-gray-500">{getRoleDisplayName(userRole)}</p>
              </div>
              <button
                onClick={() => setProfileOpen(true)}
                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:from-blue-600 hover:to-purple-700 transition-all duration-300 overflow-hidden"
              >
                {userProfile.avatar ? (
                  <img 
                    src={userProfile.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed top-16 left-0 bottom-0 w-64 bg-gradient-to-b from-white via-blue-50 to-purple-50 shadow-xl backdrop-blur-md transform transition-transform duration-300 ease-in-out z-40 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="h-full flex flex-col">
          {/* Welcome Bar */}
          <div className="p-4 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 shadow-sm border-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                {userProfile.avatar ? (
                  <img 
                    src={userProfile.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Welcome, {userProfile.firstName} {userProfile.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {schoolName || getRoleDisplayName(userRole)}
                </p>
              </div>
            </div>
            
            {/* Real-time Clock */}
            <div className="mt-3 p-3 bg-gradient-to-r from-white/80 to-blue-50/80 backdrop-blur-sm rounded-lg shadow-sm border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-mono text-gray-700">
                    {isClient ? formatTime(currentTime) : '--:--:-- --'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {isClient ? formatDate(currentTime) : 'Loading...'}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {sidebarItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-gray-900 transition-all duration-300 shadow-sm hover:shadow-md border-0"
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 shadow-sm">
            <div className="text-xs text-gray-500 text-center">
              ElimuNova AI v1.0
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16">
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Modals */}
      {session?.user?.id && (
        <>
          <NotificationsModal
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            userId={session.user.id}
          />
          <SettingsModal
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            userId={session.user.id}
            userName={`${userProfile.firstName} ${userProfile.lastName}`}
            userEmail={userEmail}
          />
          <UserProfileModal
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
            userId={session.user.id}
            onProfileUpdate={(profile) => {
              // Update the user profile state to reflect changes in the header
              setUserProfile({
                firstName: profile.firstName,
                lastName: profile.lastName,
                avatar: profile.avatar
              })
              console.log('Profile updated in header:', profile)
              
              // Force a re-fetch to ensure data consistency
              setTimeout(() => {
                fetchUserProfile()
              }, 500)
            }}
          />
          <SearchResultsModal
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
            initialQuery={searchQuery}
          />
          <Toaster />
        </>
      )}
    </div>
  )
}
