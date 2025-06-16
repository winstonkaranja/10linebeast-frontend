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
    <footer className="w-full mt-auto bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-3 py-4 text-center">
        <p className="text-sm md:text-base font-medium text-black dark:text-white">
          Trusted by legal professionals — we've processed over{" "}
          <span className="font-bold text-black dark:text-white">{formatNumber(processedFiles)}</span> documents
        </p>
        <div className="flex items-center justify-center gap-2 mt-1 opacity-60">
          <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full animate-pulse"></div>
          <span className="text-xs text-black/70 dark:text-white/70">Live counter</span>
        </div>
      </div>
    </footer>
  )
}
