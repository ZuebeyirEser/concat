import { createFileRoute } from '@tanstack/react-router'
import { Calendar, CreditCard, Eye, FileText, Search, Store, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { ExtractedDataView } from '@/components/PdfUpload/ExtractedDataView'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { usePdfDelete, usePdfDocuments } from '@/hooks/usePdfQueries'

export const Route = createFileRoute('/_layout/documents')({
  component: DocumentsPage,
})

interface Document {
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

function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  const { data: documents = [], isLoading: loading } = usePdfDocuments()
  const deleteMutation = usePdfDelete()

  const deleteDocument = (documentId: number) => {
    deleteMutation.mutate(documentId)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const filteredDocuments = documents.filter(doc =>
    doc.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.extracted_data?.[0]?.store_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="w-full max-w-full">
        <h1 className="pt-12 text-2xl font-bold">Documents</h1>
        <p className="text-muted-foreground mb-6">Loading your documents...</p>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full">
      <div className="flex items-center justify-between pt-12 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground">
            Manage your uploaded PDF documents and extracted data
          </p>
        </div>
        <Badge variant="secondary">
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents by filename or store name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'No matching documents' : 'No documents yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Upload your first PDF document to get started'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => window.location.href = '/pdf-upload'}>
                  Upload Document
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map(document => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        document.processed 
                          ? 'bg-green-100 dark:bg-green-900/20'
                          : document.processing_error
                          ? 'bg-red-100 dark:bg-red-900/20'
                          : 'bg-blue-100 dark:bg-blue-900/20'
                      }`}>
                        <FileText className={`h-6 w-6 ${
                          document.processed 
                            ? 'text-green-600 dark:text-green-400'
                            : document.processing_error
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }`} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium truncate">{document.original_filename}</h3>
                        <Badge variant={
                          document.processed ? 'default' :
                          document.processing_error ? 'destructive' : 'secondary'
                        }>
                          {document.processed ? 'Processed' :
                           document.processing_error ? 'Error' : 'Processing'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {formatFileSize(document.file_size)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(document.created_at)}
                        </div>
                        {document.extracted_data?.[0]?.store_name && (
                          <div className="flex items-center gap-1">
                            <Store className="h-3 w-3" />
                            {document.extracted_data[0].store_name}
                          </div>
                        )}
                        {document.extracted_data?.[0]?.total_amount && (
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            {formatCurrency(document.extracted_data[0].total_amount)}
                          </div>
                        )}
                      </div>

                      {document.processing_error && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          Error: {document.processing_error}
                        </p>
                      )}

                      {document.extracted_data?.[0]?.items && (
                        <p className="text-sm text-muted-foreground">
                          {document.extracted_data[0].items.length} items extracted
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {/* Always show View button for debugging */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDocument(document)}
                      disabled={!document.processed}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {document.processed ? 'View' : 'Processing...'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDocument(document.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Document Details Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Document Details - {selectedDocument?.original_filename}
            </DialogTitle>
          </DialogHeader>
          {selectedDocument?.extracted_data?.[0] ? (
            <ExtractedDataView data={selectedDocument.extracted_data[0]} />
          ) : (
            <div className="p-8 text-center">
              <div className="space-y-4">
                <div className="text-muted-foreground">
                  {!selectedDocument?.processed ? (
                    <>
                      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p>Document is still being processed...</p>
                      <p className="text-sm">Please wait while we extract the data from your PDF.</p>
                    </>
                  ) : selectedDocument?.processing_error ? (
                    <>
                      <p className="text-red-600">Processing failed</p>
                      <p className="text-sm">{selectedDocument.processing_error}</p>
                    </>
                  ) : (
                    <>
                      <p>No extracted data available</p>
                      <p className="text-sm">The document was processed but no data could be extracted.</p>
                    </>
                  )}
                </div>
                
                {/* Debug info */}
                <details className="text-left text-xs text-muted-foreground">
                  <summary className="cursor-pointer">Debug Info</summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify({
                      processed: selectedDocument?.processed,
                      processing_error: selectedDocument?.processing_error,
                      has_extracted_data: !!selectedDocument?.extracted_data?.length,
                      extracted_data_count: selectedDocument?.extracted_data?.length || 0
                    }, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}