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

  const showPDFPreview = (base64Content: string) => {
    const byteCharacters = atob(base64Content)
    const byteArray = new Uint8Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i)
    }
    const blob = new Blob([byteArray], { type: "application/pdf" })
    return URL.createObjectURL(blob)
  }

  const pdfUrl = showPDFPreview(document.content)

  return (
    <div className="space-y-4">
      {/* Document Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-tiber" />
            <span className="font-medium text-tiber">{document.filename}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sage">Pages:</span>
            <Badge className="bg-sage text-white">{document.pages}</Badge>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-sage" />
            <span className="text-sage">Processed in:</span>
            <span className="font-medium text-tiber">{document.processing_time_seconds}s</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {document.features_applied.map((feature) => (
              <Badge key={feature} variant="outline" className="text-xs border-tiber text-tiber">
                {feature.replace("_", " ")}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Controls */}
      <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-tiber/20">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="border-tiber text-tiber hover:bg-tiber hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-tiber">
            Page {currentPage} of {document.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(document.pages, currentPage + 1))}
            disabled={currentPage >= document.pages}
            className="border-tiber text-tiber hover:bg-tiber hover:text-white"
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
            className="border-tiber text-tiber hover:bg-tiber hover:text-white"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-tiber">{zoom}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(200, zoom + 25))}
            disabled={zoom >= 200}
            className="border-tiber text-tiber hover:bg-tiber hover:text-white"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Preview */}
      <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="relative">
            <iframe
              src={`${pdfUrl}#page=${currentPage}&zoom=${zoom}`}
              className="w-full h-96 border-0 rounded-lg"
              title="PDF Preview"
            />
            {/* Preview Watermark */}
            <div className="absolute top-6 right-6 px-4 py-2 bg-sage rounded-full text-sm font-semibold shadow-lg text-white">
              <Eye className="h-4 w-4 inline mr-2" />
              Preview Mode
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-sage">
        This is a free preview of your processed document. Pay to download the full document.
      </div>
    </div>
  )
}
