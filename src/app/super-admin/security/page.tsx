'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { 
  Search, 
  Filter, 
  Plus, 
  Shield, 
  Eye, 
  Edit, 
  Trash2, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Lock,
  Unlock,
  Activity,
  FileText,
  Settings,
  AlertCircle
} from 'lucide-react'
import CreateSecurityPolicyModal from '@/components/modals/create-security-policy-modal'
import SecurityPolicyDetailsModal from '@/components/modals/security-policy-details-modal'
import SecurityLogDetailsModal from '@/components/modals/security-log-details-modal'

interface SecurityLog {
  id: string
  eventType: string
  severity: string
  description: string
  ipAddress?: string
  userAgent?: string
  userId?: string
  schoolId?: string
  metadata?: string
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: string
  createdAt: string
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  school?: {
    id: string
    name: string
  }
  resolver?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

interface SecurityPolicy {
  id: string
  name: string
  description?: string
  policyType: string
  rules: string
  isActive: boolean
  priority: number
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
  createdByUser: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
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

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState('logs')
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [policies, setPolicies] = useState<SecurityPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('all-events')
  const [severityFilter, setSeverityFilter] = useState('all-severities')
  const [resolvedFilter, setResolvedFilter] = useState('all-status')
  const [policyTypeFilter, setPolicyTypeFilter] = useState('all-types')
  const [isActiveFilter, setIsActiveFilter] = useState('all-status')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [createPolicyModalOpen, setCreatePolicyModalOpen] = useState(false)
  const [policyDetailsModalOpen, setPolicyDetailsModalOpen] = useState(false)
  const [logDetailsModalOpen, setLogDetailsModalOpen] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(null)
  const [selectedLog, setSelectedLog] = useState<SecurityLog | null>(null)
  const { toast } = useToast()

