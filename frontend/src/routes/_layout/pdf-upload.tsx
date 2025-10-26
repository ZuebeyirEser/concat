import { PdfUploadSimple } from '@/components/PdfUpload/PdfUploadSimple'
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/_layout/pdf-upload')({
  component: PdfUploadPage,
})

function PdfUploadPage() {
  return (
    <div className="w-full max-w-full">
      <h1 className="pt-12 text-2xl font-bold">PDF Upload</h1>
      <p className="text-muted-foreground mb-6">
        Upload and manage your PDF documents
      </p>
      <PdfUploadSimple />
    </div>
  )
}