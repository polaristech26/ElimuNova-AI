'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Trash2, 
  Download, 
  FileText, 
  Save,
  Edit3,
  Eye,
  Printer,
  Copy,
  CheckCircle,
  AlertCircle,
  Brain
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface PerformanceLevel {
  id: string
  name: string
  description: string
  score: number
  color: string
}

interface Criterion {
  id: string
  title: string
  description: string
  weight: number
  maxScore: number
}

interface Rubric {
  title: string
  description: string
  subject: string
  grade: string
  totalPoints: number
  performanceLevels: PerformanceLevel[]
  criteria: Criterion[]
}

const defaultPerformanceLevels: PerformanceLevel[] = [
  { id: '1', name: 'Excellent', description: 'Exceeds expectations', score: 4, color: 'bg-green-100 text-green-800' },
  { id: '2', name: 'Good', description: 'Meets expectations', score: 3, color: 'bg-blue-100 text-blue-800' },
  { id: '3', name: 'Satisfactory', description: 'Partially meets expectations', score: 2, color: 'bg-yellow-100 text-yellow-800' },
  { id: '4', name: 'Needs Improvement', description: 'Below expectations', score: 1, color: 'bg-red-100 text-red-800' }
]

export default function RubricGeneratorPage() {
  const [rubric, setRubric] = useState<Rubric>({
    title: '',
    description: '',
    subject: '',
    grade: '',
    totalPoints: 100,
    performanceLevels: [...defaultPerformanceLevels],
    criteria: []
  })

  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Check for edit mode on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const editId = urlParams.get('edit')
    if (editId) {
      loadRubricForEdit(editId)
    }
  }, [])

  const loadRubricForEdit = async (rubricId: string) => {
    try {
      const response = await fetch(`/api/rubrics/${rubricId}`)
      if (response.ok) {
        const data = await response.json()
        const rubricData = data.rubric.rubricData
        
        setRubric({
          title: rubricData.title,
          description: rubricData.description,
          subject: rubricData.subject,
          grade: rubricData.grade,
          totalPoints: rubricData.totalPoints,
          performanceLevels: rubricData.performanceLevels,
          criteria: rubricData.criteria
        })
        
        setIsEditing(true)
        setEditingId(rubricId)
      } else {
        alert('Error loading rubric for editing')
      }
    } catch (error) {
      console.error('Error loading rubric:', error)
      alert('Error loading rubric for editing')
    }
  }

  const addCriterion = () => {
    const newCriterion: Criterion = {
      id: Date.now().toString(),
      title: '',
      description: '',
      weight: 1,
      maxScore: 4
    }
    setRubric(prev => ({
      ...prev,
      criteria: [...prev.criteria, newCriterion]
    }))
    setEditingCriterion(newCriterion)
  }

  const updateCriterion = (id: string, updates: Partial<Criterion>) => {
    setRubric(prev => ({
      ...prev,
      criteria: prev.criteria.map(c => c.id === id ? { ...c, ...updates } : c)
    }))
  }

  const deleteCriterion = (id: string) => {
    setRubric(prev => ({
      ...prev,
      criteria: prev.criteria.filter(c => c.id !== id)
    }))
  }

  const updatePerformanceLevel = (id: string, updates: Partial<PerformanceLevel>) => {
    setRubric(prev => ({
      ...prev,
      performanceLevels: prev.performanceLevels.map(p => p.id === id ? { ...p, ...updates } : p)
    }))
  }

  const addPerformanceLevel = () => {
    const newLevel: PerformanceLevel = {
      id: Date.now().toString(),
      name: '',
      description: '',
      score: rubric.performanceLevels.length + 1,
      color: 'bg-gray-100 text-gray-800'
    }
    setRubric(prev => ({
      ...prev,
      performanceLevels: [...prev.performanceLevels, newLevel]
    }))
  }

  const deletePerformanceLevel = (id: string) => {
    if (rubric.performanceLevels.length <= 2) return // Keep at least 2 levels
    setRubric(prev => ({
      ...prev,
      performanceLevels: prev.performanceLevels.filter(p => p.id !== id)
    }))
  }

  const calculateTotalPoints = () => {
    return rubric.criteria.reduce((total, criterion) => {
      return total + (criterion.maxScore * criterion.weight)
    }, 0)
  }

  const saveRubric = async () => {
    if (!rubric.title || !rubric.subject || !rubric.grade || rubric.criteria.length === 0) {
      alert('Please fill in all required fields and add at least one criterion.')
      return
    }

    setIsGenerating(true)
    try {
      const url = isEditing ? `/api/rubrics/${editingId}` : '/api/rubrics'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: rubric.title,
          description: rubric.description,
          subject: rubric.subject,
          grade: rubric.grade,
          totalPoints: rubric.totalPoints,
          performanceLevels: rubric.performanceLevels,
          criteria: rubric.criteria,
          metadata: {
            calculatedPoints: calculateTotalPoints(),
            updatedAt: new Date().toISOString()
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(isEditing ? 'Rubric updated successfully!' : 'Rubric saved successfully!')
        
        if (!isEditing) {
          // Reset form only for new rubrics
          setRubric({
            title: '',
            description: '',
            subject: '',
            grade: '',
            totalPoints: 100,
            performanceLevels: [...defaultPerformanceLevels],
            criteria: []
          })
        }
      } else {
        const error = await response.json()
        alert(`Error ${isEditing ? 'updating' : 'saving'} rubric: ${error.error}`)
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'saving'} rubric:`, error)
      alert(`Error ${isEditing ? 'updating' : 'saving'} rubric. Please try again.`)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateRubric = async () => {
    if (!rubric.title || !rubric.subject || !rubric.grade || rubric.criteria.length === 0) {
      alert('Please fill in all required fields and add at least one criterion.')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'rubric',
          subject: rubric.subject,
          grade: rubric.grade,
          topic: rubric.title,
          difficulty: 'medium',
          format: 'detailed',
          objectives: rubric.description,
          customData: {
            performanceLevels: rubric.performanceLevels,
            criteria: rubric.criteria,
            totalPoints: rubric.totalPoints
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Update the rubric with AI-generated content
        setRubric(prev => ({
          ...prev,
          description: data.content || prev.description
        }))
        alert('Rubric enhanced with AI! You can now save it.')
      }
    } catch (error) {
      console.error('Error generating rubric:', error)
      alert('Error generating rubric. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const exportToPDF = async () => {
    try {
      const response = await fetch('/api/export/rubric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rubric,
          format: 'pdf'
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${rubric.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_rubric.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Error exporting to PDF. Please try again.')
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      alert('Error exporting to PDF. Please try again.')
    }
  }

  const exportToWord = async () => {
    try {
      const response = await fetch('/api/export/rubric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rubric,
          format: 'word'
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${rubric.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_rubric.doc`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Error exporting to Word. Please try again.')
      }
    } catch (error) {
      console.error('Error exporting to Word:', error)
      alert('Error exporting to Word. Please try again.')
    }
  }

  const copyToClipboard = () => {
    const rubricText = generateRubricText()
    navigator.clipboard.writeText(rubricText)
    alert('Rubric copied to clipboard!')
  }

  const generateRubricText = () => {
    let text = `${rubric.title}\n`
    text += `Subject: ${rubric.subject} | Grade: ${rubric.grade}\n`
    text += `Description: ${rubric.description}\n\n`
    
    text += 'Performance Levels:\n'
    rubric.performanceLevels.forEach(level => {
      text += `- ${level.name} (${level.score} points): ${level.description}\n`
    })
    
    text += '\nCriteria:\n'
    rubric.criteria.forEach((criterion, index) => {
      text += `${index + 1}. ${criterion.title} (Weight: ${criterion.weight}, Max Score: ${criterion.maxScore})\n`
      text += `   ${criterion.description}\n\n`
    })
    
    return text
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Edit Rubric' : 'Rubric Generator'}
          </h1>
          <p className="text-gray-600 text-lg">
            {isEditing ? 'Update your assessment rubric' : 'Create professional assessment rubrics with ease'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Rubric Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Basic Information
                </CardTitle>
                <CardDescription>Enter the basic details for your rubric</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Rubric Title *</Label>
                    <Input
                      id="title"
                      value={rubric.title}
                      onChange={(e) => setRubric(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Essay Writing Rubric"
                      className="bg-white/70 backdrop-blur-sm border-0 shadow-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={rubric.subject}
                      onChange={(e) => setRubric(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="e.g., English, Mathematics"
                      className="bg-white/70 backdrop-blur-sm border-0 shadow-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade Level *</Label>
                    <Input
                      id="grade"
                      value={rubric.grade}
                      onChange={(e) => setRubric(prev => ({ ...prev, grade: e.target.value }))}
                      placeholder="e.g., Grade 7, High School"
                      className="bg-white/70 backdrop-blur-sm border-0 shadow-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalPoints">Total Points</Label>
                    <Input
                      id="totalPoints"
                      type="number"
                      value={rubric.totalPoints}
                      onChange={(e) => setRubric(prev => ({ ...prev, totalPoints: parseInt(e.target.value) || 100 }))}
                      className="bg-white/70 backdrop-blur-sm border-0 shadow-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500">
                      Calculated: {calculateTotalPoints()} points
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={rubric.description}
                    onChange={(e) => setRubric(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this rubric will assess..."
                    rows={3}
                    className="bg-white/70 backdrop-blur-sm border-0 shadow-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Performance Levels */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Performance Levels
                    </CardTitle>
                    <CardDescription>Define the scoring levels for your rubric</CardDescription>
                  </div>
                  <Button
                    onClick={addPerformanceLevel}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Level
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {rubric.performanceLevels.map((level, index) => (
                  <div key={level.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label>Level Name</Label>
                      <Input
                        value={level.name}
                        onChange={(e) => updatePerformanceLevel(level.id, { name: e.target.value })}
                        placeholder="e.g., Excellent"
                        className="bg-white border-0 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Score</Label>
                      <Input
                        type="number"
                        value={level.score}
                        onChange={(e) => updatePerformanceLevel(level.id, { score: parseInt(e.target.value) || 0 })}
                        className="bg-white border-0 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={level.description}
                        onChange={(e) => updatePerformanceLevel(level.id, { description: e.target.value })}
                        placeholder="e.g., Exceeds expectations"
                        className="bg-white border-0 shadow-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={() => deletePerformanceLevel(level.id)}
                        variant="outline"
                        size="sm"
                        disabled={rubric.performanceLevels.length <= 2}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Criteria */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-purple-600" />
                      Assessment Criteria
                    </CardTitle>
                    <CardDescription>Define what will be assessed in your rubric</CardDescription>
                  </div>
                  <Button
                    onClick={addCriterion}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Criterion
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {rubric.criteria.map((criterion, index) => (
                  <div key={criterion.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Criterion {index + 1}</h4>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setEditingCriterion(criterion)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => deleteCriterion(criterion.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={criterion.title}
                          onChange={(e) => updateCriterion(criterion.id, { title: e.target.value })}
                          placeholder="e.g., Content Quality"
                          className="bg-white border-0 shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Weight</Label>
                        <Input
                          type="number"
                          value={criterion.weight}
                          onChange={(e) => updateCriterion(criterion.id, { weight: parseInt(e.target.value) || 1 })}
                          className="bg-white border-0 shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label>Description</Label>
                      <Textarea
                        value={criterion.description}
                        onChange={(e) => updateCriterion(criterion.id, { description: e.target.value })}
                        placeholder="Describe what this criterion assesses..."
                        rows={2}
                        className="bg-white border-0 shadow-sm"
                      />
                    </div>
                  </div>
                ))}
                {rubric.criteria.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Edit3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No criteria added yet. Click "Add Criterion" to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Preview and Actions */}
          <div className="space-y-6">
            {/* Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setShowPreview(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Rubric
                </Button>
                <Button
                  onClick={saveRubric}
                  disabled={isGenerating}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isGenerating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isGenerating ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Rubric' : 'Save Rubric')}
                </Button>
                <Button
                  onClick={generateRubric}
                  disabled={isGenerating}
                  variant="outline"
                  className="w-full bg-white/70 backdrop-blur-sm border-0 shadow-sm hover:bg-white/90"
                >
                  {isGenerating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  ) : (
                    <Brain className="w-4 h-4 mr-2" />
                  )}
                  {isGenerating ? 'Generating...' : 'Enhance with AI'}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={exportToPDF}
                    variant="outline"
                    className="bg-white/70 backdrop-blur-sm border-0 shadow-sm hover:bg-white/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    onClick={exportToWord}
                    variant="outline"
                    className="bg-white/70 backdrop-blur-sm border-0 shadow-sm hover:bg-white/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Word
                  </Button>
                </div>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="w-full bg-white/70 backdrop-blur-sm border-0 shadow-sm hover:bg-white/90"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </Button>
              </CardContent>
            </Card>

            {/* Rubric Summary */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Rubric Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Manual Total:</span>
                  <span className="font-semibold">{rubric.totalPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Calculated Total:</span>
                  <span className="font-semibold">{calculateTotalPoints()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Performance Levels:</span>
                  <span className="font-semibold">{rubric.performanceLevels.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Criteria:</span>
                  <span className="font-semibold">{rubric.criteria.length}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <strong>Status:</strong> {rubric.criteria.length > 0 ? 'Ready to generate' : 'Add criteria to continue'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Modal */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Rubric Preview
              </DialogTitle>
              <DialogDescription>
                Preview your rubric before generating or exporting
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Rubric Header */}
              <div className="text-center border-b border-gray-200 pb-4">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{rubric.title || 'Untitled Rubric'}</h2>
                <p className="text-gray-600">{rubric.subject} • {rubric.grade}</p>
                {rubric.description && (
                  <p className="text-gray-700 mt-2">{rubric.description}</p>
                )}
              </div>

              {/* Rubric Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Criteria</th>
                      {rubric.performanceLevels.map((level) => (
                        <th key={level.id} className="border border-gray-300 px-4 py-2 text-center font-semibold">
                          {level.name}
                          <br />
                          <span className="text-sm text-gray-600">({level.score} pts)</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rubric.criteria.map((criterion, index) => (
                      <tr key={criterion.id}>
                        <td className="border border-gray-300 px-4 py-2">
                          <div className="font-semibold">{criterion.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{criterion.description}</div>
                          <div className="text-xs text-gray-500 mt-1">Weight: {criterion.weight}</div>
                        </td>
                        {rubric.performanceLevels.map((level) => (
                          <td key={level.id} className="border border-gray-300 px-4 py-2 text-center">
                            <div className="text-sm text-gray-700">
                              {level.description}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Points */}
              <div className="text-right text-lg font-semibold space-y-2">
                <div>Manual Total: {rubric.totalPoints} points</div>
                <div className="text-base text-gray-600">
                  Calculated Total: {calculateTotalPoints()} points
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Criterion Edit Modal */}
        <Dialog open={!!editingCriterion} onOpenChange={() => setEditingCriterion(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Criterion</DialogTitle>
              <DialogDescription>
                Update the details for this assessment criterion
              </DialogDescription>
            </DialogHeader>
            
            {editingCriterion && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={editingCriterion.title}
                    onChange={(e) => setEditingCriterion(prev => prev ? { ...prev, title: e.target.value } : null)}
                    placeholder="e.g., Content Quality"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editingCriterion.description}
                    onChange={(e) => setEditingCriterion(prev => prev ? { ...prev, description: e.target.value } : null)}
                    placeholder="Describe what this criterion assesses..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Weight</Label>
                    <Input
                      type="number"
                      value={editingCriterion.weight}
                      onChange={(e) => setEditingCriterion(prev => prev ? { ...prev, weight: parseInt(e.target.value) || 1 } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Score</Label>
                    <Input
                      type="number"
                      value={editingCriterion.maxScore}
                      onChange={(e) => setEditingCriterion(prev => prev ? { ...prev, maxScore: parseInt(e.target.value) || 4 } : null)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingCriterion(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (editingCriterion) {
                        updateCriterion(editingCriterion.id, editingCriterion)
                        setEditingCriterion(null)
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
