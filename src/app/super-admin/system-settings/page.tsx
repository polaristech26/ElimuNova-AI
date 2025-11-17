'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { 
  Search, 
  Filter, 
  Plus, 
  Settings, 
  Eye, 
  Edit, 
  Trash2, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Lock,
  Globe,
  Shield,
  Bell,
  Database,
  BarChart3
} from 'lucide-react'
import CreateSystemSettingModal from '@/components/modals/create-system-setting-modal'
import SystemSettingDetailsModal from '@/components/modals/system-setting-details-modal'

interface SystemSetting {
  id: string
  key: string
  value: string
  type: string
  category: string
  description?: string
  isPublic: boolean
  isEditable: boolean
  updatedBy: string
  createdAt: string
  updatedAt: string
  updatedByUser: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all-categories')
  const [typeFilter, setTypeFilter] = useState('all-types')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedSetting, setSelectedSetting] = useState<SystemSetting | null>(null)
  const { toast } = useToast()

  const fetchSettings = async (page = 1, search = '', category = '', type = '', sort = 'createdAt', order = 'desc') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(category && category !== 'all-categories' && { category }),
        ...(type && type !== 'all-types' && { type }),
        sortBy: sort,
        sortOrder: order
      })

      const response = await fetch(`/api/system-settings?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
        setPagination(data.pagination)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch system settings",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast({
        title: "Error",
        description: "Failed to fetch system settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings(currentPage, searchTerm, categoryFilter, typeFilter, sortBy, sortOrder)
  }, [currentPage, searchTerm, categoryFilter, typeFilter, sortBy, sortOrder])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }

  const handleSettingCreated = (newSetting: SystemSetting) => {
    setSettings(prev => [newSetting, ...prev])
    toast({
      title: "Success",
      description: "System setting created successfully",
    })
  }

  const handleSettingUpdated = (updatedSetting: SystemSetting) => {
    setSettings(prev => prev.map(setting => 
      setting.id === updatedSetting.id ? updatedSetting : setting
    ))
    toast({
      title: "Success",
      description: "System setting updated successfully",
    })
  }

  const handleSettingDeleted = (settingId: string) => {
    setSettings(prev => prev.filter(setting => setting.id !== settingId))
    toast({
      title: "Success",
      description: "System setting deleted successfully",
    })
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return Settings
      case 'security': return Shield
      case 'notifications': return Bell
      case 'system': return Database
      case 'analytics': return BarChart3
      default: return Settings
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-blue-100 text-blue-800'
      case 'security': return 'bg-red-100 text-red-800'
      case 'notifications': return 'bg-yellow-100 text-yellow-800'
      case 'system': return 'bg-purple-100 text-purple-800'
      case 'analytics': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'string': return 'bg-blue-100 text-blue-800'
      case 'number': return 'bg-green-100 text-green-800'
      case 'boolean': return 'bg-yellow-100 text-yellow-800'
      case 'json': return 'bg-purple-100 text-purple-800'
      case 'array': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatValue = (value: string, type: string) => {
    if (type === 'boolean') {
      return value === 'true' ? 'Yes' : 'No'
    }
    if (type === 'number') {
      return Number(value).toLocaleString()
    }
    if (type === 'array' || type === 'json') {
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed.join(', ') : JSON.stringify(parsed)
      } catch {
        return value
      }
    }
    return value.length > 50 ? `${value.substring(0, 50)}...` : value
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="edugenius-text-gradient">System Settings</span>
          </h1>
          <p className="text-gray-600">Manage system configuration and preferences</p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="edugenius-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Setting
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="edugenius-card-gradient">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search settings..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 edugenius-glass"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 edugenius-glass">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="notifications">Notifications</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 edugenius-glass">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">All Types</SelectItem>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="array">Array</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid gap-6">
          {settings.map((setting) => {
            const CategoryIcon = getCategoryIcon(setting.category)
            return (
              <Card key={setting.id} className="edugenius-card-gradient hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <CategoryIcon className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{setting.key}</h3>
                        <Badge className={getCategoryColor(setting.category)}>
                          {setting.category}
                        </Badge>
                        <Badge className={getTypeColor(setting.type)}>
                          {setting.type}
                        </Badge>
                        {!setting.isEditable && (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            <Lock className="w-3 h-3 mr-1" />
                            Read Only
                          </Badge>
                        )}
                        {setting.isPublic && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <Globe className="w-3 h-3 mr-1" />
                            Public
                          </Badge>
                        )}
                      </div>
                      
                      {setting.description && (
                        <p className="text-gray-600 mb-3">{setting.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="font-medium">Value:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {formatValue(setting.value, setting.type)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                        <span>Updated by {setting.updatedByUser.firstName} {setting.updatedByUser.lastName}</span>
                        <span>•</span>
                        <span>{new Date(setting.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSetting(setting)
                          setDetailsModalOpen(true)
                        }}
                        className="edugenius-glass"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {setting.isEditable && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSetting(setting)
                            setDetailsModalOpen(true)
                          }}
                          className="edugenius-glass"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Card className="edugenius-card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} settings
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="edugenius-glass"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium px-3">
                  {currentPage} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                  disabled={currentPage === pagination.pages}
                  className="edugenius-glass"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <CreateSystemSettingModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSettingCreated={handleSettingCreated}
      />

      <SystemSettingDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false)
          setSelectedSetting(null)
        }}
        setting={selectedSetting}
        onSettingUpdated={handleSettingUpdated}
        onSettingDeleted={handleSettingDeleted}
      />
    </div>
  )
}
