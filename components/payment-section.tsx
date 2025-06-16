"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react"

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

interface PaymentSectionProps {
  quote: Quote | null
  onPayment: () => void
  paymentStatus: "idle" | "processing" | "success" | "failed"
  paymentData: PaymentData | null
}

export function PaymentSection({
  quote,
  onPayment,
  paymentStatus,
  paymentData,
}: PaymentSectionProps) {

  if (!quote) {
    return (
      <div className="text-center py-8 text-sage">
        <CreditCard className="h-12 w-12 mx-auto mb-4 text-sage" />
        <p>Upload documents to see payment options</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cost Summary */}
      <Card className="bg-white/60 backdrop-blur-sm border border-tiber/30 shadow-lg">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-3 text-tiber">
              {quote.total_cost} {quote.currency}
            </div>
            <p className="text-sm text-sage">{quote.cost_breakdown}</p>
          </div>
        </CardContent>
      </Card>

      {/* Simple Payment Info */}
      <div className="text-center space-y-2">
        <p className="text-sage">
          Pay securely with Card, M-Pesa, or Bank Transfer
        </p>
        <p className="text-xs text-sage">
          Powered by Paystack - Enter payment details in the popup
        </p>
      </div>

      {/* Simple Payment Button */}
      <Button
        onClick={onPayment}
        disabled={paymentStatus === "processing"}
        className="w-full text-white font-semibold bg-tiber hover:bg-tiber/90 shadow-lg hover:shadow-xl transition-all duration-300"
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
            Pay {quote.total_cost} {quote.currency}
          </>
        )}
      </Button>

      {/* Payment Status */}
      {paymentStatus !== "idle" && (
        <Card
          className={`border-l-4 ${
            paymentStatus === "success"
              ? "border-l-green-500 bg-green-50"
              : paymentStatus === "failed"
                ? "border-l-red-500 bg-red-50"
                : "border-l-yellow-500 bg-yellow-50"
          }`}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              {paymentStatus === "success" && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Payment Successful!</p>
                    {paymentData && (
                      <p className="text-sm text-green-600">Reference: {paymentData.payment_reference}</p>
                    )}
                  </div>
                </>
              )}
              {paymentStatus === "failed" && (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Payment Failed</p>
                    <p className="text-sm text-red-600">Please try again</p>
                  </div>
                </>
              )}
              {paymentStatus === "processing" && (
                <>
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">Payment Processing</p>
                    <p className="text-sm text-yellow-600">Complete payment in the popup window</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Info */}
      <div className="text-xs space-y-1 text-sage">
        <p>• Secure payment powered by Paystack</p>
        <p>• Supports card payments, bank transfers, and mobile money</p>
        <p>• Download will be available immediately after payment</p>
      </div>
    </div>
  )
}
