'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, FileText, Plus, Calendar, Clock, BarChart3, DollarSign, GraduationCap, Users, Activity, Settings } from 'lucide-react'

interface School {
  id: string
  name: string
}

interface CreateReportModalProps {
  isOpen: boolean
  onClose: () => void
  onReportCreated: (report: any) => void
}

export default function CreateReportModal({
  isOpen,
  onClose,
  onReportCreated
}: CreateReportModalProps) {
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [schools, setSchools] = useState<School[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'ANALYTICS',
    content: '{}',
    filters: '',
    schoolId: 'all-schools',
    isPublic: false,
    scheduledAt: '',
    expiresAt: ''
  })
  const { toast } = useToast()

  // Fetch schools when modal opens
  const fetchSchools = async () => {
    setDataLoading(true)
    try {
      const response = await fetch('/api/schools?limit=100')
      if (response.ok) {
        const data = await response.json()
        setSchools(data.schools || [])
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch schools data",
        })
      }
    } catch (error) {
      console.error('Error fetching schools:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch schools data",
      })
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchSchools()
    }
  }, [isOpen])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateSampleContent = (type: string) => {
    const baseContent = {
      generatedAt: new Date().toISOString(),
      reportType: type,
      summary: {
        totalRecords: Math.floor(Math.random() * 1000) + 100,
        dateRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0]
        }
      }
    }

    switch (type) {
      case 'ANALYTICS':
        return {
          ...baseContent,
          metrics: {
            totalUsers: Math.floor(Math.random() * 500) + 50,
            activeUsers: Math.floor(Math.random() * 300) + 30,
            pageViews: Math.floor(Math.random() * 10000) + 1000,
            bounceRate: (Math.random() * 0.4 + 0.2).toFixed(2),
            avgSessionDuration: Math.floor(Math.random() * 300) + 60
          },
          charts: [
            { name: 'User Growth', value: Math.floor(Math.random() * 100) + 20 },
            { name: 'Page Views', value: Math.floor(Math.random() * 1000) + 500 },
            { name: 'Engagement', value: Math.floor(Math.random() * 100) + 30 }
          ]
        }
      case 'FINANCIAL':
        return {
          ...baseContent,
          financials: {
            totalRevenue: Math.floor(Math.random() * 50000) + 10000,
            monthlyRevenue: Math.floor(Math.random() * 5000) + 1000,
            expenses: Math.floor(Math.random() * 20000) + 5000,
            profit: Math.floor(Math.random() * 30000) + 5000,
            currency: 'KSH'
          },
          breakdown: [
            { category: 'Subscriptions', amount: Math.floor(Math.random() * 20000) + 5000 },
            { category: 'One-time Payments', amount: Math.floor(Math.random() * 10000) + 2000 },
            { category: 'Renewals', amount: Math.floor(Math.random() * 15000) + 3000 }
          ]
        }
      case 'ACADEMIC':
        return {
          ...baseContent,
          academic: {
            totalStudents: Math.floor(Math.random() * 500) + 100,
            totalTeachers: Math.floor(Math.random() * 50) + 10,
            totalClasses: Math.floor(Math.random() * 20) + 5,
            averageGrade: (Math.random() * 2 + 3).toFixed(1),
            completionRate: (Math.random() * 0.3 + 0.7).toFixed(2)
          },
          subjects: [
            { name: 'Mathematics', students: Math.floor(Math.random() * 100) + 20 },
            { name: 'English', students: Math.floor(Math.random() * 100) + 20 },
            { name: 'Science', students: Math.floor(Math.random() * 100) + 20 },
            { name: 'History', students: Math.floor(Math.random() * 100) + 20 }
          ]
        }
      case 'USER_ACTIVITY':
        return {
          ...baseContent,
          activity: {
            totalLogins: Math.floor(Math.random() * 1000) + 100,
            uniqueUsers: Math.floor(Math.random() * 200) + 50,
            peakHours: ['9:00 AM', '2:00 PM', '7:00 PM'],
            mostActiveDay: 'Monday',
            avgSessionTime: Math.floor(Math.random() * 60) + 15
          },
          topActions: [
            { action: 'Login', count: Math.floor(Math.random() * 500) + 100 },
            { action: 'View Dashboard', count: Math.floor(Math.random() * 300) + 50 },
            { action: 'Create Content', count: Math.floor(Math.random() * 100) + 20 },
            { action: 'Download Report', count: Math.floor(Math.random() * 50) + 10 }
          ]
        }
      case 'SYSTEM_HEALTH':
        return {
          ...baseContent,
          system: {
            uptime: (Math.random() * 0.1 + 0.95).toFixed(3),
            responseTime: Math.floor(Math.random() * 200) + 100,
            errorRate: (Math.random() * 0.02).toFixed(4),
            activeConnections: Math.floor(Math.random() * 100) + 10,
            memoryUsage: (Math.random() * 0.3 + 0.4).toFixed(2)
          },
          alerts: [
            { level: 'info', message: 'System running normally', timestamp: new Date().toISOString() },
            { level: 'warning', message: 'High memory usage detected', timestamp: new Date(Date.now() - 3600000).toISOString() }
          ]
        }
      default:
        return baseContent
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.type) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      })
      return
    }

    setLoading(true)
    try {
      // Generate sample content based on report type
      const sampleContent = generateSampleContent(formData.type)
      
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          content: JSON.stringify(sampleContent),
          schoolId: formData.schoolId && formData.schoolId !== 'all-schools' ? formData.schoolId : null,
          scheduledAt: formData.scheduledAt || null,
          expiresAt: formData.expiresAt || null
        }),
      })

      if (response.ok) {
        const reportData = await response.json()
        onReportCreated(reportData)
        setFormData({
          title: '',
          description: '',
          type: 'ANALYTICS',
          content: '{}',
          filters: '',
          schoolId: 'all-schools',
          isPublic: false,
          scheduledAt: '',
          expiresAt: ''
        })
        toast({
          title: "Success",
          description: "Report created successfully",
        })
      } else {
        const error = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: error.error || "Failed to create report",
        })
      }
    } catch (error) {
      console.error('Error creating report:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create report",
      })
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ANALYTICS': return BarChart3
      case 'FINANCIAL': return DollarSign
      case 'ACADEMIC': return GraduationCap
      case 'USER_ACTIVITY': return Users
      case 'SYSTEM_HEALTH': return Activity
      case 'CUSTOM': return Settings
      default: return FileText
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-blue-50 to-purple-50">
        <DialogHeader className="sticky top-0 bg-gradient-to-br from-white via-blue-50 to-purple-50 z-10 pb-4">
          <DialogTitle className="edugenius-text-gradient-blue flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Create New Report
          </DialogTitle>
          <DialogDescription>
            Create a new report with custom filters and settings. Fill in the required information below.
          </DialogDescription>
        </DialogHeader>

        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-500">Loading schools data...</span>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6 pb-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Report Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter report title"
                required
                className="edugenius-glass"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Report Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger className="edugenius-glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANALYTICS">
                    <div className="flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </div>
                  </SelectItem>
                  <SelectItem value="FINANCIAL">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Financial
                    </div>
                  </SelectItem>
                  <SelectItem value="ACADEMIC">
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Academic
                    </div>
                  </SelectItem>
                  <SelectItem value="USER_ACTIVITY">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      User Activity
                    </div>
                  </SelectItem>
                  <SelectItem value="SYSTEM_HEALTH">
                    <div className="flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      System Health
                    </div>
                  </SelectItem>
                  <SelectItem value="CUSTOM">
                    <div className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Custom
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter report description (optional)"
              className="edugenius-glass"
              rows={3}
            />
          </div>

          {/* School Selection */}
          <div className="space-y-2">
            <Label htmlFor="schoolId">School (Optional)</Label>
            <Select value={formData.schoolId} onValueChange={(value) => handleInputChange('schoolId', value)}>
              <SelectTrigger className="edugenius-glass">
                <SelectValue placeholder="Select school (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-schools">All Schools</SelectItem>
                {schools && schools.length > 0 ? (
                  schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-schools" disabled>
                    No schools available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <Label htmlFor="filters">Filters (JSON)</Label>
            <Textarea
              id="filters"
              value={formData.filters}
              onChange={(e) => handleInputChange('filters', e.target.value)}
              placeholder='Enter filters as JSON (e.g., {"dateRange": "30d", "status": "active"})'
              className="edugenius-glass"
              rows={3}
            />
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Scheduled At (Optional)</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                className="edugenius-glass"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires At (Optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                className="edugenius-glass"
              />
            </div>
          </div>

          {/* Public Access */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
            />
            <Label htmlFor="isPublic">Make this report public</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="edugenius-glass"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="edugenius-button"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Create Report
                </>
              )}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
