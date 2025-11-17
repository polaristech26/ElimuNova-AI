"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CreateBillingModal } from "@/components/modals/create-billing-modal"
import { BillingDetailsModal } from "@/components/modals/billing-details-modal"
import { CreatePaymentMethodModal } from "@/components/modals/create-payment-method-modal"
import { CreateInvoiceModal } from "@/components/modals/create-invoice-modal"
import { useToast } from "@/hooks/use-toast"
import { 
  Search,
  Filter,
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

interface Billing {
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
  school: {
    id: string
    name: string
    address: string
    phone?: string
    email?: string
    schoolAdmin?: {
      user: {
        firstName: string
        lastName: string
        email: string
      }
    }
  }
  package: {
    id: string
    name: string
    description?: string
    price: number
    duration: number
    features?: string[]
  }
}

interface PaymentMethod {
  id: string
  name: string
  type: string
  isActive: boolean
  description?: string
  createdAt: string
  updatedAt: string
  _count: {
    subscriptions: number
    invoices: number
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
    school: {
      id: string
      name: string
      email: string
    }
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

interface BillingResponse {
  subscriptions: Billing[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface PaymentMethodResponse {
  paymentMethods: PaymentMethod[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
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

export default function BillingPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('subscriptions')
  
  // Subscriptions state
  const [billing, setBilling] = useState<Billing[]>([])
  const [billingLoading, setBillingLoading] = useState(true)
  const [billingPagination, setBillingPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  
  // Payment Methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true)
  const [paymentMethodsPagination, setPaymentMethodsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
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
  
  // Modals
  const [createBillingOpen, setCreateBillingOpen] = useState(false)
  const [billingDetailsOpen, setBillingDetailsOpen] = useState(false)
  const [selectedBillingId, setSelectedBillingId] = useState<string | null>(null)
  const [createPaymentMethodOpen, setCreatePaymentMethodOpen] = useState(false)
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false)

  // Fetch billing data
  const fetchBilling = async (page = 1) => {
    try {
      setBillingLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: billingPagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/billing?${params}`)
      if (response.ok) {
        const data: BillingResponse = await response.json()
        setBilling(data.subscriptions)
        setBillingPagination(data.pagination)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch billing data",
        })
      }
    } catch (error) {
      console.error('Error fetching billing:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch billing data",
      })
    } finally {
      setBillingLoading(false)
    }
  }

  // Fetch payment methods
  const fetchPaymentMethods = async (page = 1) => {
    try {
      setPaymentMethodsLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: paymentMethodsPagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { type: statusFilter }),
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/payment-methods?${params}`)
      if (response.ok) {
        const data: PaymentMethodResponse = await response.json()
        setPaymentMethods(data.paymentMethods)
        setPaymentMethodsPagination(data.pagination)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch payment methods",
        })
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch payment methods",
      })
    } finally {
      setPaymentMethodsLoading(false)
    }
  }

  // Fetch invoices
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
          description: "Failed to fetch invoices",
        })
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch invoices",
      })
    } finally {
      setInvoicesLoading(false)
    }
  }

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'subscriptions') {
      fetchBilling()
    } else if (activeTab === 'payment-methods') {
      fetchPaymentMethods()
    } else if (activeTab === 'invoices') {
      fetchInvoices()
    }
  }, [activeTab, searchQuery, statusFilter, sortBy, sortOrder])

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setBillingPagination(prev => ({ ...prev, page: 1 }))
    setPaymentMethodsPagination(prev => ({ ...prev, page: 1 }))
    setInvoicesPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter)
    setBillingPagination(prev => ({ ...prev, page: 1 }))
    setPaymentMethodsPagination(prev => ({ ...prev, page: 1 }))
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
      setBillingPagination(prev => ({ ...prev, page }))
      fetchBilling(page)
    } else if (activeTab === 'payment-methods') {
      setPaymentMethodsPagination(prev => ({ ...prev, page }))
      fetchPaymentMethods(page)
    } else if (activeTab === 'invoices') {
      setInvoicesPagination(prev => ({ ...prev, page }))
      fetchInvoices(page)
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    if (activeTab === 'subscriptions') {
      fetchBilling(billingPagination.page)
    } else if (activeTab === 'payment-methods') {
      fetchPaymentMethods(paymentMethodsPagination.page)
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
          <h1 className="text-3xl font-bold tracking-tight">Billing Management</h1>
          <p className="text-muted-foreground">
            Manage subscriptions, payment methods, and invoices
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={billingLoading || paymentMethodsLoading || invoicesLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(billingLoading || paymentMethodsLoading || invoicesLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {activeTab === 'subscriptions' && (
            <Button onClick={() => setCreateBillingOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Subscription
            </Button>
          )}
          {activeTab === 'payment-methods' && (
            <Button onClick={() => setCreatePaymentMethodOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Payment Method
            </Button>
          )}
          {activeTab === 'invoices' && (
            <Button onClick={() => setCreateInvoiceOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subscriptions" className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Subscriptions</span>
          </TabsTrigger>
          <TabsTrigger value="payment-methods" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Payment Methods</span>
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
              <CardTitle>Subscriptions</CardTitle>
              <CardDescription>
                Manage school subscriptions and billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {billingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : billing.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No subscriptions found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery ? 'Try adjusting your search criteria' : 'Create your first subscription to get started'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setCreateBillingOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Subscription
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {billing.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <School className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {subscription.school.name}
                            </h3>
                            <Badge className={getStatusColor(subscription.status)}>
                              {subscription.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {subscription.package.name} • {formatCurrency(subscription.amount)}
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
                            setSelectedBillingId(subscription.id)
                            setBillingDetailsOpen(true)
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
              {billingPagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {((billingPagination.page - 1) * billingPagination.limit) + 1} to{' '}
                    {Math.min(billingPagination.page * billingPagination.limit, billingPagination.total)} of{' '}
                    {billingPagination.total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(billingPagination.page - 1)}
                      disabled={billingPagination.page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-500">
                      Page {billingPagination.page} of {billingPagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(billingPagination.page + 1)}
                      disabled={billingPagination.page === billingPagination.pages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment-methods" className="space-y-6">
          {/* Payment Methods Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage available payment methods for subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentMethodsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No payment methods found</h3>
                  <p className="text-gray-500">
                    {searchQuery ? 'Try adjusting your search criteria' : 'No payment methods have been configured yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {method.name}
                            </h3>
                            <Badge className={getStatusColor(method.isActive ? 'ACTIVE' : 'INACTIVE')}>
                              {method.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {method.type} • {method._count.subscriptions} subscriptions • {method._count.invoices} invoices
                          </p>
                          {method.description && (
                            <p className="text-xs text-gray-400 truncate">
                              {method.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                Manage invoices and payment tracking
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
                            {invoice.subscription.school.name} • {formatCurrency(invoice.totalAmount)}
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
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateBillingModal
        isOpen={createBillingOpen}
        onClose={() => setCreateBillingOpen(false)}
        onBillingCreated={() => {
          setCreateBillingOpen(false)
          fetchBilling()
        }}
      />

      <BillingDetailsModal
        isOpen={billingDetailsOpen}
        onClose={() => setBillingDetailsOpen(false)}
        billingId={selectedBillingId}
        onBillingUpdated={() => {
          setBillingDetailsOpen(false)
          fetchBilling()
        }}
        onBillingDeleted={() => {
          setBillingDetailsOpen(false)
          fetchBilling()
        }}
      />

      <CreatePaymentMethodModal
        open={createPaymentMethodOpen}
        onOpenChange={setCreatePaymentMethodOpen}
        onSuccess={() => {
          setCreatePaymentMethodOpen(false)
          fetchPaymentMethods()
        }}
      />

      <CreateInvoiceModal
        open={createInvoiceOpen}
        onOpenChange={setCreateInvoiceOpen}
        onSuccess={() => {
          setCreateInvoiceOpen(false)
          fetchInvoices()
        }}
      />
    </div>
  )
}