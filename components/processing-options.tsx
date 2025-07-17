"use client"

import React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileStack, Hash, RotateCcw, Download } from "lucide-react"

interface ProcessingFeatures {
  merge_pdfs: boolean
  repaginate: boolean
  tenth_lining: boolean
}

interface Quote {
  total_pages: number
  total_cost: number
  currency: string
  cost_breakdown: string
}

interface VolumeDocument {
  volume_number: number
  filename: string
  content: string
  pages: number
  page_range: string
}

interface VolumeResponse {
  document_type: 'volumes'
  volume_count: number
  total_pages: number
  volumes: VolumeDocument[]
  features_applied: string[]
  processing_time_seconds: number
  from_cache: boolean
}

interface ProcessingOptionsProps {
  features: ProcessingFeatures
  onChange: (features: ProcessingFeatures) => void
  quote: Quote | null
  documentsCount: number
  onProcess: () => void
  onDownload: () => void
  isProcessing: boolean
  hasProcessedDocument: boolean
  downloadTimer: number
  autoDownloadFailed: boolean
  volumeResponse?: VolumeResponse | null
}

export function ProcessingOptions({ 
  features, 
  onChange, 
  quote, 
  documentsCount, 
  onProcess, 
  onDownload,
  isProcessing, 
  hasProcessedDocument, 
  downloadTimer,
  autoDownloadFailed,
  volumeResponse
}: ProcessingOptionsProps) {
  const handleFeatureChange = (feature: keyof ProcessingFeatures, checked: boolean) => {
    onChange({
      ...features,
      [feature]: checked,
    })
  }

  // Smart feature availability based on document count
  const canMerge = documentsCount > 1
  const canRepaginate = documentsCount > 0
  const canTenthLine = documentsCount > 0

  const options = [
    {
      key: "merge_pdfs" as const,
      label: "Merge PDFs",
      description: canMerge ? "Combine all PDFs into one document" : "Need 2+ documents to merge",
      icon: FileStack,
      enabled: canMerge,
      autoSelect: canMerge, // Auto-select when multiple docs
    },
    {
      key: "repaginate" as const,
      label: "Add page numbers",
      description: "Sequential page numbering",
      icon: Hash,
      enabled: canRepaginate,
      autoSelect: true, // Always useful for legal docs
    },
    {
      key: "tenth_lining" as const,
      label: "10th line numbering",
      description: "Legal reference line numbers",
      icon: RotateCcw,
      enabled: canTenthLine,
      autoSelect: true, // Always useful for legal docs
    },
  ]

  // Auto-select features when documents change
  React.useEffect(() => {
    if (documentsCount > 0) {
      const autoFeatures = {
        merge_pdfs: canMerge, // Auto-enable merge for multiple docs
        repaginate: true, // Always useful
        tenth_lining: true, // Always useful for legal docs
      }
      
      // Only update if current features don't match auto-selection
      const needsUpdate = Object.keys(autoFeatures).some(
        key => features[key as keyof ProcessingFeatures] !== autoFeatures[key as keyof ProcessingFeatures]
      )
      
      if (needsUpdate) {
        onChange(autoFeatures)
      }
    }
  }, [documentsCount, canMerge, onChange])

  return (
    <div className="space-y-6">
      {/* Processing Options */}
      <div className="space-y-4">
        {options.map((option) => {
          const Icon = option.icon
          const isEnabled = option.enabled
          const isChecked = features[option.key]
          
          return (
            <Card
              key={option.key}
              className={`apple-animation-smooth ${
                isEnabled 
                  ? "border-border/50 hover:border-primary/50 hover:bg-primary/5" 
                  : "border-border/30 bg-muted/50 opacity-60"
              }`}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={option.key}
                      checked={isChecked}
                      disabled={!isEnabled}
                      onCheckedChange={(checked) => isEnabled && handleFeatureChange(option.key, checked as boolean)}
                      className={`w-5 h-5 apple-animation-smooth ${
                        isEnabled 
                          ? "border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          : "border-muted-foreground/30 opacity-50 cursor-not-allowed"
                      }`}
                    />
                    <div className={`p-2 rounded-xl apple-animation-smooth ${
                      isEnabled 
                        ? "bg-primary/10 text-primary" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label 
                      htmlFor={option.key} 
                      className={`apple-text-body font-semibold block mb-2 ${
                        isEnabled 
                          ? "cursor-pointer" 
                          : "cursor-not-allowed text-muted-foreground"
                      }`}
                    >
                      {option.label}
                      {!isEnabled && option.key === "merge_pdfs" && (
                        <span className="ml-2 apple-text-caption font-normal text-orange-600 dark:text-orange-400">
                          (Upload more files)
                        </span>
                      )}
                    </label>
                    <p className={`apple-text-caption ${
                      isEnabled 
                        ? "text-muted-foreground" 
                        : "text-muted-foreground/60"
                    }`}>
                      {option.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* FREE Service Display */}
      {quote && documentsCount > 0 && (
        <Card className="apple-glass border-green-500/20 bg-green-500/5">
          <CardContent className="pt-6 pb-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2 apple-text-title text-green-600">
                FREE
              </div>
              <p className="apple-text-caption">{quote.cost_breakdown}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      {documentsCount > 0 && (
        <div className="pt-4">
          {!hasProcessedDocument ? (
            // Process Documents Button
            <Button
              onClick={onProcess}
              disabled={isProcessing}
              variant="apple"
              size="lg"
              className="w-full font-semibold"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Documents...
                </>
              ) : (
                <>
                  Process Documents (FREE)
                </>
              )}
            </Button>
          ) : (
            // Download Button or Timer (after processing)
            <div className="space-y-3">
              {downloadTimer > 0 ? (
                <Button
                  disabled={true}
                  className="w-full font-semibold bg-blue-500/20 text-blue-700 dark:text-blue-300 cursor-not-allowed rounded-2xl"
                  size="lg"
                >
                  <div className="animate-pulse mr-2 text-xl font-bold">{downloadTimer}</div>
                  {volumeResponse ? 'ZIP download starting...' : 'Auto-download starting...'}
                </Button>
              ) : (
                <Button
                  onClick={onDownload}
                  variant="apple"
                  className="w-full font-semibold bg-green-500 hover:bg-green-600"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {volumeResponse 
                    ? `📦 Download All ${volumeResponse.volume_count} Volumes (ZIP)` 
                    : `Download Document`
                  }
                </Button>
              )}
              {autoDownloadFailed && downloadTimer === 0 && (
                <p className="apple-text-caption text-center text-red-600 dark:text-red-400">
                  Auto-download failed. Please use the download button above.
                </p>
              )}
            </div>
          )}
          
          {/* Free Service Info */}
          {!hasProcessedDocument && (
            <p className="apple-text-caption text-center text-muted-foreground mt-3">
              🎉 Completely FREE • No payment required
            </p>
          )}
        </div>
      )}
    </div>
  )
}
