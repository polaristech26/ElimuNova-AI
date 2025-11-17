"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Search,
  Plus,
  CreditCard,
  School,
  Package,
  DollarSign,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Receipt,
  FileText,
  Settings
} from "lucide-react"

interface Subscription {
  id: string
  startDate: string
  endDate: string
  amount: number
  status: string
  type: string
  paymentMethod: string
  transactionId?: string
  notes?: string
  createdAt: string
  updatedAt: string
  package: {
    id: string
    name: string
    description?: string
    price: number
    duration: number
    features?: string[]
  }
}

interface Invoice {
  id: string
  invoiceNumber: string
  subscriptionId: string
  amount: number
  taxAmount: number
  totalAmount: number
  status: string
  dueDate: string
  paidDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
  subscription: {
    package: {
      id: string
      name: string
      price: number
    }
  }
  paymentMethod?: {
    id: string
    name: string
    type: string
  }
}

interface SubscriptionResponse {
  subscriptions: Subscription[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface InvoiceResponse {
  invoices: Invoice[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function SchoolAdminBillingPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('subscriptions')
  
  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true)
  const [subscriptionsPagination, setSubscriptionsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  
  // Invoices state
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(true)
  const [invoicesPagination, setInvoicesPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  
  // Common filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // Fetch subscriptions data
  const fetchSubscriptions = async (page = 1) => {
    try {
      setSubscriptionsLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: subscriptionsPagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/billing?${params}`)
      if (response.ok) {
        const data: SubscriptionResponse = await response.json()
        setSubscriptions(data.subscriptions)
        setSubscriptionsPagination(data.pagination)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch subscriptions data",
        })
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch subscriptions data",
      })
    } finally {
      setSubscriptionsLoading(false)
    }
  }

  // Fetch invoices data
  const fetchInvoices = async (page = 1) => {
    try {
      setInvoicesLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: invoicesPagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/invoices?${params}`)
      if (response.ok) {
        const data: InvoiceResponse = await response.json()
        setInvoices(data.invoices)
        setInvoicesPagination(data.pagination)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch invoices data",
        })
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch invoices data",
      })
    } finally {
      setInvoicesLoading(false)
    }
  }

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'subscriptions') {
      fetchSubscriptions()
    } else if (activeTab === 'invoices') {
      fetchInvoices()
    }
  }, [activeTab, searchQuery, statusFilter, sortBy, sortOrder])

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setSubscriptionsPagination(prev => ({ ...prev, page: 1 }))
    setInvoicesPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter)
    setSubscriptionsPagination(prev => ({ ...prev, page: 1 }))
    setInvoicesPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle sort change
  const handleSortChange = (field: string) => {
    setSortBy(field)
  }

  // Handle sort order change
  const handleSortOrderChange = (order: string) => {
    setSortOrder(order)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    if (activeTab === 'subscriptions') {
      setSubscriptionsPagination(prev => ({ ...prev, page }))
      fetchSubscriptions(page)
    } else if (activeTab === 'invoices') {
      setInvoicesPagination(prev => ({ ...prev, page }))
      fetchInvoices(page)
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    if (activeTab === 'subscriptions') {
      fetchSubscriptions(subscriptionsPagination.page)
    } else if (activeTab === 'invoices') {
      fetchInvoices(invoicesPagination.page)
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'PAID':
        return <CheckCircle className="w-4 h-4" />
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'CANCELLED':
      case 'OVERDUE':
        return <XCircle className="w-4 h-4" />
      case 'INACTIVE':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-muted-foreground">
            Manage your school's subscriptions and view invoices
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={subscriptionsLoading || invoicesLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(subscriptionsLoading || invoicesLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subscriptions" className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Subscriptions</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center space-x-2">
            <Receipt className="w-4 h-4" />
            <span>Invoices</span>
          </TabsTrigger>
        </TabsList>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search subscriptions..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="startDate">Start Date</SelectItem>
                    <SelectItem value="endDate">End Date</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={handleSortOrderChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Your Subscriptions</CardTitle>
              <CardDescription>
                View and manage your school's package subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No subscriptions found</h3>
                  <p className="text-gray-500">
                    {searchQuery ? 'Try adjusting your search criteria' : 'No subscriptions have been created yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {subscription.package.name}
                            </h3>
                            <Badge className={getStatusColor(subscription.status)}>
                              {subscription.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {formatCurrency(subscription.amount)} • {subscription.package.duration} months
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // View subscription details
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {subscriptionsPagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {((subscriptionsPagination.page - 1) * subscriptionsPagination.limit) + 1} to{' '}
                    {Math.min(subscriptionsPagination.page * subscriptionsPagination.limit, subscriptionsPagination.total)} of{' '}
                    {subscriptionsPagination.total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(subscriptionsPagination.page - 1)}
                      disabled={subscriptionsPagination.page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-500">
                      Page {subscriptionsPagination.page} of {subscriptionsPagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(subscriptionsPagination.page + 1)}
                      disabled={subscriptionsPagination.page === subscriptionsPagination.pages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Your Invoices</CardTitle>
              <CardDescription>
                View and track your school's invoices and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
                  <p className="text-gray-500">
                    {searchQuery ? 'Try adjusting your search criteria' : 'No invoices have been generated yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {invoice.invoiceNumber}
                            </h3>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {invoice.subscription.package.name} • {formatCurrency(invoice.totalAmount)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Due: {formatDate(invoice.dueDate)}
                            {invoice.paidDate && ` • Paid: ${formatDate(invoice.paidDate)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {invoice.status === 'PENDING' && (
                          <Button variant="ghost" size="sm">
                            <CreditCard className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {invoicesPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {((invoicesPagination.page - 1) * invoicesPagination.limit) + 1} to{' '}
                    {Math.min(invoicesPagination.page * invoicesPagination.limit, invoicesPagination.total)} of{' '}
                    {invoicesPagination.total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(invoicesPagination.page - 1)}
                      disabled={invoicesPagination.page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-500">
                      Page {invoicesPagination.page} of {invoicesPagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(invoicesPagination.page + 1)}
                      disabled={invoicesPagination.page === invoicesPagination.totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
