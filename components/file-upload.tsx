"use client"

import { useState, useCallback } from "react"
import toast from "react-hot-toast"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, X, GripVertical } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { PDFDocument } from "pdf-lib"

interface Document {
  filename: string
  content: string
  order: number
  file: File
  pageCount: number
}

interface FileUploadProps {
  onFilesSelected: (files: Document[]) => void
}

export function FileUpload({ onFilesSelected }: FileUploadProps) {
  const [files, setFiles] = useState<Document[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<string>("")

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(",")[1])
      }
      reader.onerror = reject
    })
  }

  const getPDFPageCount = async (file: File): Promise<number> => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      return pdfDoc.getPageCount()
    } catch (error) {
      console.error("Error counting PDF pages:", error)
      return 1 // Default to 1 page if counting fails
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsProcessing(true)
      setProcessingStatus("")

      try {
        const newFiles: Document[] = []

        for (let i = 0; i < acceptedFiles.length; i++) {
          const file = acceptedFiles[i]
          setProcessingStatus(`Processing ${file.name} (${i + 1}/${acceptedFiles.length})...`)
          
          const [base64Content, pageCount] = await Promise.all([
            fileToBase64(file),
            getPDFPageCount(file)
          ])

          newFiles.push({
            filename: file.name,
            content: base64Content,
            order: files.length + i + 1,
            file,
            pageCount,
          })
        }

        const updatedFiles = [...files, ...newFiles]
        setFiles(updatedFiles)
        onFilesSelected(updatedFiles)
        setProcessingStatus("")
        
        const totalPages = newFiles.reduce((sum, file) => sum + file.pageCount, 0)
        toast.success(`Added ${newFiles.length} documents (${totalPages} pages)`, { duration: 2000 })
      } catch (error) {
        console.error("Error processing files:", error)
        const errorMessage = "Error processing files. Please try again."
        setProcessingStatus(errorMessage)
        toast.error(errorMessage, { duration: 3000 })
        setTimeout(() => setProcessingStatus(""), 2000)
      } finally {
        setIsProcessing(false)
      }
    },
    [files, onFilesSelected],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
  })

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index).map((file, i) => ({ ...file, order: i + 1 }))
    setFiles(updatedFiles)
    onFilesSelected(updatedFiles)
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(files)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const reorderedFiles = items.map((file, index) => ({
      ...file,
      order: index + 1,
    }))

    setFiles(reorderedFiles)
    onFilesSelected(reorderedFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Card className="bg-white dark:bg-black border border-black dark:border-white">
      <CardHeader className="text-center">
        <CardTitle className="text-black dark:text-white text-xl">Document Workspace</CardTitle>
        <p className="text-black/70 dark:text-white/70 text-sm">Upload and organize your PDF documents</p>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          /* Upload Area - Only shown when no files */
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-300 text-center ${
              isDragActive
                ? "border-black dark:border-white bg-gray-50 dark:bg-gray-900 scale-[1.02]"
                : "border-black/30 dark:border-white/30 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-900"
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="p-3 bg-black dark:bg-white rounded-full inline-block">
                <Upload className="h-6 w-6 text-white dark:text-black" />
              </div>
              {isDragActive ? (
                <div>
                  <p className="text-lg font-medium text-black dark:text-white">Drop PDF files here...</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-black dark:text-white mb-2">Drag & drop PDF files here</p>
                  <p className="text-sm text-black/70 dark:text-white/70 mb-4">or click to browse files</p>
                  <Button variant="outline" className="border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black">
                    Browse Files
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Document Queue - Takes full space when files exist */
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-black dark:text-white">Document Queue ({files.length})</h3>
              <p className="text-sm text-black/70 dark:text-white/70">Drag to reorder</p>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="files">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-3 min-h-[400px] ${
                      snapshot.isDraggingOver ? "bg-gray-50 dark:bg-gray-900 rounded-lg p-2" : ""
                    }`}
                  >
                    {files.map((file, index) => (
                      <Draggable key={file.filename} draggableId={file.filename} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`flex items-center gap-3 p-3 bg-white dark:bg-black rounded-lg border transition-all duration-200 cursor-grab active:cursor-grabbing ${
                              snapshot.isDragging
                                ? "shadow-lg scale-105 rotate-1 border-black dark:border-white"
                                : "hover:shadow-md border-black/20 dark:border-white/20 hover:cursor-grab"
                            }`}
                          >
                            <div className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                              <GripVertical className="h-4 w-4 text-black/50 dark:text-white/50" />
                            </div>

                            <div className="p-2 bg-black dark:bg-white rounded">
                              <FileText className="h-4 w-4 text-white dark:text-black" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-black dark:text-white truncate text-sm">{file.filename}</p>
                              <p className="text-xs text-black/70 dark:text-white/70">
                                {formatFileSize(file.file.size)} • {file.pageCount} pages • Position: {file.order}
                              </p>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Upload More Button - Bottom Right */}
            <div className="absolute bottom-4 right-4">
              <div
                {...getRootProps()}
                className="cursor-pointer"
              >
                <input {...getInputProps()} />
                <Button
                  size="sm"
                  className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-lg"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload More
                </Button>
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black dark:border-white"></div>
              <span className="text-black/70 dark:text-white/70">{processingStatus || "Processing files..."}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
