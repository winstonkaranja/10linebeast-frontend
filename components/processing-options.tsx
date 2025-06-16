"use client"

import React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileStack, Hash, RotateCcw, CreditCard, Download } from "lucide-react"

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

interface ProcessingOptionsProps {
  features: ProcessingFeatures
  onChange: (features: ProcessingFeatures) => void
  quote: Quote | null
  documentsCount: number
  onProcess: () => void
  onPayment: () => void
  onDownload: () => void
  isProcessing: boolean
  hasProcessedDocument: boolean
  paymentStatus: "idle" | "processing" | "success" | "failed"
  downloadTimer: number
  autoDownloadFailed: boolean
}

export function ProcessingOptions({ 
  features, 
  onChange, 
  quote, 
  documentsCount, 
  onProcess, 
  onPayment, 
  onDownload,
  isProcessing, 
  hasProcessedDocument, 
  paymentStatus,
  downloadTimer,
  autoDownloadFailed
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
    <div className="space-y-4">
      {/* Processing Options */}
      <div className="space-y-3">
        {options.map((option) => {
          const Icon = option.icon
          const isEnabled = option.enabled
          const isChecked = features[option.key]
          
          return (
            <Card
              key={option.key}
              className={`border transition-all duration-200 ${
                isEnabled 
                  ? "border-black dark:border-white bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900" 
                  : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 opacity-60"
              }`}
            >
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={option.key}
                      checked={isChecked}
                      disabled={!isEnabled}
                      onCheckedChange={(checked) => isEnabled && handleFeatureChange(option.key, checked as boolean)}
                      className={`w-4 h-4 ${
                        isEnabled 
                          ? "border-black dark:border-white data-[state=checked]:bg-black dark:data-[state=checked]:bg-white data-[state=checked]:border-black dark:data-[state=checked]:border-white"
                          : "border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed"
                      }`}
                    />
                    <div className={`p-1.5 rounded-lg ${
                      isEnabled 
                        ? "bg-black dark:bg-white" 
                        : "bg-gray-400 dark:bg-gray-600"
                    }`}>
                      <Icon className={`h-3 w-3 ${
                        isEnabled 
                          ? "text-white dark:text-black" 
                          : "text-gray-200 dark:text-gray-400"
                      }`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label 
                      htmlFor={option.key} 
                      className={`text-sm font-semibold block mb-1 ${
                        isEnabled 
                          ? "cursor-pointer text-black dark:text-white" 
                          : "cursor-not-allowed text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {option.label}
                      {!isEnabled && option.key === "merge_pdfs" && (
                        <span className="ml-2 text-xs font-normal text-orange-600 dark:text-orange-400">
                          (Upload more files)
                        </span>
                      )}
                    </label>
                    <p className={`text-xs ${
                      isEnabled 
                        ? "text-black/70 dark:text-white/70" 
                        : "text-gray-400 dark:text-gray-500"
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

      {/* Real-time Cost Display */}
      {quote && documentsCount > 0 && (
        <Card className="bg-gray-50 dark:bg-gray-900 border border-black dark:border-white">
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-black dark:text-white mb-1">
                {quote.total_cost} {quote.currency}
              </div>
              <p className="text-xs text-black/70 dark:text-white/70">{quote.cost_breakdown}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      {documentsCount > 0 && (
        <div className="pt-2">
          {!hasProcessedDocument ? (
            // Process Documents Button
            <Button
              onClick={onProcess}
              disabled={isProcessing}
              className="w-full text-white dark:text-black font-semibold bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-black mr-2"></div>
                  Processing Documents...
                </>
              ) : (
                <>
                  Process Documents
                </>
              )}
            </Button>
          ) : paymentStatus === "success" ? (
            // Download Button or Timer (after successful payment)
            <div className="space-y-3">
              {downloadTimer > 0 ? (
                <Button
                  disabled={true}
                  className="w-full text-white font-semibold bg-blue-600 cursor-not-allowed transition-all duration-300"
                  size="lg"
                >
                  <div className="animate-pulse mr-2 text-xl font-bold">{downloadTimer}</div>
                  Auto-download starting...
                </Button>
              ) : (
                <Button
                  onClick={onDownload}
                  className="w-full text-white font-semibold bg-green-600 hover:bg-green-700 transition-all duration-300"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download {quote?.total_cost} {quote?.currency} Paid
                </Button>
              )}
              {autoDownloadFailed && downloadTimer === 0 && (
                <p className="text-xs text-center text-red-600 dark:text-red-400">
                  Auto-download failed. Please use the download button above.
                </p>
              )}
            </div>
          ) : (
            // Pay Button (after processing, before payment)
            <Button
              onClick={onPayment}
              disabled={paymentStatus === "processing"}
              className="w-full text-white font-semibold bg-green-600 hover:bg-green-700 transition-all duration-300"
              size="lg"
            >
              {paymentStatus === "processing" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay {quote?.total_cost} {quote?.currency}
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
