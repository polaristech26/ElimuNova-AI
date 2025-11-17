"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Calendar, User2, FileText } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface AssignmentDetail {
  id: string
  title: string
  description: string
  content?: string | null
  subject?: string | null
  dueDate: string
  status: string
  teacher: {
    id: string
    name: string
    email: string
  }
  lessonPlan?: {
    id: string
    title: string
    subject: string
    grade: string
  } | null
}

export default function StudentAssignmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const assignmentId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string)

  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workContent, setWorkContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!assignmentId) return
      try {
        setLoading(true)
        const res = await fetch(`/api/assignments/${assignmentId}`)
        if (!res.ok) throw new Error("Failed to load assignment")
        const data = await res.json()
        setAssignment(data.assignment)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchAssignment()
  }, [assignmentId])

  const submitWork = async () => {
    if (!assignmentId || !workContent.trim()) return
    try {
      setIsSubmitting(true)
      setSubmitMessage(null)
      const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: workContent, attachments: [] })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit')
      setSubmitMessage('Submitted and auto-graded successfully!')
      // Refresh details to reflect grade if teacher also sees it
      const refreshed = await fetch(`/api/assignments/${assignmentId}`)
      if (refreshed.ok) {
        const d = await refreshed.json()
        setAssignment(d.assignment)
      }
    } catch (e) {
      setSubmitMessage(e instanceof Error ? e.message : 'Submission failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600">{error || "Assignment not found"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to assignments
      </Button>

      <Card className="shadow-lg">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{assignment.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-600 mt-2">
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                <span className="flex items-center"><User2 className="w-4 h-4 mr-1"/>{assignment.teacher.name}</span>
                {assignment.subject && <Badge variant="outline">{assignment.subject}</Badge>}
                {assignment.lessonPlan && (
                  <Badge variant="outline">From: {assignment.lessonPlan.title}</Badge>
                )}
              </div>
            </div>
            <Badge>{assignment.status}</Badge>
          </div>

          <p className="text-gray-700">{assignment.description}</p>

          {assignment.content && (
            <div className="p-4 rounded-lg bg-white/70 backdrop-blur-sm border">
              <div className="flex items-center mb-3 text-gray-700">
                <FileText className="w-4 h-4 mr-2"/> Assignment Content
              </div>
              <div className="prose max-w-none whitespace-pre-wrap">{assignment.content}</div>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Your Workspace</h2>
            <Textarea
              value={workContent}
              onChange={(e) => setWorkContent(e.target.value)}
              placeholder="Type your answer here..."
              rows={10}
            />
            <div className="flex items-center gap-3">
              <Button onClick={submitWork} disabled={isSubmitting || !workContent.trim()} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
                {isSubmitting ? 'Submitting...' : 'Submit for AI Check'}
              </Button>
              {submitMessage && <span className="text-sm text-gray-600">{submitMessage}</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


