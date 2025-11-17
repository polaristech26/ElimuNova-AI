'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ImageGenerator from '@/components/ai/image-generator'
import PresentationGenerator from '@/components/ai/presentation-generator'
import { Image, Presentation } from 'lucide-react'

export default function AIToolsPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Content Tools</h1>
        <p className="text-gray-600 mt-2">
          Generate images and presentations using AI
        </p>
      </div>

      <Tabs defaultValue="images" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="images" className="flex items-center space-x-2">
            <Image className="w-4 h-4" />
            <span>Image Generator</span>
          </TabsTrigger>
          <TabsTrigger value="presentations" className="flex items-center space-x-2">
            <Presentation className="w-4 h-4" />
            <span>Presentations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="mt-6">
          <ImageGenerator />
        </TabsContent>

        <TabsContent value="presentations" className="mt-6">
          <PresentationGenerator />
        </TabsContent>
      </Tabs>
    </div>
  )
}