  const fetchLogs = async (page = 1, search = '', eventType = '', severity = '', resolved = '', sort = 'createdAt', order = 'desc') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(eventType && eventType !== 'all-events' && { eventType }),
        ...(severity && severity !== 'all-severities' && { severity }),
        ...(resolved && resolved !== 'all-status' && { resolved }),
        sortBy: sort,
        sortOrder: order
      })

      const response = await fetch(`/api/security/logs?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
        setPagination(data.pagination)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch security logs",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch security logs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPolicies = async (page = 1, search = '', policyType = '', isActive = '', sort = 'createdAt', order = 'desc') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(policyType && policyType !== 'all-types' && { policyType }),
        ...(isActive && isActive !== 'all-status' && { isActive }),
        sortBy: sort,
        sortOrder: order
      })

      const response = await fetch(`/api/security/policies?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setPolicies(data.policies)
        setPagination(data.pagination)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch security policies",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching policies:', error)
      toast({
        title: "Error",
        description: "Failed to fetch security policies",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs(currentPage, searchTerm, eventTypeFilter, severityFilter, resolvedFilter, sortBy, sortOrder)
    } else {
      fetchPolicies(currentPage, searchTerm, policyTypeFilter, isActiveFilter, sortBy, sortOrder)
    }
  }, [activeTab, currentPage, searchTerm, eventTypeFilter, severityFilter, resolvedFilter, policyTypeFilter, isActiveFilter, sortBy, sortOrder])

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

  const handlePolicyCreated = (newPolicy: SecurityPolicy) => {
    setPolicies(prev => [newPolicy, ...prev])
    toast({
      title: "Success",
      description: "Security policy created successfully",
    })
  }

  const handlePolicyUpdated = (updatedPolicy: SecurityPolicy) => {
    setPolicies(prev => prev.map(policy => 
      policy.id === updatedPolicy.id ? updatedPolicy : policy
    ))
    toast({
      title: "Success",
      description: "Security policy updated successfully",
    })
  }

  const handlePolicyDeleted = (policyId: string) => {
    setPolicies(prev => prev.filter(policy => policy.id !== policyId))
    toast({
      title: "Success",
      description: "Security policy deleted successfully",
    })
  }

  const handleLogUpdated = (updatedLog: SecurityLog) => {
    setLogs(prev => prev.map(log => 
      log.id === updatedLog.id ? updatedLog : log
    ))
    toast({
      title: "Success",
      description: "Security log updated successfully",
    })
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'LOW': return CheckCircle
      case 'MEDIUM': return AlertCircle
      case 'HIGH': return AlertTriangle
      case 'CRITICAL': return XCircle
      default: return Clock
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'LOGIN_SUCCESS': return 'bg-green-100 text-green-800'
      case 'LOGIN_FAILED': return 'bg-red-100 text-red-800'
      case 'SUSPICIOUS_ACTIVITY': return 'bg-orange-100 text-orange-800'
      case 'UNAUTHORIZED_ACCESS': return 'bg-red-100 text-red-800'
      case 'PASSWORD_CHANGE': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPolicyTypeColor = (policyType: string) => {
    switch (policyType) {
      case 'PASSWORD': return 'bg-blue-100 text-blue-800'
      case 'SESSION': return 'bg-green-100 text-green-800'
      case 'API_RATE_LIMITING': return 'bg-purple-100 text-purple-800'
      case 'FILE_UPLOAD': return 'bg-orange-100 text-orange-800'
      case 'AUTHENTICATION': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatEventType = (eventType: string) => {
    return eventType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatPolicyType = (policyType: string) => {
    return policyType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="edugenius-text-gradient">Security Management</span>
          </h1>
          <p className="text-gray-600">Monitor security events and manage security policies</p>
        </div>
        <Button
          onClick={() => setCreatePolicyModalOpen(true)}
          className="edugenius-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Policy
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Security Logs
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security Policies
          </TabsTrigger>
        </TabsList>

        {/* Security Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          {/* Search and Filters */}
          <Card className="edugenius-card-gradient">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 edugenius-glass"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                    <SelectTrigger className="w-40 edugenius-glass">
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-events">All Events</SelectItem>
                      <SelectItem value="LOGIN_SUCCESS">Login Success</SelectItem>
                      <SelectItem value="LOGIN_FAILED">Login Failed</SelectItem>
                      <SelectItem value="SUSPICIOUS_ACTIVITY">Suspicious Activity</SelectItem>
                      <SelectItem value="UNAUTHORIZED_ACCESS">Unauthorized Access</SelectItem>
                      <SelectItem value="PASSWORD_CHANGE">Password Change</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-40 edugenius-glass">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-severities">All Severities</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
                    <SelectTrigger className="w-40 edugenius-glass">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-status">All Status</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="unresolved">Unresolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid gap-6">
              {logs.map((log) => {
                const SeverityIcon = getSeverityIcon(log.severity)
                return (
                  <Card key={log.id} className="edugenius-card-gradient hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <SeverityIcon className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">{formatEventType(log.eventType)}</h3>
                            <Badge className={getSeverityColor(log.severity)}>
                              {log.severity}
                            </Badge>
                            <Badge className={getEventTypeColor(log.eventType)}>
                              {formatEventType(log.eventType)}
                            </Badge>
                            {log.resolved ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Resolved
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-600 border-red-600">
                                <Clock className="w-3 h-3 mr-1" />
                                Unresolved
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-3">{log.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {log.ipAddress && (
                              <>
                                <span className="font-medium">IP:</span>
                                <span className="font-mono">{log.ipAddress}</span>
                              </>
                            )}
                            {log.user && (
                              <>
                                <span className="font-medium">User:</span>
                                <span>{log.user.firstName} {log.user.lastName}</span>
                              </>
                            )}
                            <span className="font-medium">Time:</span>
                            <span>{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLog(log)
                              setLogDetailsModalOpen(true)
                            }}
                            className="edugenius-glass"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!log.resolved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedLog(log)
                                setLogDetailsModalOpen(true)
                              }}
                              className="edugenius-glass"
                            >
                              <CheckCircle className="w-4 h-4" />
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
        </TabsContent>

        {/* Security Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          {/* Search and Filters */}
          <Card className="edugenius-card-gradient">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search policies..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 edugenius-glass"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Select value={policyTypeFilter} onValueChange={setPolicyTypeFilter}>
                    <SelectTrigger className="w-40 edugenius-glass">
                      <SelectValue placeholder="Policy Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-types">All Types</SelectItem>
                      <SelectItem value="PASSWORD">Password</SelectItem>
                      <SelectItem value="SESSION">Session</SelectItem>
                      <SelectItem value="API_RATE_LIMITING">API Rate Limiting</SelectItem>
                      <SelectItem value="FILE_UPLOAD">File Upload</SelectItem>
                      <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
                    <SelectTrigger className="w-40 edugenius-glass">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-status">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policies Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid gap-6">
              {policies.map((policy) => (
                <Card key={policy.id} className="edugenius-card-gradient hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Shield className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">{policy.name}</h3>
                          <Badge className={getPolicyTypeColor(policy.policyType)}>
                            {formatPolicyType(policy.policyType)}
                          </Badge>
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            Priority: {policy.priority}
                          </Badge>
                          {policy.isActive ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                        
                        {policy.description && (
                          <p className="text-gray-600 mb-3">{policy.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Created by {policy.createdByUser.firstName} {policy.createdByUser.lastName}</span>
                          <span>•</span>
                          <span>{new Date(policy.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPolicy(policy)
                            setPolicyDetailsModalOpen(true)
                          }}
                          className="edugenius-glass"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPolicy(policy)
                            setPolicyDetailsModalOpen(true)
                          }}
                          className="edugenius-glass"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Card className="edugenius-card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} {activeTab}
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
      <CreateSecurityPolicyModal
        isOpen={createPolicyModalOpen}
        onClose={() => setCreatePolicyModalOpen(false)}
        onPolicyCreated={handlePolicyCreated}
      />

      <SecurityPolicyDetailsModal
        isOpen={policyDetailsModalOpen}
        onClose={() => {
          setPolicyDetailsModalOpen(false)
          setSelectedPolicy(null)
        }}
        policy={selectedPolicy}
        onPolicyUpdated={handlePolicyUpdated}
        onPolicyDeleted={handlePolicyDeleted}
      />

      <SecurityLogDetailsModal
        isOpen={logDetailsModalOpen}
        onClose={() => {
          setLogDetailsModalOpen(false)
          setSelectedLog(null)
        }}
        log={selectedLog}
        onLogUpdated={handleLogUpdated}
      />
    </div>
  )
}
