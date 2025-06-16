"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, X, GripVertical } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface Document {
  filename: string
  content: string
  order: number
  file: File
}

interface FileUploadProps {
  onFilesSelected: (files: Document[]) => void
}

export function FileUpload({ onFilesSelected }: FileUploadProps) {
  const [files, setFiles] = useState<Document[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

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

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsProcessing(true)

      try {
        const newFiles: Document[] = []

        for (let i = 0; i < acceptedFiles.length; i++) {
          const file = acceptedFiles[i]
          const base64Content = await fileToBase64(file)

          newFiles.push({
            filename: file.name,
            content: base64Content,
            order: files.length + i + 1,
            file,
          })
        }

        const updatedFiles = [...files, ...newFiles]
        setFiles(updatedFiles)
        onFilesSelected(updatedFiles)
      } catch (error) {
        console.error("Error processing files:", error)
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
    <Card className="bg-white/90 backdrop-blur-sm border border-tiber/20 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-tiber text-xl">Document Workspace</CardTitle>
        <p className="text-sage text-sm">Upload and organize your PDF documents</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area - MS Word Style */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Upload Drop Zone */}
          <div className="flex-1">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-300 text-center ${
                isDragActive
                  ? "border-sage bg-sage/10 scale-[1.02]"
                  : "border-tiber/30 hover:border-tiber/50 hover:bg-tiber/5"
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="p-3 bg-tiber rounded-full inline-block">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                {isDragActive ? (
                  <div>
                    <p className="text-lg font-medium text-sage">Drop PDF files here...</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-tiber mb-2">Drag & drop PDF files here</p>
                    <p className="text-sm text-sage mb-4">or click to browse files</p>
                    <Button variant="outline" className="border-tiber text-tiber hover:bg-tiber hover:text-white">
                      Browse Files
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {isProcessing && (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-tiber"></div>
                  <span className="text-sage">Processing files...</span>
                </div>
              </div>
            )}
          </div>

          {/* Document Workspace - MS Word Style */}
          <div className="flex-1">
            <div className="bg-cream/50 border-2 border-dashed border-tiber/20 rounded-xl p-6 min-h-[300px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-tiber">Document Queue ({files.length})</h3>
                {files.length > 0 && <p className="text-sm text-sage">Drag to reorder</p>}
              </div>

              <div className="space-y-3">
                {files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <FileText className="h-12 w-12 text-tiber/30 mb-3" />
                    <p className="text-sage">Your documents will appear here</p>
                    <p className="text-sm text-sage/70">Ready for processing</p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="files">
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`space-y-2 min-h-[200px] ${
                            snapshot.isDraggingOver ? "bg-sage/10 rounded-lg p-2" : ""
                          }`}
                        >
                          {files.map((file, index) => (
                            <Draggable key={file.filename} draggableId={file.filename} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm transition-all duration-200 cursor-grab active:cursor-grabbing ${
                                    snapshot.isDragging
                                      ? "shadow-lg scale-105 rotate-1 border-sage"
                                      : "hover:shadow-md border-tiber/20 hover:cursor-grab"
                                  }`}
                                >
                                  <div className="p-1 rounded hover:bg-tiber/10">
                                    <GripVertical className="h-4 w-4 text-sage" />
                                  </div>

                                  <div className="p-2 bg-tiber rounded">
                                    <FileText className="h-4 w-4 text-white" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-tiber truncate text-sm">{file.filename}</p>
                                    <p className="text-xs text-sage">
                                      {formatFileSize(file.file.size)} • Position: {file.order}
                                    </p>
                                  </div>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
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
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
