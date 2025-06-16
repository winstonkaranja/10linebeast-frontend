"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, Zap } from "lucide-react"

export function ProcessingStatus() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-tiber/20 shadow-lg mb-8">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-tiber" />
            <span className="font-medium text-tiber">Processing your documents...</span>
          </div>

          <Progress value={75} className="w-full" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-sage">Status:</span>
              <span className="ml-2 font-medium text-tiber">Processing</span>
            </div>
            <div>
              <span className="text-sage">Estimated time:</span>
              <span className="ml-2 font-medium text-tiber">2-3 seconds</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-sage">
            <Zap className="h-4 w-4 text-sage" />
            <span>Our advanced processing engine is optimizing your documents</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
