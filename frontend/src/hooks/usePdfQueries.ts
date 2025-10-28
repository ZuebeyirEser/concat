import { Query, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { type ApiError } from '@/client'
import { OpenAPI } from '@/client/core/OpenAPI'
import { request } from '@/client/core/request'
import { handleError } from '@/utils'


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
    id: number
    document_id: number
    store_name?: string
    store_address?: string
    store_phone?: string
    receipt_number?: string
    cashier_id?: string
    register_number?: string
    transaction_date?: string
    transaction_time?: string
    subtotal?: number
    tax_amount?: number
    total_amount?: number
    payment_method?: string
    items?: Array<{
      name: string
      price: number
      quantity?: number
      tax_code?: string
      weight_kg?: number
      price_per_kg?: number
      unit_type?: string
      is_discount?: boolean
      original_price?: number
      discount_amount?: number
    }>
    tax_breakdown?: Record<string, {
      code: string
      rate_percent: number
      net_amount: number
      tax_amount: number
      gross_amount: number
    }>
    extraction_confidence?: number
    extra_metadata?: Record<string, any>
    created_at: string
    updated_at: string
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
    staleTime: 0,
    refetchInterval: (query: Query<PDFProcessingStatus, Error>) => {
      const data = query.state.data as PDFProcessingStatus | undefined
      
      const dataUpdatedAt = query.state.dataUpdatedAt || 0
      const now = Date.now()
      const timeElapsed = now - dataUpdatedAt
      
      if (timeElapsed > 5 * 60 * 1000) { // 5 min
        return false
      }
      
      return data?.processed ? false : 2000 
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
      queryClient.invalidateQueries({ queryKey: ['pdf-documents'] })
    },
    onError: (err: ApiError) => {
      handleError(err)
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
      queryClient.invalidateQueries({ queryKey: ['pdf-documents'] })
    },
    onError: (err: ApiError) => {
      handleError(err)
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
      queryClient.invalidateQueries({ queryKey: ['pdf-document', documentId] })
      queryClient.invalidateQueries({ queryKey: ['pdf-processing-status', documentId] })
      queryClient.invalidateQueries({ queryKey: ['pdf-documents'] })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })
}


