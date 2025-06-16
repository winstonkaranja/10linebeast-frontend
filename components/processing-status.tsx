"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, Zap } from "lucide-react"

export function ProcessingStatus() {
  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-auto px-3">
      <Card className="bg-white dark:bg-black border border-black dark:border-white shadow-2xl">
        <CardContent className="pt-4 pb-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-black dark:text-white" />
              <span className="font-medium text-black dark:text-white text-sm">Processing your documents...</span>
            </div>

            <Progress value={75} className="w-full h-2" />

            <div className="flex items-center gap-2 text-xs text-black/70 dark:text-white/70">
              <Zap className="h-3 w-3" />
              <span>Advanced processing engine optimizing documents</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
