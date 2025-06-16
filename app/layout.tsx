import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import Script from "next/script"

export const metadata: Metadata = {
  title: "PoliHive - Legal Document Processor",
  description: "Professional legal document processing for court appeals",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
      </head>
      <body className="bg-white dark:bg-black text-black dark:text-white transition-colors">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
