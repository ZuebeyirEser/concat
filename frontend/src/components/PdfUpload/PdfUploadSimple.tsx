import { AlertCircle, Eye, FileText, Loader2, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { usePdfDocument, usePdfProcessingStatus, usePdfUpload } from '@/hooks/usePdfQueries'
import { ExtractedDataView } from './ExtractedDataView'

interface UploadingFile {
  id: string
  file: File
  uploadedAt: Date
  documentId?: number
}

export function PdfUploadSimple() {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  
  const uploadMutation = usePdfUpload()

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      // Toast is handled by the mutation
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        uploadedAt: new Date(),
      }))

      setUploadingFiles(prev => [...prev, ...newFiles])

      // Upload each file
      newFiles.forEach(({ file, id }) => {
        uploadMutation.mutate(file, {
          onSuccess: (data) => {
            // Update the file with document ID
            setUploadingFiles(prev => prev.map(f => 
              f.id === id ? { ...f, documentId: data.document_id } : f
            ))
          },
          onError: () => {
            // Remove failed file
            setUploadingFiles(prev => prev.filter(f => f.id !== id))
          }
        })
      })
    }
  }, [uploadMutation])

  const removeFile = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const clearAllFiles = () => {
    setUploadingFiles([])
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

      {/* Uploading Files List */}
      {uploadingFiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Uploading Files ({uploadingFiles.length})</CardTitle>
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
              {uploadingFiles.map(uploadingFile => (
                <UploadingFileItem
                  key={uploadingFile.id}
                  file={uploadingFile}
                  onRemove={() => removeFile(uploadingFile.id)}
                  onViewDetails={setSelectedDocument}
                  formatFileSize={formatFileSize}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Details Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Document Details - {selectedDocument?.original_filename}
            </DialogTitle>
          </DialogHeader>
          {selectedDocument?.extracted_data?.[0] && (
            <ExtractedDataView data={selectedDocument.extracted_data[0]} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface UploadingFileItemProps {
  file: UploadingFile
  onRemove: () => void
  onViewDetails: (document: any) => void
  formatFileSize: (bytes: number) => string
  formatDate: (date: Date) => string
}

function UploadingFileItem({ 
  file, 
  onRemove, 
  onViewDetails, 
  formatFileSize, 
  formatDate 
}: UploadingFileItemProps) {
  // Use processing status query if we have a document ID
  const { data: statusData, isLoading: statusLoading } = usePdfProcessingStatus(
    file.documentId!,
    !!file.documentId
  )
  
  // Use document query to get full data when processing is complete
  const { data: documentData } = usePdfDocument(
    file.documentId!,
    // Only fetch when processing is complete
    { enabled: !!file.documentId && statusData?.processed }
  )

  const getStatus = () => {
    if (!file.documentId) return 'uploading'
    if (statusLoading) return 'processing'
    if (statusData?.processing_error) return 'error'
    if (statusData?.processed) return 'completed'
    return 'processing'
  }

  const status = getStatus()
  const progress = status === 'uploading' ? 50 : status === 'processing' ? 75 : 100

  return (
    <div className="p-4 border rounded-lg hover:bg-muted/25 transition-colors space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
            status === 'completed' 
              ? 'bg-green-100 dark:bg-green-900/20'
              : status === 'error'
              ? 'bg-red-100 dark:bg-red-900/20'
              : 'bg-blue-100 dark:bg-blue-900/20'
          }`}>
            {status === 'uploading' || status === 'processing' ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
            ) : status === 'error' ? (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            ) : (
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium truncate">
              {file.file.name}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant={
                status === 'completed' ? 'default' :
                status === 'error' ? 'destructive' :
                'secondary'
              }>
                {status === 'uploading' ? 'Uploading' :
                 status === 'processing' ? 'Processing' :
                 status === 'completed' ? 'Completed' : 'Error'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{formatFileSize(file.file.size)}</span>
            <span>Added: {formatDate(file.uploadedAt)}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {status !== 'completed' && status !== 'error' && (
        <Progress value={progress} className="w-full" />
      )}

      {/* Error message */}
      {status === 'error' && statusData?.processing_error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{statusData.processing_error}</AlertDescription>
        </Alert>
      )}

      {/* Extracted data preview */}
      {status === 'completed' && documentData?.extracted_data?.[0] && (
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Extracted Data</h4>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewDetails(documentData)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            {documentData.extracted_data[0].store_name && (
              <div>
                <span className="text-muted-foreground">Store:</span>
                <p className="font-medium">{documentData.extracted_data[0].store_name}</p>
              </div>
            )}
            {documentData.extracted_data[0].total_amount && (
              <div>
                <span className="text-muted-foreground">Total:</span>
                <p className="font-medium">€{documentData.extracted_data[0].total_amount}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}