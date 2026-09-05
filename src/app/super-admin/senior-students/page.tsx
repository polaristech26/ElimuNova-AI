'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Award, Search, RefreshCw, Loader2, CheckCircle2, Lock, RotateCcw, Hourglass, BadgeCheck, Banknote, UserPlus,
} from 'lucide-react'

interface Senior {
  id: string
  userId: string
  name: string
  email: string
  isActive: boolean
  approvalStatus: string
  approvedAt: string | null
  ageBracket: string | null
  priorEducation: string | null
  englishLevel: string | null
  isGEDReady: boolean
  certificate: string | null
  joinedAt: string
  subscription: { status: string; amount: number; packageName: string | null; endDate: string; isFreemium: boolean } | null
}

const STATUS_META: Record<string, { label: string; className: string; dot: string }> = {
  PENDING:  { label: 'Pending',  className: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-500' },
  FREEMIUM: { label: 'Freemium', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  ACTIVE:   { label: 'Paid',     className: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  LOCKED:   { label: 'Locked',   className: 'bg-rose-50 text-rose-700 border-rose-200',    dot: 'bg-rose-500' },
}

export default function SeniorStudentsPage() {
  const { toast } = useToast()
  const [seniors, setSeniors] = useState<Senior[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addForm, setAddForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    ageBracket: '', priorEducation: '', englishLevel: '',
  })
  const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', ageBracket: '', priorEducation: '', englishLevel: '' }

  const fetchSeniors = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true)
    try {
      const res = await fetch('/api/super-admin/senior-students')
      if (res.ok) {
        const data = await res.json()
        setSeniors(data.seniors)
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load senior students' })
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load senior students' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/super-admin/senior-students')
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setSeniors(data.seniors)
        } else if (!cancelled) {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to load senior students' })
        }
      } catch {
        if (!cancelled) toast({ variant: 'destructive', title: 'Error', description: 'Failed to load senior students' })
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [toast])

  const act = async (userId: string, action: 'approve' | 'activate' | 'lock' | 'pending') => {
    setBusyId(userId)
    try {
      const res = await fetch('/api/super-admin/senior-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      })
      if (res.ok) {
        const data = await res.json()
        await fetchSeniors()
        setSeniors((prev) =>
          prev.map((s) =>
            s.userId === userId && data.approvalStatus
              ? { ...s, approvalStatus: data.approvalStatus, approvedAt: data.approvedAt }
              : s
          )
        )
        const label = action === 'approve' ? 'approved (freemium issued)' : action === 'activate' ? 'activated (cash paid)' : action === 'lock' ? 'locked' : 'reset to pending'
        toast({ title: 'Updated', description: `Senior student ${label}` })
      } else {
        const err = await res.json()
        toast({ variant: 'destructive', title: 'Error', description: err.error })
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Action failed' })
    } finally {
      setBusyId(null)
    }
  }

  const createSenior = async () => {
    if (!addForm.firstName.trim() || !addForm.lastName.trim() || !addForm.email.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'First name, last name and email are required' })
      return
    }
    setAdding(true)
    try {
      const res = await fetch('/api/super-admin/senior-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          firstName: addForm.firstName.trim(),
          lastName: addForm.lastName.trim(),
          email: addForm.email.trim(),
          password: addForm.password || undefined,
          ageBracket: addForm.ageBracket || undefined,
          priorEducation: addForm.priorEducation || undefined,
          englishLevel: addForm.englishLevel || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({
          title: 'Created',
          description: `${data.senior.name} added (${data.username}).${data.generatedPassword ? ` Generated password: ${data.generatedPassword}` : ''}`,
        })
        setShowAdd(false)
        setAddForm(EMPTY_FORM)
        await fetchSeniors()
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error })
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create senior student' })
    } finally {
      setAdding(false)
    }
  }

  const filtered = seniors.filter((s) =>
    `${s.name} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  )

  const counts = {
    pending: seniors.filter((s) => s.approvalStatus === 'PENDING').length,
    freemium: seniors.filter((s) => s.approvalStatus === 'FREEMIUM').length,
    paid: seniors.filter((s) => s.approvalStatus === 'ACTIVE').length,
    locked: seniors.filter((s) => s.approvalStatus === 'LOCKED').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-teal-600" />
            <h1 className="text-2xl font-bold text-slate-800">Senior Students</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Approve adult learners, activate cash-paid subscriptions, or lock their dashboard.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAdd(true)}>
            <UserPlus className="w-4 h-4 mr-1.5" />
            Add Senior Student
          </Button>
          <Button variant="outline" onClick={() => fetchSeniors()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Hourglass className="h-5 w-5 text-amber-600" /></div>
            <div><p className="text-2xl font-bold text-slate-800">{counts.pending}</p><p className="text-xs text-slate-500">Pending Approval</p></div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><BadgeCheck className="h-5 w-5 text-emerald-600" /></div>
            <div><p className="text-2xl font-bold text-slate-800">{counts.freemium}</p><p className="text-xs text-slate-500">Freemium (Active)</p></div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Banknote className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold text-slate-800">{counts.paid}</p><p className="text-xs text-slate-500">Paid (Cash)</p></div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center"><Lock className="h-5 w-5 text-rose-600" /></div>
            <div><p className="text-2xl font-bold text-slate-800">{counts.locked}</p><p className="text-xs text-slate-500">Locked</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="pl-10 h-10 rounded-xl"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center text-sm text-slate-500">
            No senior students found.
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-5 py-3 font-semibold text-slate-500">Student</th>
                  <th className="px-5 py-3 font-semibold text-slate-500">Status</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 hidden md:table-cell">Subscription</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 hidden md:table-cell">Joined</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 hidden md:table-cell">GED</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const meta = STATUS_META[s.approvalStatus] ?? STATUS_META.PENDING
                  return (
                    <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        {s.subscription ? (
                          <span className="text-xs text-slate-500">
                            {s.subscription.packageName ?? 'Plan'}{' · '}
                            <span className="font-semibold text-slate-700">{s.subscription.isFreemium ? 'Free' : `$${s.subscription.amount}`}</span>
                            {' · '}{s.subscription.status === 'ACTIVE' ? 'active' : s.subscription.status.toLowerCase()}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-500 hidden md:table-cell">
                        {new Date(s.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        {s.isGEDReady
                          ? <span className="text-emerald-600 font-semibold">Diploma earned</span>
                          : <span className="text-slate-400">In progress</span>}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {s.approvalStatus !== 'FREEMIUM' && s.approvalStatus !== 'ACTIVE' && (
                            <Button size="sm" variant="outline" disabled={busyId === s.userId} onClick={() => act(s.userId, 'approve')}>
                              {busyId === s.userId ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600" />}
                              Approve
                            </Button>
                          )}
                          {s.approvalStatus !== 'ACTIVE' && (
                            <Button size="sm" variant="outline" disabled={busyId === s.userId} onClick={() => act(s.userId, 'activate')}>
                              {busyId === s.userId ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Banknote className="h-3.5 w-3.5 mr-1 text-blue-600" />}
                              Activate (Cash)
                            </Button>
                          )}
                          {s.approvalStatus !== 'LOCKED' && (
                            <Button size="sm" variant="outline" disabled={busyId === s.userId} onClick={() => act(s.userId, 'lock')}>
                              {busyId === s.userId ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Lock className="h-3.5 w-3.5 mr-1 text-rose-500" />}
                              Lock
                            </Button>
                          )}
                          {s.approvalStatus !== 'PENDING' && (
                            <Button size="sm" variant="ghost" disabled={busyId === s.userId} onClick={() => act(s.userId, 'pending')}>
                              {busyId === s.userId ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <RotateCcw className="h-3.5 w-3.5 mr-1" />}
                              Reset
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Senior Student */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle><UserPlus className="h-5 w-5 text-teal-600" />Add Senior Student</DialogTitle>
            <DialogDescription>
              Register an adult learner manually. They will appear as Pending until you approve them.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sr-first">First name</Label>
                <Input id="sr-first" value={addForm.firstName} placeholder="e.g. Jane"
                  onChange={(e) => setAddForm((f) => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sr-last">Last name</Label>
                <Input id="sr-last" value={addForm.lastName} placeholder="e.g. Mwangi"
                  onChange={(e) => setAddForm((f) => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sr-email">Email</Label>
              <Input id="sr-email" type="email" value={addForm.email} placeholder="e.g. jane.mwangi@example.com"
                onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sr-pass">Password <span className="text-slate-400 font-normal">(optional)</span></Label>
              <Input id="sr-pass" value={addForm.password} placeholder="Leave blank to auto-generate"
                onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Age bracket</Label>
                <Select value={addForm.ageBracket || undefined} onValueChange={(v) => setAddForm((f) => ({ ...f, ageBracket: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16-19">16–19</SelectItem>
                    <SelectItem value="20-29">20–29</SelectItem>
                    <SelectItem value="30-49">30–49</SelectItem>
                    <SelectItem value="50+">50+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Prior education</Label>
                <Select value={addForm.priorEducation || undefined} onValueChange={(v) => setAddForm((f) => ({ ...f, priorEducation: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Some Primary">Some Primary</SelectItem>
                    <SelectItem value="Some Secondary">Some Secondary</SelectItem>
                    <SelectItem value="Secondary">Secondary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>English level</Label>
              <Select value={addForm.englishLevel || undefined} onValueChange={(v) => setAddForm((f) => ({ ...f, englishLevel: v }))}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Native">Native</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 p-4 sm:p-6">
            <Button variant="outline" onClick={() => setShowAdd(false)} disabled={adding}>Cancel</Button>
            <Button onClick={createSenior} disabled={adding}>
              {adding ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <UserPlus className="h-4 w-4 mr-1.5" />}
              {adding ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
