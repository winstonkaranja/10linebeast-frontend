"use client"

import { useState, useCallback, useEffect } from "react"
import toast, { Toaster } from "react-hot-toast"
import { FileUpload } from "@/components/file-upload"
import { ProcessingOptions } from "@/components/processing-options"
import { ProcessingStatus } from "@/components/processing-status"
import { PDFPreview } from "@/components/pdf-preview"
import { DownloadSection } from "@/components/download-section"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Footer } from "@/components/footer"

interface Document {
  filename: string
  content: string
  order: number
  file: File
  pageCount: number
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

// Backend API response types - Supporting multiple formats
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

// Alternative response format - direct document response
interface DirectDocumentResponse {
  filename: string
  content: string
  pages: number
  features_applied: string[]
  processing_time_seconds: number
  from_cache: boolean
}

interface BackendErrorResponse {
  detail: string
  error?: string
  message?: string
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
  const [error, setError] = useState<string | null>(null)
  const [downloadTimer, setDownloadTimer] = useState<number>(0)
  const [showDownloadButton, setShowDownloadButton] = useState(false)
  const [autoDownloadFailed, setAutoDownloadFailed] = useState(false)

  // Auto-download function
  const autoDownload = async () => {
    if (!processedDocument || !paymentData) return
    
    try {
      console.log("Starting auto-download...")
      const byteCharacters = atob(processedDocument.content)
      const byteArray = new Uint8Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i)
      }
      const blob = new Blob([byteArray], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = processedDocument.filename
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success("Download started successfully!")
      setAutoDownloadFailed(false)
    } catch (error) {
      console.error("Auto-download failed:", error)
      toast.error("Auto-download failed. Use the download button instead.")
      setAutoDownloadFailed(true)
    }
  }

