import { OpenAPI } from '@/client/core/OpenAPI'
import { request } from '@/client/core/request'
import { Query, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Types for PDF operations
interface PDFDocument {
  id: number
  filename: string
  original_filename: string
  file_size: number
  processed: boolean
  processing_error?: string
  created_at: string
  updated_at: string
  extracted_data?: Array<{
    store_name?: string
    total_amount?: number
    transaction_date?: string
    payment_method?: string
    items?: any[]
    [key: string]: any
  }>
}

interface PDFUploadResponse {
  message: string
  document_id: number
  filename: string
  processing_status: string
}

interface PDFProcessingStatus {
  document_id: number
  processed: boolean
  processing_error?: string
  extraction_confidence?: number
}

// Query Options
export function getPdfDocumentsQueryOptions() {
  return {
    queryKey: ['pdf-documents'],
    queryFn: async (): Promise<PDFDocument[]> => {
      return request(OpenAPI, {
        method: 'GET',
        url: '/api/v1/pdf/documents',
      })
    },
    staleTime: 30 * 1000, // 30 seconds
  }
}

export function getPdfDocumentQueryOptions(documentId: number) {
  return {
    queryKey: ['pdf-document', documentId],
    queryFn: async (): Promise<PDFDocument> => {
      return request(OpenAPI, {
        method: 'GET',
        url: `/api/v1/pdf/documents/${documentId}`,
      })
    },
    staleTime: 60 * 1000, // 1 minute
  }
}

export function getPdfProcessingStatusQueryOptions(documentId: number) {
  return {
    queryKey: ['pdf-processing-status', documentId],
    queryFn: async (): Promise<PDFProcessingStatus> => {
      return request(OpenAPI, {
        method: 'GET',
        url: `/api/v1/pdf/documents/${documentId}/status`,
      })
    },
    staleTime: 0, // Always fresh for status checks
    refetchInterval: (query: Query<PDFProcessingStatus, Error>) => {
      // Stop polling if processed or error
      const data = query.state.data as PDFProcessingStatus | undefined
      return data?.processed ? false : 2000 // Poll every 2 seconds
    },
  }
}

// Custom Hooks
export function usePdfDocuments() {
  return useQuery(getPdfDocumentsQueryOptions())
}

export function usePdfDocument(documentId: number) {
  return useQuery(getPdfDocumentQueryOptions(documentId))
}

export function usePdfProcessingStatus(documentId: number, enabled: boolean = true) {
  return useQuery({
    ...getPdfProcessingStatusQueryOptions(documentId),
    enabled,
  })
}

export function usePdfUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File): Promise<PDFUploadResponse> => {
      const formData = new FormData()
      formData.append('file', file)

      return request(OpenAPI, {
        method: 'POST',
        url: '/api/v1/pdf/upload',
        body: formData,
        mediaType: 'multipart/form-data',
      })
    },
    onSuccess: (data) => {
      toast.success(`${data.filename} uploaded successfully and is being processed.`)
      // Invalidate documents list to show the new document
      queryClient.invalidateQueries({ queryKey: ['pdf-documents'] })
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`)
    },
  })
}

export function usePdfDelete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (documentId: number): Promise<void> => {
      return request(OpenAPI, {
        method: 'DELETE',
        url: `/api/v1/pdf/documents/${documentId}`,
      })
    },
    onSuccess: () => {
      toast.success('Document deleted successfully')
      // Invalidate documents list to remove the deleted document
      queryClient.invalidateQueries({ queryKey: ['pdf-documents'] })
    },
    onError: (error) => {
      toast.error(`Failed to delete document: ${error.message}`)
    },
  })
}

export function usePdfReprocess() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (documentId: number): Promise<void> => {
      return request(OpenAPI, {
        method: 'POST',
        url: `/api/v1/pdf/documents/${documentId}/reprocess`,
      })
    },
    onSuccess: (_, documentId) => {
      toast.success('Document queued for reprocessing')
      // Invalidate specific document and status queries
      queryClient.invalidateQueries({ queryKey: ['pdf-document', documentId] })
      queryClient.invalidateQueries({ queryKey: ['pdf-processing-status', documentId] })
      queryClient.invalidateQueries({ queryKey: ['pdf-documents'] })
    },
    onError: (error) => {
      toast.error(`Failed to reprocess document: ${error.message}`)
    },
  })
}