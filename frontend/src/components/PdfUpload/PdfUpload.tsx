import { AlertCircle, FileText, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UploadedFile {
  id: string
  file: File
  uploadedAt: Date
}

export function PdfUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      toast.error(`${rejectedFiles.length} file(s) were rejected. Only PDF files are allowed.`)
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        uploadedAt: new Date(),
      }))

      setUploadedFiles(prev => [...prev, ...newFiles])

      toast.success(`${acceptedFiles.length} PDF file(s) added successfully.`)
    }
  }, [])

  const removeFile = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId)
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
    if (file) {
      toast.info(`${file.file.name} removed.`)
    }
  }

  const clearAllFiles = () => {
    setUploadedFiles([])
    toast.info('All files cleared.')
  }

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB limit
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return date.toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload PDF Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragActive && !isDragReject
                ? 'border-primary bg-primary/5 scale-[1.02]'
                : isDragReject
                ? 'border-destructive bg-destructive/5'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/25'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className={`rounded-full p-4 ${
                isDragActive && !isDragReject
                  ? 'bg-primary/10'
                  : isDragReject
                  ? 'bg-destructive/10'
                  : 'bg-muted'
              }`}>
                {isDragReject ? (
                  <AlertCircle className="h-8 w-8 text-destructive" />
                ) : (
                  <Upload className={`h-8 w-8 ${
                    isDragActive ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                )}
              </div>
              
              {isDragActive ? (
                isDragReject ? (
                  <div>
                    <p className="text-lg font-medium text-destructive">Invalid file type</p>
                    <p className="text-sm text-muted-foreground">Only PDF files are accepted</p>
                  </div>
                ) : (
                  <p className="text-lg font-medium text-primary">Drop the PDF files here...</p>
                )
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    Drag & drop PDF files here, or click to select
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Maximum file size: 10MB per file
                  </p>
                  <Button variant="secondary" size="sm" className="mt-2">
                    <FileText className="mr-2 h-4 w-4" />
                    Choose Files
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Supported format: PDF files only. Maximum size: 10MB per file.
        </AlertDescription>
      </Alert>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFiles}
                className="text-destructive hover:text-destructive"
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map(uploadedFile => (
                <div
                  key={uploadedFile.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/25 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">
                        {uploadedFile.file.name}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadedFile.id)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatFileSize(uploadedFile.file.size)}</span>
                      <span>Added: {formatDate(uploadedFile.uploadedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}