"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { FileStack, Hash, RotateCcw } from "lucide-react"

interface ProcessingFeatures {
  merge_pdfs: boolean
  repaginate: boolean
  tenth_lining: boolean
}

interface ProcessingOptionsProps {
  features: ProcessingFeatures
  onChange: (features: ProcessingFeatures) => void
}

export function ProcessingOptions({ features, onChange }: ProcessingOptionsProps) {
  const handleFeatureChange = (feature: keyof ProcessingFeatures, checked: boolean) => {
    onChange({
      ...features,
      [feature]: checked,
    })
  }

  const options = [
    {
      key: "merge_pdfs" as const,
      label: "Merge PDFs",
      description: "Combine all PDFs into one document",
      icon: FileStack,
    },
    {
      key: "repaginate" as const,
      label: "Add page numbers",
      description: "Sequential page numbering",
      icon: Hash,
    },
    {
      key: "tenth_lining" as const,
      label: "10th line numbering",
      description: "Legal reference line numbers",
      icon: RotateCcw,
    },
  ]

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const Icon = option.icon
        return (
          <Card
            key={option.key}
            className="border border-tiber/20 bg-white/60 hover:bg-white/80 transition-all duration-200 hover:shadow-md"
          >
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start space-x-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={option.key}
                    checked={features[option.key]}
                    onCheckedChange={(checked) => handleFeatureChange(option.key, checked as boolean)}
                    className="w-4 h-4 border-tiber data-[state=checked]:bg-tiber data-[state=checked]:border-tiber"
                  />
                  <div className="p-1.5 bg-sage rounded-lg">
                    <Icon className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <label htmlFor={option.key} className="text-sm font-semibold cursor-pointer block mb-1 text-tiber">
                    {option.label}
                  </label>
                  <p className="text-xs text-sage">{option.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
