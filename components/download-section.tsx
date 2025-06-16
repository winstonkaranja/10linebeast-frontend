"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, CheckCircle, FileText, Clock } from "lucide-react"

interface ProcessedDocument {
  filename: string
  content: string
  pages: number
  features_applied: string[]
  processing_time_seconds: number
  from_cache: boolean
}

interface PaymentData {
  payment_reference: string
  access_code: string
  amount: number
  message: string
}

interface Document {
  filename: string
  content: string
  order: number
  file: File
}

interface ProcessingFeatures {
  merge_pdfs: boolean
  repaginate: boolean
  tenth_lining: boolean
}

interface DownloadSectionProps {
  processedDocument: ProcessedDocument
  paymentData: PaymentData
  documents: Document[]
  features: ProcessingFeatures
}

// Backend response types
interface BackendSuccessResponse {
  success: true
  processed_document: {
    filename: string
    content: string
    pages: number
    features_applied: string[]
    processing_time_seconds: number
    from_cache: boolean
  }
}

interface BackendErrorResponse {
  detail: string
}

export function DownloadSection({ processedDocument, paymentData, documents, features }: DownloadSectionProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadComplete, setDownloadComplete] = useState(false)

  const downloadPDF = (base64Content: string, filename: string) => {
    const byteCharacters = atob(base64Content)
    const byteArray = new Uint8Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i)
    }
    const blob = new Blob([byteArray], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      // Prepare request body with payment verification
      const requestBody = {
        documents: documents.map((doc) => ({
          filename: doc.filename,
          content: doc.content,
          order: doc.order,
        })),
        features: {
          merge_pdfs: features.merge_pdfs,
          repaginate: features.repaginate,
          tenth_lining: features.tenth_lining,
        },
        payment_reference: paymentData.payment_reference,
        verified_payment: true,
      }

      console.log("Download request:", requestBody)

      const response = await fetch("https://web-production-fb32b.up.railway.app/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorResponse: BackendErrorResponse = await response.json()
        throw new Error(errorResponse.detail || "Download failed")
      }

      const result: BackendSuccessResponse = await response.json()

      if (result.success && result.processed_document) {
        // Download the verified processed document
        downloadPDF(result.processed_document.content, result.processed_document.filename)
        setDownloadComplete(true)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("Download error:", error)
      alert(
        `Download failed: ${error instanceof Error ? error.message : "Unknown error"}. Please contact support with your payment reference: ${paymentData.payment_reference}`,
      )
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Payment Confirmation */}
      <Card className="bg-green-50 border border-green-200">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">Payment Confirmed</span>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <p>Amount: {paymentData.amount} KSH</p>
            <p>Reference: {paymentData.payment_reference}</p>
            <p>Status: Completed</p>
          </div>
        </CardContent>
      </Card>

      {/* Document Details */}
      <Card className="bg-white/60 backdrop-blur-sm border border-tiber/20">
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-tiber" />
              <span className="font-medium text-tiber">{processedDocument.filename}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-sage">Pages:</span>
                <Badge className="ml-2 bg-sage text-white">{processedDocument.pages}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-sage" />
                <span className="text-sage">Processed in:</span>
                <span className="font-medium text-tiber">{processedDocument.processing_time_seconds}s</span>
              </div>
            </div>

            <div>
              <span className="text-sm text-sage">Features applied:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {processedDocument.features_applied.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs border-tiber text-tiber">
                    {feature.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Button */}
      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full text-white font-semibold bg-tiber hover:bg-tiber/90 shadow-lg hover:shadow-xl transition-all duration-300"
        size="lg"
      >
        {isDownloading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Preparing Download...
          </>
        ) : downloadComplete ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Download Complete
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Download {processedDocument.filename}
          </>
        )}
      </Button>

      {downloadComplete && (
        <div className="text-center text-sm text-green-600">
          <CheckCircle className="h-4 w-4 inline mr-1" />
          Document downloaded successfully!
        </div>
      )}

      <div className="text-xs text-center text-sage">
        Your processed document is ready for download. Keep your payment reference for records.
      </div>
    </div>
  )
}
