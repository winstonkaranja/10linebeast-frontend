"use client"

import { useState, useEffect } from "react"

export function Footer() {
  const [processedFiles, setProcessedFiles] = useState(3000013)

  useEffect(() => {
    // Increment counter every 79 seconds
    const interval = setInterval(() => {
      setProcessedFiles((prev) => prev + 1)
    }, 79000) // 79 seconds in milliseconds

    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  return (
    <footer className="w-full py-8 bg-tiber/5 border-t border-tiber/10">
      <div className="container mx-auto px-4 text-center">
        <p className="text-lg font-medium text-tiber">
          Trusted by legal professionals — we've processed over{" "}
          <span className="font-bold text-sage">{formatNumber(processedFiles)}</span> documents
        </p>
        <div className="flex items-center justify-center gap-2 mt-2 opacity-60">
          <div className="w-2 h-2 bg-sage rounded-full animate-pulse"></div>
          <span className="text-xs text-sage">Live counter</span>
        </div>
      </div>
    </footer>
  )
}
