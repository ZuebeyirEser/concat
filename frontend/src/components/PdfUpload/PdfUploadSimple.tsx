import { AlertCircle, FileText, Upload } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { usePdfUpload } from '@/hooks/usePdfQueries'
import { ExtractedDataView } from './ExtractedDataView'
import { UploadingFileItem } from './UploadingFileItem'

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


