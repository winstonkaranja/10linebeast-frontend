"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Eye, Clock, FileText, Maximize2, Minimize2 } from "lucide-react"

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
  isPaymentComplete?: boolean
  onToggleFullView?: (isFullView: boolean) => void
}

export function PDFPreview({ document, isPaymentComplete = true, onToggleFullView }: PDFPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [isFullView, setIsFullView] = useState(false)
  const [viewerHeight, setViewerHeight] = useState(600)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate optimal viewer height based on available space
  useEffect(() => {
    const updateViewerHeight = () => {
      if (containerRef.current && isFullView) {
        const windowHeight = window.innerHeight
        const headerHeight = 120 // Header + padding
        const controlsHeight = 120 // Controls + margins
        const availableHeight = windowHeight - headerHeight - controlsHeight
        setViewerHeight(Math.max(400, availableHeight))
      } else {
        setViewerHeight(600)
      }
    }

    updateViewerHeight()
    window.addEventListener('resize', updateViewerHeight)
    return () => window.removeEventListener('resize', updateViewerHeight)
  }, [isFullView])

  // Handle full view toggle
  const handleToggleFullView = () => {
    const newFullView = !isFullView
    setIsFullView(newFullView)
    onToggleFullView?.(newFullView)
    
    // Auto-adjust zoom for optimal viewing
    if (newFullView) {
      setZoom(85) // Slightly zoomed out for full page visibility
    } else {
      setZoom(100) // Default zoom for normal view
    }
  }

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
    <div ref={containerRef} className="space-y-6">
      {/* Document Info - Compact Apple Style */}
      <div className={`apple-glass p-4 rounded-2xl border border-border/50 transition-all duration-300 ${isFullView ? 'opacity-90' : 'opacity-100'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <span className="apple-text-body font-medium truncate">{document.filename}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="apple-text-caption">Pages:</span>
              <Badge className="bg-primary text-primary-foreground">{document.pages}</Badge>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="apple-text-caption">Processed in:</span>
              <span className="apple-text-body font-medium">{document.processing_time_seconds}s</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {document.features_applied.map((feature) => (
                <Badge key={feature} variant="outline" className="apple-text-caption">
                  {feature.replace("_", " ")}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Controls - Apple Style */}
      <div className="apple-glass p-4 rounded-2xl border border-border/50 flex flex-wrap items-center justify-between gap-4">
        {/* Navigation Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="apple-animation-smooth h-10 w-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="apple-text-body font-medium px-3 py-1 bg-secondary/50 rounded-lg">
            {currentPage} / {document.pages}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(Math.min(document.pages, currentPage + 1))}
            disabled={currentPage >= document.pages}
            className="apple-animation-smooth h-10 w-10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            disabled={zoom <= 50}
            className="apple-animation-smooth h-10 w-10"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="apple-text-caption font-medium px-2 py-1 bg-secondary/30 rounded-md min-w-[50px] text-center">
            {zoom}%
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.min(150, zoom + 10))}
            disabled={zoom >= 150}
            className="apple-animation-smooth h-10 w-10"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          {/* Full View Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFullView}
            className="apple-animation-smooth h-10 w-10"
            title={isFullView ? "Exit full view" : "Enter full view"}
          >
            {isFullView ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* PDF Preview - Enhanced Apple Style */}
      <Card className="relative overflow-hidden apple-animation-smooth">
        <CardContent className="p-0">
          <div className="relative overflow-hidden">
            {document.content ? (
              <iframe
                src={`${pdfUrl}#page=${currentPage}&zoom=${zoom}&toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                className="w-full border-0 apple-animation-smooth"
                style={{
                  height: `${viewerHeight}px`,
                  pointerEvents: isPaymentComplete ? 'auto' : 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                }}
                title="PDF Preview"
                sandbox={isPaymentComplete ? "allow-same-origin allow-scripts" : "allow-same-origin"}
                onLoad={() => console.log('PDF iframe loaded successfully')}
                onError={() => console.error('PDF iframe failed to load')}
              />
            ) : (
              <div 
                className="w-full flex items-center justify-center bg-muted/30 rounded-2xl"
                style={{ height: `${viewerHeight}px` }}
              >
                <div className="text-center space-y-4">
                  <div className="p-4 bg-muted/50 rounded-2xl inline-block">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                  </div>
                  <div>
                    <p className="apple-text-body text-muted-foreground">No PDF content available</p>
                    <p className="apple-text-caption text-muted-foreground/60">Content length: {document.content?.length || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Document is always accessible - no payment required */}

            {/* Preview Watermark */}
            <div className="absolute top-4 right-4 apple-glass px-4 py-2 rounded-full apple-text-caption font-medium shadow-lg pointer-events-none backdrop-blur-md">
              <Eye className="h-3 w-3 inline mr-2" />
              Document
            </div>

            {/* Document is fully accessible */}
          </div>
        </CardContent>
      </Card>

      {/* Success Notice - Apple Style */}
      <div className="apple-glass p-4 rounded-2xl border border-green-500/50 bg-green-500/5 text-center">
        <p className="apple-text-body text-green-600 dark:text-green-400">
          ✅ Your processed document is ready for download!
        </p>
      </div>
    </div>
  )
}
