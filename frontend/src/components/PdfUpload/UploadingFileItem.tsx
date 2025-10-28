import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Eye, FileText, Loader2, X } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getPdfDocumentQueryOptions, usePdfProcessingStatus } from '@/hooks/usePdfQueries'
import { formatDate, formatFileSize } from '@/utils/formatters'

interface UploadingFile {
  id: string
  file: File
  uploadedAt: Date
  documentId?: number
}

interface UploadingFileItemProps {
  file: UploadingFile
  onRemove: () => void
  onViewDetails: (document: any) => void
}

export function UploadingFileItem({ 
  file, 
  onRemove, 
  onViewDetails
}: UploadingFileItemProps) {
  // Use processing status query if we have a document ID
  const { data: statusData, isLoading: statusLoading, error: statusError } = usePdfProcessingStatus(
    file.documentId!,
    !!file.documentId
  )

  // Use document query to get full data when processing is complete
  const { data: documentData, error: documentError } = useQuery({
    ...getPdfDocumentQueryOptions(file.documentId!),
    enabled: !!file.documentId && statusData?.processed
  })

  // Reprocess mutation - temporarily disabled
  // const reprocessMutation = usePdfReprocess()

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

      {/* Error message or stuck processing */}
      {status === 'error' && statusData?.processing_error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {statusData.processing_error}
            {file.documentId && (
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => {
                  // Temporarily disabled - reprocessMutation.mutate(file.documentId!)
                  console.log('Reprocess clicked for document:', file.documentId)
                }}
                disabled={false}
              >
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Show reprocess option if stuck in processing for too long */}
      {status === 'processing' && file.documentId && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Processing is taking longer than usual...</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Temporarily disabled - reprocessMutation.mutate(file.documentId!)
              console.log('Retry processing clicked for document:', file.documentId)
            }}
            disabled={false}
          >
            Retry Processing
          </Button>
        </div>
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