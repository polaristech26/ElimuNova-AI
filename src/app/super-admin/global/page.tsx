'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
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
  BarChart3,
  Save,
  X
} from 'lucide-react'

interface GlobalSetting {
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

export default function GlobalSettingsPage() {
  const [settings, setSettings] = useState<GlobalSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all-categories')
  const [typeFilter, setTypeFilter] = useState('all-types')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedSetting, setSelectedSetting] = useState<GlobalSetting | null>(null)
  const [editingSetting, setEditingSetting] = useState<Partial<GlobalSetting>>({})
  const { toast } = useToast()

  const categories = [
    'general', 'security', 'email', 'notifications', 'ui', 'api', 
    'database', 'cache', 'logging', 'maintenance', 'features'
  ]

  const types = ['string', 'number', 'boolean', 'json', 'array', 'object']

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
          description: "Failed to fetch global settings",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast({
        title: "Error",
        description: "Failed to fetch global settings",
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

  const handleFilter = (category: string, type: string) => {
    setCategoryFilter(category)
    setTypeFilter(type)
    setCurrentPage(1)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleCreate = async (settingData: Partial<GlobalSetting>) => {
    try {
      const response = await fetch('/api/system-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Global setting created successfully"
        })
        setCreateModalOpen(false)
        fetchSettings()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create setting",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create setting",
        variant: "destructive"
      })
    }
  }

