"use client"

import { useState, useCallback } from "react"
import { FileUpload } from "@/components/file-upload"
import { ProcessingOptions } from "@/components/processing-options"
import { ProcessingStatus } from "@/components/processing-status"
import { PDFPreview } from "@/components/pdf-preview"
import { CostCalculator } from "@/components/cost-calculator"
import { PaymentSection } from "@/components/payment-section"
import { DownloadSection } from "@/components/download-section"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"

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

interface ProcessedDocument {
  filename: string
  content: string
  pages: number
  features_applied: string[]
  processing_time_seconds: number
  from_cache: boolean
}

interface Quote {
  total_pages: number
  total_cost: number
  currency: string
  cost_breakdown: string
}

interface PaymentData {
  payment_reference: string
  access_code: string
  amount: number
  message: string
}

// Backend API response types
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

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [features, setFeatures] = useState<ProcessingFeatures>({
    merge_pdfs: true,
    repaginate: true,
    tenth_lining: true,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedDocument, setProcessedDocument] = useState<ProcessedDocument | null>(null)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleFilesSelected = useCallback(
    (files: Document[]) => {
      setDocuments(files)
      setProcessedDocument(null)
      setQuote(null)
      setPaymentData(null)
      setPaymentStatus("idle")
      setError(null)

      // Generate quote immediately when files are selected
      if (files.length > 0) {
        generateQuote(files, features)
      }
    },
    [features],
  )

  const handleFeaturesChange = useCallback(
    (newFeatures: ProcessingFeatures) => {
      setFeatures(newFeatures)

      // Regenerate quote when features change
      if (documents.length > 0) {
        generateQuote(documents, newFeatures)
      }
    },
    [documents],
  )

  const generateQuote = (docs: Document[], selectedFeatures: ProcessingFeatures) => {
    // Calculate total pages (estimate 10 pages per PDF for demo)
    const estimatedPagesPerPdf = 10
    const totalPages = docs.length * estimatedPagesPerPdf

    // Count selected features
    const selectedFeaturesCount = Object.values(selectedFeatures).filter(Boolean).length

    // Calculate cost: 1 KSH per page per feature
    const totalCost = totalPages * selectedFeaturesCount

    const newQuote: Quote = {
      total_pages: totalPages,
      total_cost: totalCost,
      currency: "KSH",
      cost_breakdown: `${docs.length} documents × ${estimatedPagesPerPdf} pages × ${selectedFeaturesCount} features × 1 KSH`,
    }

    setQuote(newQuote)
  }

  const processDocuments = async () => {
    if (documents.length === 0) {
      setError("Please select at least one PDF document")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      console.log("Processing documents...")

      // Prepare request body in the exact format your backend expects
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
      }

      console.log("Request body:", requestBody)

      const response = await fetch("https://web-production-fb32b.up.railway.app/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        // Handle error response
        const errorResponse: BackendErrorResponse = await response.json()
        console.log("Error response:", errorResponse)
        throw new Error(errorResponse.detail || `HTTP ${response.status}: Processing failed`)
      }

      // Handle success response
      const result: BackendSuccessResponse = await response.json()
      console.log("Success response:", result)

      if (result.success && result.processed_document) {
        setProcessedDocument({
          filename: result.processed_document.filename,
          content: result.processed_document.content,
          pages: result.processed_document.pages,
          features_applied: result.processed_document.features_applied,
          processing_time_seconds: result.processed_document.processing_time_seconds,
          from_cache: result.processed_document.from_cache,
        })
        console.log("✅ Processing successful!")
      } else {
        throw new Error("Invalid response format: missing success or processed_document")
      }
    } catch (err) {
      console.error("❌ Processing error:", err)
      setError(err instanceof Error ? err.message : "An error occurred during processing")
    } finally {
      setIsProcessing(false)
    }
  }

  const initiatePayment = async () => {
    if (!email || !validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    if (!quote) {
      setError("Quote not available")
      return
    }

    setPaymentStatus("processing")
    setError(null)

    try {
      // Initialize Paystack payment
      const paymentData = {
        email: email,
        amount: quote.total_cost * 100, // Paystack expects amount in kobo (multiply by 100)
        currency: "KES",
        metadata: {
          documents: documents.map((doc) => ({ filename: doc.filename, order: doc.order })),
          features: features,
          phone_number: phoneNumber,
        },
      }

      // Use Paystack Popup
      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_your_public_key_here",
        email: paymentData.email,
        amount: paymentData.amount,
        currency: paymentData.currency,
        metadata: paymentData.metadata,
        callback: (response: any) => {
          // Payment successful
          setPaymentData({
            payment_reference: response.reference,
            access_code: response.reference,
            amount: quote.total_cost,
            message: "Payment successful",
          })
          setPaymentStatus("success")
        },
        onClose: () => {
          // Payment cancelled
          setPaymentStatus("failed")
          setError("Payment was cancelled")
        },
      })

      handler.openIframe()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment initiation failed")
      setPaymentStatus("failed")
    }
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhoneNumber = (phone: string): boolean => {
    const kenyanPhoneRegex = /^(254|0)[17]\d{8}$/
    return kenyanPhoneRegex.test(phone.replace(/[^\d]/g, ""))
  }

  return (
    <div className="min-h-screen bg-cream font-satoshi">
      {/* Header */}
      <header className="h-[30px] border-b border-tiber/10 bg-cream">
        <div className="container mx-auto px-4 h-full flex items-center">
          <h1 className="text-lg font-semibold text-tiber">PoliHive</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Main Content Area */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-8">
          {/* Document Upload - Center (3 columns) */}
          <div className="xl:col-span-3">
            <FileUpload onFilesSelected={handleFilesSelected} />
          </div>

          {/* Processing Options - Right (1 column) */}
          <div>
            <Card className="bg-white/80 backdrop-blur-sm border border-tiber/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-tiber">Processing Options</CardTitle>
                <CardDescription className="text-sage">Select the features you need for your documents</CardDescription>
              </CardHeader>
              <CardContent>
                <ProcessingOptions features={features} onChange={handleFeaturesChange} />
              </CardContent>
            </Card>

            {/* Quote Display */}
            {quote && (
              <Card className="bg-white/80 backdrop-blur-sm border border-tiber/20 shadow-lg mt-6">
                <CardHeader>
                  <CardTitle className="text-tiber">Estimated Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <CostCalculator quote={quote} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Process Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={processDocuments}
            disabled={documents.length === 0 || isProcessing}
            size="lg"
            className="px-12 py-3 font-semibold text-white bg-tiber hover:bg-tiber/90 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isProcessing ? "Processing Documents..." : "Process Documents"}
          </Button>
        </div>

        {isProcessing && <ProcessingStatus />}

        {error && (
          <Card className="border-red-500/50 bg-red-50 mb-8">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Preview & Payment Section */}
        {processedDocument && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border border-tiber/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-tiber">Document Preview</CardTitle>
                  <CardDescription className="text-sage">
                    Free preview - Pay to download the processed document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PDFPreview document={processedDocument} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border border-tiber/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-tiber">Payment</CardTitle>
                  <CardDescription className="text-sage">
                    Pay securely to download your processed document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentSection
                    quote={quote}
                    phoneNumber={phoneNumber}
                    onPhoneNumberChange={setPhoneNumber}
                    email={email}
                    onEmailChange={setEmail}
                    onPayment={initiatePayment}
                    paymentStatus={paymentStatus}
                    paymentData={paymentData}
                  />
                </CardContent>
              </Card>

              {paymentStatus === "success" && paymentData && (
                <Card className="bg-white/80 backdrop-blur-sm border border-tiber/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-tiber">Download Document</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DownloadSection
                      processedDocument={processedDocument}
                      paymentData={paymentData}
                      documents={documents}
                      features={features}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
