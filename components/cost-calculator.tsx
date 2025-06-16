"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calculator, FileText, DollarSign } from "lucide-react"

interface Quote {
  total_pages: number
  total_cost: number
  currency: string
  cost_breakdown: string
}

interface CostCalculatorProps {
  quote: Quote
}

export function CostCalculator({ quote }: CostCalculatorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-tiber">
        <Calculator className="h-5 w-5 text-tiber" />
        Cost Breakdown
      </div>

      <Card className="bg-white/60 backdrop-blur-sm border border-tiber/30 shadow-lg">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-cream rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-tiber" />
                <span className="font-medium text-tiber">Total Pages:</span>
              </div>
              <Badge className="bg-sage text-white">{quote.total_pages}</Badge>
            </div>

            <div className="text-center p-6 bg-cream rounded-xl">
              <p className="text-sm mb-4 text-sage">{quote.cost_breakdown}</p>
              <div className="flex items-center justify-center gap-3">
                <DollarSign className="h-8 w-8 text-sage" />
                <span className="text-4xl font-bold text-tiber">
                  {quote.total_cost} {quote.currency}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-center text-sage">Pricing: 1 KSH per page per feature applied</div>
    </div>
  )
}
