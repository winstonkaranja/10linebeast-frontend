"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Eye, Clock, FileText } from "lucide-react"

interface ProcessedDocument {
  filename: string
  content: string
  pages: number
  features_applied: string[]
  processing_time_seconds: number
  from_cache: boolean
}

interface PDFPreviewProps {
  document: ProcessedDocument
}

export function PDFPreview({ document }: PDFPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)

  // Create PDF blob URL from base64 content
  const createPdfUrl = () => {
    try {
      // Convert base64 to binary
      const binaryString = atob(document.content)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' })
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error('Error creating PDF URL:', error)
      // Fallback to data URL
      return `data:application/pdf;base64,${document.content}`
    }
  }

  const pdfUrl = createPdfUrl()

  return (
    <div className="space-y-4">
      {/* Document Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-black dark:text-white" />
            <span className="font-medium text-black dark:text-white">{document.filename}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-black/70 dark:text-white/70">Pages:</span>
            <Badge className="bg-black dark:bg-white text-white dark:text-black">{document.pages}</Badge>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-black/70 dark:text-white/70" />
            <span className="text-black/70 dark:text-white/70">Processed in:</span>
            <span className="font-medium text-black dark:text-white">{document.processing_time_seconds}s</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {document.features_applied.map((feature) => (
              <Badge key={feature} variant="outline" className="text-xs border-black dark:border-white text-black dark:text-white">
                {feature.replace("_", " ")}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Controls */}
      <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-black/60 rounded-xl border border-black/20 dark:border-white/20">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-black dark:text-white">
            Page {currentPage} of {document.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(document.pages, currentPage + 1))}
            disabled={currentPage >= document.pages}
            className="border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(50, zoom - 25))}
            disabled={zoom <= 50}
            className="border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-black dark:text-white">{zoom}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(200, zoom + 25))}
            disabled={zoom >= 200}
            className="border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Preview with Hidden Controls */}
      <Card className="relative bg-white dark:bg-black border border-black dark:border-white">
        <CardContent className="p-0">
          <div className="relative overflow-hidden rounded-lg">
            {document.content ? (
              <iframe
                src={`${pdfUrl}#page=${currentPage}&zoom=${zoom}&toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-[600px] border-0 rounded-lg"
                title="PDF Preview"
                style={{
                  pointerEvents: 'none', // Disable all interactions including right-click
                  userSelect: 'none'
                }}
                onLoad={() => console.log('PDF iframe loaded successfully')}
                onError={() => console.error('PDF iframe failed to load')}
              />
            ) : (
              <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="text-center space-y-2">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="text-gray-500">No PDF content available</p>
                  <p className="text-xs text-gray-400">Content length: {document.content?.length || 0}</p>
                </div>
              </div>
            )}
            {/* Overlay to prevent interaction */}
            <div 
              className="absolute inset-0 bg-transparent"
              style={{ pointerEvents: 'auto' }}
              onContextMenu={(e) => e.preventDefault()}
            />
            {/* Preview Watermark */}
            <div className="absolute top-4 right-4 px-3 py-1 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium shadow-lg pointer-events-none">
              <Eye className="h-3 w-3 inline mr-1" />
              Preview
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-black/70 dark:text-white/70 bg-black/5 dark:bg-white/5 rounded-lg p-3">
        🔒 This is a secure preview of your processed document. Complete payment to download the full document.
      </div>
    </div>
  )
}
