import { AlertCircle, Eye, FileText, Loader2, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { ExtractedDataView } from './ExtractedDataView'

interface UploadedFile {
  id: string
  file: File
  uploadedAt: Date
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  documentId?: number
  extractedData?: any
  error?: string
}

export function PdfUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)

  const uploadFile = async (file: File, fileId: string) => {
    try {
      // Update status to uploading
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'uploading', progress: 0 } : f
      ))

      const formData = new FormData()
      formData.append('file', file)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId && f.progress < 90 
            ? { ...f, progress: f.progress + 10 } 
            : f
        ))
      }, 200)

      // Make API call to upload PDF
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/pdf/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()

      // Update status to processing
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              status: 'processing', 
              progress: 100, 
              documentId: result.document_id 
            } 
          : f
      ))

      // Poll for processing completion
      pollProcessingStatus(fileId, result.document_id)

      toast.success(`${file.name} uploaded successfully and is being processed.`)

    } catch (error) {
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed' 
            } 
          : f
      ))
      toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const pollProcessingStatus = async (fileId: string, documentId: number) => {
    const maxAttempts = 120 // 2 minutes max (120 seconds)
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/pdf/documents/${documentId}/status`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to check processing status')
        }

        const status = await response.json()

        if (status.processed) {
          // Get the full document with extracted data
          const docResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/pdf/documents/${documentId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
          })

          if (docResponse.ok) {
            const docData = await docResponse.json()
            setUploadedFiles(prev => prev.map(f => 
              f.id === fileId 
                ? { 
                    ...f, 
                    status: 'completed', 
                    extractedData: docData.extracted_data?.[0] 
                  } 
                : f
            ))
            toast.success('PDF processing completed!')
          }
        } else if (status.processing_error) {
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { 
                  ...f, 
                  status: 'error', 
                  error: status.processing_error 
                } 
              : f
          ))
          toast.error('PDF processing failed')
        } else if (attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 1000) // Poll every second
        } else {
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { 
                  ...f, 
                  status: 'error', 
                  error: 'Processing timeout' 
                } 
              : f
          ))
          toast.error('PDF processing timed out')
        }
      } catch (error) {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { 
                ...f, 
                status: 'error', 
                error: 'Failed to check processing status' 
              } 
            : f
        ))
      }
    }

    poll()
  }

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
        status: 'uploading' as const,
        progress: 0,
      }))

      setUploadedFiles(prev => [...prev, ...newFiles])

      // Start uploading each file
      newFiles.forEach(({ file, id }) => {
        uploadFile(file, id)
      })
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
                  className="p-4 border rounded-lg hover:bg-muted/25 transition-colors space-y-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        uploadedFile.status === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900/20'
                          : uploadedFile.status === 'error'
                          ? 'bg-red-100 dark:bg-red-900/20'
                          : uploadedFile.status === 'processing'
                          ? 'bg-blue-100 dark:bg-blue-900/20'
                          : 'bg-yellow-100 dark:bg-yellow-900/20'
                      }`}>
                        {uploadedFile.status === 'uploading' || uploadedFile.status === 'processing' ? (
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                        ) : uploadedFile.status === 'error' ? (
                          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        ) : (
                          <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">
                          {uploadedFile.file.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            uploadedFile.status === 'completed' ? 'default' :
                            uploadedFile.status === 'error' ? 'destructive' :
                            uploadedFile.status === 'processing' ? 'secondary' : 'outline'
                          }>
                            {uploadedFile.status === 'uploading' ? 'Uploading' :
                             uploadedFile.status === 'processing' ? 'Processing' :
                             uploadedFile.status === 'completed' ? 'Completed' : 'Error'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(uploadedFile.id)}
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatFileSize(uploadedFile.file.size)}</span>
                        <span>Added: {formatDate(uploadedFile.uploadedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar for uploading */}
                  {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
                    <Progress value={uploadedFile.progress} className="w-full" />
                  )}

                  {/* Error message */}
                  {uploadedFile.status === 'error' && uploadedFile.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{uploadedFile.error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Extracted data preview */}
                  {uploadedFile.status === 'completed' && uploadedFile.extractedData && (
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Extracted Data</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedFile(uploadedFile)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        {uploadedFile.extractedData.store_name && (
                          <div>
                            <span className="text-muted-foreground">Store:</span>
                            <p className="font-medium">{uploadedFile.extractedData.store_name}</p>
                          </div>
                        )}
                        {uploadedFile.extractedData.total_amount && (
                          <div>
                            <span className="text-muted-foreground">Total:</span>
                            <p className="font-medium">€{uploadedFile.extractedData.total_amount}</p>
                          </div>
                        )}
                        {uploadedFile.extractedData.transaction_date && (
                          <div>
                            <span className="text-muted-foreground">Date:</span>
                            <p className="font-medium">{uploadedFile.extractedData.transaction_date}</p>
                          </div>
                        )}
                        {uploadedFile.extractedData.payment_method && (
                          <div>
                            <span className="text-muted-foreground">Payment:</span>
                            <p className="font-medium">{uploadedFile.extractedData.payment_method}</p>
                          </div>
                        )}
                      </div>
                      {uploadedFile.extractedData.items && uploadedFile.extractedData.items.length > 0 && (
                        <div>
                          <span className="text-muted-foreground text-xs">Items:</span>
                          <p className="font-medium text-xs">{uploadedFile.extractedData.items.length} items found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extracted Data Dialog */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Extracted Data - {selectedFile?.file.name}
            </DialogTitle>
          </DialogHeader>
          {selectedFile?.extractedData && (
            <ExtractedDataView data={selectedFile.extractedData} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}