  const handleUpdate = async (id: string, settingData: Partial<GlobalSetting>) => {
    try {
      const response = await fetch(`/api/system-settings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Global setting updated successfully"
        })
        setEditModalOpen(false)
        setEditingSetting({})
        fetchSettings()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update setting",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this setting?')) return

    try {
      const response = await fetch(`/api/system-settings/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Global setting deleted successfully"
        })
        fetchSettings()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete setting",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete setting",
        variant: "destructive"
      })
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return Shield
      case 'email': return Bell
      case 'notifications': return Bell
      case 'database': return Database
      case 'ui': return Settings
      case 'api': return Globe
      case 'general': return Settings
      default: return Settings
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'security': return 'bg-red-100 text-red-800'
      case 'email': return 'bg-blue-100 text-blue-800'
      case 'notifications': return 'bg-yellow-100 text-yellow-800'
      case 'database': return 'bg-purple-100 text-purple-800'
      case 'ui': return 'bg-green-100 text-green-800'
      case 'api': return 'bg-indigo-100 text-indigo-800'
      case 'general': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'string': return 'bg-blue-100 text-blue-800'
      case 'number': return 'bg-green-100 text-green-800'
      case 'boolean': return 'bg-yellow-100 text-yellow-800'
      case 'json': return 'bg-purple-100 text-purple-800'
      case 'array': return 'bg-pink-100 text-pink-800'
      case 'object': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatValue = (value: string, type: string) => {
    try {
      if (type === 'json' || type === 'array' || type === 'object') {
        return JSON.stringify(JSON.parse(value), null, 2)
      }
      return value
    } catch {
      return value
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Global Settings</h1>
          <p className="text-gray-600">Manage system-wide configuration settings</p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Setting
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search settings..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select value={categoryFilter} onValueChange={(value) => handleFilter(value, typeFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <Select value={typeFilter} onValueChange={(value) => handleFilter(categoryFilter, value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">All Types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => fetchSettings()}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
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
              <Card key={setting.id} className="hover:shadow-lg transition-shadow">
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
                        <p className="text-gray-600 mb-3">
                          {setting.description}
                        </p>
                      )}

                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700 font-mono">
                          {formatValue(setting.value, setting.type)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          Updated by {setting.updatedByUser.firstName} {setting.updatedByUser.lastName}
                        </span>
                        <span>
                          {new Date(setting.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSetting(setting)
                          setViewModalOpen(true)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {setting.isEditable && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSetting(setting)
                            setEditModalOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {setting.isEditable && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(setting.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} settings
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <CreateSettingModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreate}
          categories={categories}
          types={types}
        />
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <EditSettingModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setEditingSetting({})
          }}
          onSubmit={(data) => handleUpdate(editingSetting.id!, data)}
          setting={editingSetting}
          categories={categories}
          types={types}
        />
      )}

      {/* View Modal */}
      {viewModalOpen && selectedSetting && (
        <ViewSettingModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          setting={selectedSetting}
        />
      )}
    </div>
  )
}

// Create Setting Modal Component
function CreateSettingModal({ isOpen, onClose, onSubmit, categories, types }: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<GlobalSetting>) => void
  categories: string[]
  types: string[]
}) {
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    type: 'string',
    category: 'general',
    description: '',
    isPublic: false,
    isEditable: true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      key: '',
      value: '',
      type: 'string',
      category: 'general',
      description: '',
      isPublic: false,
      isEditable: true
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-blue-50 to-purple-50">
        <DialogHeader className="sticky top-0 bg-gradient-to-br from-white via-blue-50 to-purple-50 z-10 pb-4">
          <DialogTitle className="edugenius-text-gradient-blue flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Create Global Setting
          </DialogTitle>
          <DialogDescription>
            Add a new system-wide configuration setting. Fill in the required information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="key">Setting Key *</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="e.g., site_name, maintenance_mode"
                required
                className="edugenius-glass"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Data Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="edugenius-glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="edugenius-glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Setting Value *</Label>
            <Textarea
              id="value"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="Enter setting value"
              rows={4}
              required
              className="edugenius-glass"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this setting does"
              rows={2}
              className="edugenius-glass"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              />
              <div className="space-y-1">
                <Label htmlFor="isPublic" className="text-sm font-medium">
                  Public Setting
                </Label>
                <p className="text-xs text-gray-500">Visible to non-admin users</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                id="isEditable"
                checked={formData.isEditable}
                onCheckedChange={(checked) => setFormData({ ...formData, isEditable: checked })}
              />
              <div className="space-y-1">
                <Label htmlFor="isEditable" className="text-sm font-medium">
                  Editable
                </Label>
                <p className="text-xs text-gray-500">Can be modified after creation</p>
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-gradient-to-br from-white via-blue-50 to-purple-50 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Save className="w-4 h-4 mr-2" />
              Create Setting
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Edit Setting Modal Component
function EditSettingModal({ isOpen, onClose, onSubmit, setting, categories, types }: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<GlobalSetting>) => void
  setting: Partial<GlobalSetting>
  categories: string[]
  types: string[]
}) {
  const [formData, setFormData] = useState({
    value: setting.value || '',
    description: setting.description || '',
    isPublic: setting.isPublic || false,
    isEditable: setting.isEditable || true
  })

  useEffect(() => {
    if (setting) {
      setFormData({
        value: setting.value || '',
        description: setting.description || '',
        isPublic: setting.isPublic || false,
        isEditable: setting.isEditable || true
      })
    }
  }, [setting])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-blue-50 to-purple-50">
        <DialogHeader className="sticky top-0 bg-gradient-to-br from-white via-blue-50 to-purple-50 z-10 pb-4">
          <DialogTitle className="edugenius-text-gradient-blue flex items-center">
            <Edit className="w-5 h-5 mr-2" />
            Edit Global Setting
          </DialogTitle>
          <DialogDescription>
            Update the system configuration setting. You can modify the value and properties below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pb-4">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Setting Key</Label>
                <p className="font-mono text-lg font-semibold text-gray-900">{setting.key}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Type & Category</Label>
                <p className="text-sm text-gray-700">
                  <Badge className="mr-2">{setting.type}</Badge>
                  <Badge variant="outline">{setting.category}</Badge>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Setting Value *</Label>
            <Textarea
              id="value"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="Enter setting value"
              rows={4}
              required
              className="edugenius-glass"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this setting does"
              rows={2}
              className="edugenius-glass"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              />
              <div className="space-y-1">
                <Label htmlFor="isPublic" className="text-sm font-medium">
                  Public Setting
                </Label>
                <p className="text-xs text-gray-500">Visible to non-admin users</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                id="isEditable"
                checked={formData.isEditable}
                onCheckedChange={(checked) => setFormData({ ...formData, isEditable: checked })}
              />
              <div className="space-y-1">
                <Label htmlFor="isEditable" className="text-sm font-medium">
                  Editable
                </Label>
                <p className="text-xs text-gray-500">Can be modified after creation</p>
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-gradient-to-br from-white via-blue-50 to-purple-50 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Save className="w-4 h-4 mr-2" />
              Update Setting
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// View Setting Modal Component
function ViewSettingModal({ isOpen, onClose, setting }: {
  isOpen: boolean
  onClose: () => void
  setting: GlobalSetting
}) {
  const formatValue = (value: string, type: string) => {
    try {
      if (type === 'json' || type === 'array' || type === 'object') {
        return JSON.stringify(JSON.parse(value), null, 2)
      }
      return value
    } catch {
      return value
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-blue-50 to-purple-50">
        <DialogHeader className="sticky top-0 bg-gradient-to-br from-white via-blue-50 to-purple-50 z-10 pb-4">
          <DialogTitle className="edugenius-text-gradient-blue flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Setting Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this global setting configuration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pb-4">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Setting Key</Label>
                <p className="font-mono text-lg font-semibold text-gray-900">{setting.key}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Type & Category</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-blue-100 text-blue-800">{setting.type}</Badge>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    {setting.category}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {setting.description && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Description</Label>
              <p className="text-gray-700 bg-white rounded-lg p-3 border border-gray-200">
                {setting.description}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Setting Value</Label>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <pre className="text-sm font-mono whitespace-pre-wrap text-gray-700">
                {formatValue(setting.value, setting.type)}
              </pre>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Public Setting</Label>
                  <p className="text-xs text-gray-500">Visible to non-admin users</p>
                </div>
                <Badge className={setting.isPublic ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {setting.isPublic ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Editable</Label>
                  <p className="text-xs text-gray-500">Can be modified after creation</p>
                </div>
                <Badge className={setting.isEditable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {setting.isEditable ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <Label className="text-sm font-medium text-gray-600">Updated By</Label>
                <p className="text-sm text-gray-700 mt-1">
                  {setting.updatedByUser.firstName} {setting.updatedByUser.lastName}
                </p>
                <p className="text-xs text-gray-500">{setting.updatedByUser.email}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                <p className="text-sm text-gray-700 mt-1">
                  {new Date(setting.updatedAt).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  Created: {new Date(setting.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-gradient-to-br from-white via-blue-50 to-purple-50 pt-4">
            <Button onClick={onClose} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