  // Download timer effect - now triggers auto-download
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (downloadTimer > 0) {
      interval = setInterval(() => {
        setDownloadTimer((prev) => {
          if (prev <= 1) {
            // Timer finished - trigger auto-download
            autoDownload()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [downloadTimer, processedDocument, paymentData])

  const handleFilesSelected = useCallback(
    (files: Document[]) => {
      setDocuments(files)
      // Don't clear processed document here - let user decide with back button
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
    // Calculate total pages from actual page counts
    const totalPages = docs.reduce((sum, doc) => sum + doc.pageCount, 0)

    // Count selected features
    const selectedFeaturesCount = Object.values(selectedFeatures).filter(Boolean).length

    // Calculate cost: 1 KSH per page per feature
    const totalCost = totalPages * selectedFeaturesCount

    const newQuote: Quote = {
      total_pages: totalPages,
      total_cost: totalCost,
      currency: "KSH",
      cost_breakdown: `${totalPages} pages × ${selectedFeaturesCount} features × 1 KSH`,
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
    const startTime = Date.now()

    try {
      console.log("🚀 Processing documents...")
      console.log("Documents count:", documents.length)
      console.log("Features:", features)

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

      console.log("Request body structure:", {
        documentsCount: requestBody.documents.length,
        features: requestBody.features,
        firstDocumentInfo: requestBody.documents[0] ? {
          filename: requestBody.documents[0].filename,
          contentLength: requestBody.documents[0].content.length,
          order: requestBody.documents[0].order
        } : null
      })

      // Optimized fetch with shorter timeout for faster responses
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout - more reasonable

      const response = await fetch("https://web-production-fb32b.up.railway.app/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime
      console.log(`⚡ Response received in ${responseTime}ms (${response.status})`)

      if (!response.ok) {
        // Handle error response
        let errorMessage = `HTTP ${response.status}: Processing failed`
        try {
          const responseText = await response.text()
          console.log("Raw error response:", responseText)
          
          // Try to parse as JSON
          try {
            const errorResponse: BackendErrorResponse = JSON.parse(responseText)
            console.log("Parsed error response:", errorResponse)
            errorMessage = errorResponse.detail || errorResponse.error || errorResponse.message || errorMessage
          } catch {
            // If it's not JSON, use the raw text
            if (responseText) {
              errorMessage = `${errorMessage}. Response: ${responseText.substring(0, 200)}`
            }
          }
        } catch (readError) {
          console.log("Could not read error response body")
        }
        throw new Error(errorMessage)
      }

      // Handle success response - support multiple formats
      let result
      try {
        const responseText = await response.text()
        console.log("Raw response text length:", responseText.length)
        console.log("Raw response first 200 chars:", responseText.substring(0, 200))
        
        // Check if the response is already parsed or if it's a string
        if (typeof responseText === 'string') {
          result = JSON.parse(responseText)
          console.log("Parsed JSON from string response")
        } else {
          result = responseText
          console.log("Response was already parsed")
        }
        
        console.log("Final result type:", typeof result)
        console.log("Result is array:", Array.isArray(result))
        
        if (result && typeof result === 'object' && !Array.isArray(result)) {
          console.log("Response keys:", Object.keys(result))
          console.log("Has success property:", 'success' in result)
          console.log("Has processed_document property:", 'processed_document' in result)
        } else {
          console.log("Result value:", result)
        }
        
        console.log("Success response:", result)
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError)
        throw new Error("Invalid JSON response from server")
      }

      try {
        console.log("Before extraction - result type:", typeof result)
        console.log("Before extraction - is array:", Array.isArray(result))
        console.log("Before extraction - is object:", typeof result === 'object' && result !== null)
        
        if (typeof result === 'string') {
          console.log("Result is still a string, attempting to parse it again...")
          result = JSON.parse(result)
          console.log("Re-parsed result type:", typeof result)
        }
        
        const processedDoc = extractProcessedDocument(result)
        setProcessedDocument(processedDoc)
        const totalTime = Date.now() - startTime
        console.log(`✅ Processing completed in ${totalTime}ms`)
        toast.success(`Documents processed in ${totalTime}ms!`)
      } catch (extractError) {
        // Log the actual response for debugging
        console.error("Unexpected response format:", result)
        console.error("Extraction error:", extractError)
        throw extractError
      }
    } catch (err) {
      console.error("❌ Processing error:", err)
      let errorMessage = "An error occurred during processing"
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = "Request timed out. Please try again."
        } else if (err.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection and try again."
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const initiatePayment = async () => {
    if (!quote) {
      setError("Quote not available")
      return
    }

    setPaymentStatus("processing")
    setError(null)

    try {
      // Import and use Paystack directly
      console.log("Loading Paystack library...")
      const PaystackPop = (await import("@paystack/inline-js")).default
      
      if (!PaystackPop) {
        throw new Error("Failed to load Paystack library")
      }
      
      console.log("Creating Paystack popup instance...")
      const popup = new PaystackPop()
      
      if (!popup || typeof popup.newTransaction !== 'function') {
        throw new Error("Paystack popup instance is invalid")
      }
      
      // Use a default email - user will enter their details in the Paystack popup
      const defaultEmail = "customer@polihive.com"
      
      const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
      
      console.log("Paystack public key:", publicKey ? "Loaded successfully" : "MISSING")
      
      if (!publicKey) {
        throw new Error("Paystack public key is not configured. Check your .env file and restart the dev server.")
      }
      
      // Validate payment amount
      const amountInKobo = Math.round(quote.total_cost * 100)
      
      if (amountInKobo < 100) {
        throw new Error("Payment amount is too small (minimum 1 KES)")
      }
      
      if (amountInKobo > 100000000) {
        throw new Error("Payment amount is too large (maximum 1,000,000 KES)")
      }
      
      console.log("Initializing Paystack payment with:", {
        amount: amountInKobo,
        currency: "KES",
        email: defaultEmail,
        keyLength: publicKey.length,
        keyPrefix: publicKey.substring(0, 7) + "...",
        keyFull: publicKey, // Temporary - remove this after debugging
        totalCost: quote.total_cost
      })
      
      // Simple frontend-only Paystack popup configuration
      const paymentHandler = () => {
        const paystackPop = new PaystackPop()
        paystackPop.newTransaction({
          key: publicKey,
          email: defaultEmail,
          amount: amountInKobo,
          currency: "KES",
          ref: 'TXN_' + Math.floor((Math.random() * 1000000000) + 1), // Generate unique reference
          channels: ['card', 'bank', 'mobile_money'], // Re-enable mobile money for testing
          metadata: {
            custom_fields: [
              {
                display_name: "Documents",
                variable_name: "documents",
                value: documents.map(doc => doc.filename).join(", ")
              },
              {
                display_name: "Features",
                variable_name: "features", 
                value: Object.keys(features).filter(key => features[key as keyof ProcessingFeatures]).join(", ")
              }
            ]
          },
          callback: function(response: any) {
            // Payment successful
            console.log("Payment successful:", response)
            setPaymentData({
              payment_reference: response.reference,
              access_code: response.reference,
              amount: quote.total_cost,
              message: "Payment successful",
            })
            setPaymentStatus("success")
            setDownloadTimer(3)
            setAutoDownloadFailed(false)
            toast.success("Payment successful! Download starting in 3 seconds...", { duration: 3000 })
          },
          onClose: function() {
            // Payment cancelled or window closed
            console.log("Payment window closed")
            setPaymentStatus("idle")
            toast.error("Payment was cancelled")
          },
          onError: function(error: any) {
            // Handle payment errors gracefully
            console.error("Payment error:", error)
            setPaymentStatus("failed")
            if (error.message && error.message.includes("mobile_money")) {
              toast.error("Mobile money temporarily unavailable. Please try card or bank transfer.")
            } else {
              toast.error("Payment failed. Please try again.")
            }
          }
        })
      }
      
      console.log("About to initialize payment popup")
      
      try {
        // Execute the payment handler
        paymentHandler()
        console.log("Payment popup initialized successfully")
      } catch (popupError) {
        console.error("Error calling newTransaction:", popupError)
        throw new Error(`Failed to initialize payment popup: ${popupError instanceof Error ? popupError.message : 'Unknown error'}`)
      }

    } catch (err) {
      console.error("Payment error:", err)
      setError(err instanceof Error ? err.message : "Payment initiation failed")
      setPaymentStatus("failed")
      toast.error("Payment initiation failed")
    }
  }

  // Manual download function for the download button
  const handleManualDownload = async () => {
    if (!processedDocument || !paymentData) {
      toast.error("No processed document available for download")
      return
    }
    
    try {
      console.log("Starting manual download...")
      const byteCharacters = atob(processedDocument.content)
      const byteArray = new Uint8Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i)
      }
      const blob = new Blob([byteArray], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = processedDocument.filename
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success("Download started!")
    } catch (error) {
      console.error("Manual download failed:", error)
      toast.error("Download failed. Please try again or contact support.")
    }
  }


  // Helper function to validate and extract processed document from response
  const extractProcessedDocument = (response: any): ProcessedDocument => {
    // Format 1: { success: true, processed_document: {...} }
    if (response.success && response.processed_document) {
      return {
        filename: response.processed_document.filename,
        content: response.processed_document.content,
        pages: response.processed_document.pages,
        features_applied: response.processed_document.features_applied || [],
        processing_time_seconds: response.processed_document.processing_time_seconds || 0,
        from_cache: response.processed_document.from_cache || false,
      }
    }
    
    // Format 2: Direct document response { filename: "...", content: "...", pages: 123, ... }
    if (response.filename && response.content && typeof response.pages === 'number') {
      return {
        filename: response.filename,
        content: response.content,
        pages: response.pages,
        features_applied: response.features_applied || [],
        processing_time_seconds: response.processing_time_seconds || 0,
        from_cache: response.from_cache || false,
      }
    }

    // Format 3: Check if it's a nested structure with different key names
    if (response.document && response.document.filename) {
      return {
        filename: response.document.filename,
        content: response.document.content,
        pages: response.document.pages || response.document.page_count || 0,
        features_applied: response.document.features_applied || response.features || [],
        processing_time_seconds: response.document.processing_time_seconds || response.processing_time || 0,
        from_cache: response.document.from_cache || response.cached || false,
      }
    }

    // Format 4: Check for common backend response variations
    if (response.data && response.data.filename) {
      return {
        filename: response.data.filename,
        content: response.data.content,
        pages: response.data.pages || response.data.page_count || 0,
        features_applied: response.data.features_applied || response.data.features || [],
        processing_time_seconds: response.data.processing_time_seconds || response.data.processing_time || 0,
        from_cache: response.data.from_cache || response.data.cached || false,
      }
    }

    // Format 5: Check for direct response with different field names
    if (response.file_content || response.pdf_content) {
      return {
        filename: response.filename || response.file_name || "processed_document.pdf",
        content: response.file_content || response.pdf_content || response.content,
        pages: response.pages || response.page_count || response.total_pages || 1,
        features_applied: response.features_applied || response.applied_features || response.features || [],
        processing_time_seconds: response.processing_time_seconds || response.processing_time || response.duration || 0,
        from_cache: response.from_cache || response.cached || response.is_cached || false,
      }
    }

    // Format 6: Check if response has base64 content without specific wrapper
    if (response.content && (typeof response.content === 'string') && response.content.length > 100) {
      return {
        filename: response.filename || response.name || "processed_document.pdf",
        content: response.content,
        pages: response.pages || response.page_count || 1,
        features_applied: response.features_applied || response.features || [],
        processing_time_seconds: response.processing_time_seconds || response.processing_time || 0,
        from_cache: response.from_cache || response.cached || false,
      }
    }

    // Log detailed response structure for debugging
    console.error("❌ Could not extract document from response:")
    console.error("Response type:", typeof response)
    console.error("Response is array:", Array.isArray(response))
    
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      console.error("Response keys:", Object.keys(response))
      console.error("Full response:", response)
      
      throw new Error(`Invalid response format. Expected document data with filename, content, and pages. 
      
Got response with keys: [${Object.keys(response).join(', ')}]
Response: ${JSON.stringify(response, null, 2).substring(0, 500)}...`)
    } else {
      console.error("Response value:", response)
      console.error("Response length:", response?.length)
      
      throw new Error(`Invalid response format. Expected object with document data but got ${typeof response}${Array.isArray(response) ? ' (array)' : ''}. 
      
Response: ${JSON.stringify(response).substring(0, 500)}...`)
    }
  }


  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-3 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">PoliHive</h1>
            <p className="text-sm text-black/70 dark:text-white/70">Prepare court of appeal documents faster</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto px-3 py-6 w-full">
        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Document Upload/Preview - Left (2 columns) */}
          <div className="lg:col-span-2">
            {!processedDocument ? (
              <FileUpload onFilesSelected={handleFilesSelected} />
            ) : (
              <Card className="bg-white dark:bg-black border border-black dark:border-white">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setProcessedDocument(null)
                        setPaymentStatus("idle")
                        setPaymentData(null)
                        setError(null)
                      }}
                      className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 p-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                      <CardTitle className="text-black dark:text-white">Document Preview</CardTitle>
                      <CardDescription className="text-black/70 dark:text-white/70">
                        Your processed document is ready
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <PDFPreview document={processedDocument} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Processing Options - Right (1 column) */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-black border border-black dark:border-white">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Processing Options</CardTitle>
                <CardDescription className="text-black/70 dark:text-white/70">Select features and process your documents</CardDescription>
              </CardHeader>
              <CardContent>
                <ProcessingOptions 
                  features={features} 
                  onChange={handleFeaturesChange}
                  quote={quote}
                  documentsCount={documents.length}
                  onProcess={processDocuments}
                  onPayment={initiatePayment}
                  onDownload={handleManualDownload}
                  isProcessing={isProcessing}
                  hasProcessedDocument={!!processedDocument}
                  paymentStatus={paymentStatus}
                  downloadTimer={downloadTimer}
                  autoDownloadFailed={autoDownloadFailed}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {error && (
          <Card className="border-red-500 bg-red-50 dark:bg-red-950 mb-6">
            <CardContent className="pt-4 pb-4">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Footer */}
      <Footer />

      {/* Fixed Processing Status */}
      {isProcessing && <ProcessingStatus />}
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--toast-border)',
          },
          success: {
            style: {
              background: '#22c55e',
              color: '#ffffff',
              border: '1px solid #16a34a',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#ffffff',
              border: '1px solid #dc2626',
            },
          },
        }}
      />
    </div>
  )
}
