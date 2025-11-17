'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// Layout is handled by the parent layout.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  BookOpen, 
  Loader2, 
  Save, 
  Download, 
  Share2,
  Plus,
  Trash2,
  FileText,
  Calendar,
  Target
} from 'lucide-react'

export default function CreateSchemeOfWork() {
  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    topic: '',
    duration: 4,
    lessonsPerWeek: 5,
    lessonDuration: 45,
    prerequisites: [''],
    language: 'english'
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [downloading, setDownloading] = useState<'pdf' | 'word' | null>(null)
  const [topics, setTopics] = useState<string[]>([])
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }


  const handlePrerequisiteChange = (index: number, value: string) => {
    const newPrerequisites = [...formData.prerequisites]
    newPrerequisites[index] = value
    setFormData(prev => ({ ...prev, prerequisites: newPrerequisites }))
  }

  const addPrerequisite = () => {
    setFormData(prev => ({ ...prev, prerequisites: [...prev.prerequisites, ''] }))
  }

  const removePrerequisite = (index: number) => {
    if (formData.prerequisites.length > 1) {
      const newPrerequisites = formData.prerequisites.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, prerequisites: newPrerequisites }))
    }
  }

  const handleTopicChange = (index: number, value: string) => {
    const newTopics = [...topics]
    newTopics[index] = value
    setTopics(newTopics)
  }

  const addTopic = () => {
    setTopics(prev => [...prev, ''])
  }

  const removeTopic = (index: number) => {
    const newTopics = topics.filter((_, i) => i !== index)
    setTopics(newTopics)
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai/generate-scheme-of-work', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          topics: topics.filter(topic => topic.trim() !== '')
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setGeneratedContent(data.content)
        setIsEditing(true)
      } else {
        alert('Error generating scheme of work: ' + data.error)
      }
    } catch (error) {
      alert('Error generating scheme of work')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    try {
      console.log('Saving scheme with generated content:', generatedContent);
      
      if (!generatedContent || generatedContent.trim() === '') {
        alert('Please generate scheme of work content first before saving.');
        return;
      }

      console.log('Saving scheme with data:', {
        title: `${formData.topic} - ${formData.subject}`,
        subject: formData.subject,
        grade: formData.grade,
        duration: formData.duration,
        objectives: `Lessons per week: ${formData.lessonsPerWeek}`,
        topics: topics.filter(topic => topic.trim() !== ''),
        content: {
          topic: formData.topic,
          subject: formData.subject,
          grade: formData.grade,
          duration: formData.duration,
          lessonsPerWeek: formData.lessonsPerWeek,
          prerequisites: formData.prerequisites.filter(prereq => prereq.trim() !== ''),
          generatedContent: generatedContent,
          generatedAt: new Date().toISOString()
        },
      });

      const response = await fetch('/api/schemes-of-work', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${formData.topic} - ${formData.subject}`,
          subject: formData.subject,
          grade: formData.grade,
          duration: formData.duration,
          objectives: `Lessons per week: ${formData.lessonsPerWeek}`,
          topics: topics.filter(topic => topic.trim() !== ''),
          content: {
            topic: formData.topic,
            subject: formData.subject,
            grade: formData.grade,
            duration: formData.duration,
            lessonsPerWeek: formData.lessonsPerWeek,
            prerequisites: formData.prerequisites.filter(prereq => prereq.trim() !== ''),
            generatedContent: generatedContent,
            generatedAt: new Date().toISOString()
          },
        }),
      })

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Successfully saved scheme:', data);
        alert('Scheme of work saved successfully!');
        router.push('/teacher/schemes-of-work');
      } else {
        // Check if response has JSON content
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            console.error('Save error:', errorData);
            alert('Error saving scheme of work: ' + (errorData.error || 'Unknown error'));
          } catch (jsonError) {
            console.error('Failed to parse error JSON:', jsonError);
            alert(`Error saving scheme of work: ${response.status} ${response.statusText}`);
          }
        } else {
          // Handle non-JSON responses
          const errorText = await response.text();
          console.error('Save error (non-JSON):', { status: response.status, statusText: response.statusText, body: errorText });
          alert(`Error saving scheme of work: ${response.status} ${response.statusText} - ${errorText}`);
        }
      }
    } catch (error) {
      console.error('Error saving scheme of work:', error);
      alert('Error saving scheme of work: ' + error.message);
    }
  }

  const handleDownload = async (format: 'pdf' | 'word') => {
    setDownloading(format)
    try {
      const response = await fetch('/api/export/scheme-of-work', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: generatedContent,
          title: `${topics.filter(topic => topic.trim() !== '').join(', ')} - ${formData.subject}`,
          subject: formData.subject,
          grade: formData.grade,
          topic: formData.topic,
          duration: formData.duration,
          lessonsPerWeek: formData.lessonsPerWeek,
          lessonDuration: formData.lessonDuration,
          topics: topics.filter(topic => topic.trim() !== ''),
          format: format
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const element = document.createElement('a')
        element.href = url
        element.download = `${formData.topic}-scheme-of-work.${format === 'pdf' ? 'html' : 'doc'}`
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
        window.URL.revokeObjectURL(url)
      } else {
        alert('Error generating document')
      }
    } catch (error) {
      alert('Error downloading document')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Create Scheme of Work</span>
            </h1>
            <p className="text-gray-600">Generate AI-powered schemes of work for your classes</p>
          </div>
          <Button onClick={() => router.back()} variant="outline" className="bg-gradient-to-r from-white via-green-50 to-blue-50 border-0 shadow-sm hover:shadow-md transition-all duration-300">
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card className="bg-gradient-to-br from-white via-green-50 to-blue-50 shadow-lg backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                <Target className="mr-2 h-5 w-5" />
                Scheme of Work Details
              </CardTitle>
              <CardDescription>
                Fill in the details to generate your scheme of work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full flex h-10 items-center justify-between rounded-md border-0 bg-gradient-to-r from-white via-green-50 to-blue-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-300"
                    required
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Integrated Science">Integrated Science</option>
                    <option value="Pretechnical Studies">Pretechnical Studies</option>
                    <option value="Kiswahili">Kiswahili</option>
                    <option value="Christian Religious Education">Christian Religious Education</option>
                    <option value="Science and Technology">Science and Technology</option>
                    <option value="Creative Arts">Creative Arts</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                    <option value="Physical Education">Physical Education</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Computer Studies">Computer Studies</option>
                    <option value="Business Studies">Business Studies</option>
                    <option value="Economics">Economics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Physics">Physics</option>
                    <option value="Biology">Biology</option>
                    <option value="Literature">Literature</option>
                    <option value="Music">Music</option>
                    <option value="Drama">Drama</option>
                    <option value="Home Science">Home Science</option>
                    <option value="Environmental Studies">Environmental Studies</option>
                    <option value="Civics">Civics</option>
                    <option value="Life Skills">Life Skills</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade Level
                  </label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className="w-full flex h-10 items-center justify-between rounded-md border-0 bg-gradient-to-r from-white via-green-50 to-blue-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-300"
                    required
                  >
                    <option value="">Select Grade</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>

                {/* Term removed for universal usage */}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <Input
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="Enter the scheme of work topic"
                  className="flex h-10 w-full rounded-md border-0 bg-gradient-to-r from-white via-green-50 to-blue-50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-300"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (weeks)
                  </label>
                  <Input
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border-0 bg-gradient-to-r from-white via-green-50 to-blue-50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-300"
                    min="1"
                    max="52"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lessons per Week
                  </label>
                  <Input
                    name="lessonsPerWeek"
                    type="number"
                    value={formData.lessonsPerWeek}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border-0 bg-gradient-to-r from-white via-green-50 to-blue-50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-300"
                    min="1"
                    max="20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lesson Duration (minutes)
                  </label>
                  <Input
                    name="lessonDuration"
                    type="number"
                    value={formData.lessonDuration}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border-0 bg-gradient-to-r from-white via-green-50 to-blue-50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-300"
                    min="30"
                    max="120"
                  />
                </div>

                {formData.subject.toLowerCase() === 'kiswahili' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full flex h-10 items-center justify-between rounded-md border-0 bg-gradient-to-r from-white via-green-50 to-blue-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <option value="english">English</option>
                      <option value="kiswahili">Kiswahili</option>
                    </select>
                  </div>
                )}
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prerequisites (Optional)
                </label>
                {formData.prerequisites.map((prerequisite, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      value={prerequisite}
                      onChange={(e) => handlePrerequisiteChange(index, e.target.value)}
                      placeholder="Enter prerequisite knowledge"
                      className="flex h-10 w-full rounded-md border-0 bg-gradient-to-r from-white via-green-50 to-blue-50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-300"
                    />
                    {formData.prerequisites.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePrerequisite(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPrerequisite}
                  className="mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Prerequisite
                </Button>
              </div>

              {/* Topics Management */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topics (Optional)
                </label>
                {topics.map((topic, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      value={topic}
                      onChange={(e) => handleTopicChange(index, e.target.value)}
                      placeholder="Enter topic"
                      className="flex h-10 w-full rounded-md border-0 bg-gradient-to-r from-white via-green-50 to-blue-50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-300"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTopic(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTopic}
                  className="mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Topic
                </Button>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !formData.subject || !formData.grade || !formData.topic}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Generate Scheme of Work
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Content */}
          <Card className="bg-gradient-to-br from-white via-green-50 to-blue-50 shadow-lg backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Generated Scheme of Work</CardTitle>
              <CardDescription>
                Review and edit your AI-generated scheme of work
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="space-y-6">
                  {/* Scheme of Work Header Card */}
                  <Card className="bg-gradient-to-br from-white via-green-50 to-blue-50 shadow-lg backdrop-blur-sm border-0">
                    <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                      <CardTitle className="text-xl font-bold flex items-center">
                        <Target className="mr-3 h-6 w-6" />
                        {formData.topic} - {formData.subject}
                      </CardTitle>
                      <CardDescription className="text-green-100 text-base">
                        Grade {formData.grade} • {formData.duration} weeks • {formData.lessonsPerWeek} lessons/week • Generated {new Date().toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  {/* Scheme of Work Content Card */}
                  <Card className="bg-gradient-to-br from-white via-gray-50 to-green-50 shadow-lg backdrop-blur-sm border-0">
                    <CardHeader>
                      <CardTitle className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Scheme of Work Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white rounded-lg p-6 shadow-inner border border-gray-100 max-h-96 overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-mono text-sm">
                            {generatedContent}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Action Buttons Card */}
                  <Card className="bg-gradient-to-br from-white via-green-50 to-blue-50 shadow-lg backdrop-blur-sm border-0">
                    <CardHeader>
                      <CardTitle className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center">
                        <Download className="mr-2 h-5 w-5" />
                        Export & Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                          <Save className="mr-2 h-4 w-4" />
                          Save Scheme of Work
                        </Button>
                        <Button 
                          onClick={() => handleDownload('pdf')} 
                          variant="outline" 
                          disabled={downloading === 'pdf'}
                          className="bg-gradient-to-r from-white via-red-50 to-pink-50 border-0 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          {downloading === 'pdf' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-4 w-4" />
                          )}
                          Download PDF
                        </Button>
                        <Button 
                          onClick={() => handleDownload('word')} 
                          variant="outline" 
                          disabled={downloading === 'word'}
                          className="bg-gradient-to-r from-white via-blue-50 to-cyan-50 border-0 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          {downloading === 'word' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-4 w-4" />
                          )}
                          Download Word
                        </Button>
                        <Button variant="outline" className="bg-gradient-to-r from-white via-green-50 to-emerald-50 border-0 shadow-sm hover:shadow-md transition-all duration-300">
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Fill in the form and click "Generate Scheme of Work" to create your AI-powered scheme of work.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
  )
}
