import { Calendar, CreditCard, MapPin, Phone, Receipt, ShoppingCart, Store } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ExtractedDataViewProps {
  data: {
    store_name?: string
    store_address?: string
    store_phone?: string
    receipt_number?: string
    transaction_date?: string
    transaction_time?: string
    total_amount?: number
    subtotal?: number
    tax_amount?: number
    payment_method?: string
    items?: Array<{
      name: string
      price: number
      quantity?: number
      tax_code?: string
      weight_kg?: number
      price_per_kg?: number
      unit_type?: string
    }>
    tax_breakdown?: Record<string, {
      code: string
      rate_percent: number
      net_amount: number
      tax_amount: number
      gross_amount: number
    }>
    extraction_confidence?: number
  }
}

export function ExtractedDataView({ data }: ExtractedDataViewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatWeight = (weight: number) => {
    return `${weight.toFixed(3)} kg`
  }

  return (
    <div className="space-y-6">
      {/* Store Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Store Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.store_name && (
            <div className="flex items-center gap-3">
              <Store className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{data.store_name}</p>
                <p className="text-sm text-muted-foreground">Store Name</p>
              </div>
            </div>
          )}
          
          {data.store_address && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{data.store_address}</p>
                <p className="text-sm text-muted-foreground">Address</p>
              </div>
            </div>
          )}
          
          {data.store_phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{data.store_phone}</p>
                <p className="text-sm text-muted-foreground">Phone</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Transaction Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {data.receipt_number && (
              <div className="flex items-center gap-3">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{data.receipt_number}</p>
                  <p className="text-sm text-muted-foreground">Receipt #</p>
                </div>
              </div>
            )}
            
            {data.transaction_date && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {data.transaction_date}
                    {data.transaction_time && ` ${data.transaction_time}`}
                  </p>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                </div>
              </div>
            )}
            
            {data.payment_method && (
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{data.payment_method}</p>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {data.subtotal && (
              <div className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(data.subtotal)}</p>
                <p className="text-sm text-muted-foreground">Subtotal</p>
              </div>
            )}
            
            {data.tax_amount && (
              <div className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(data.tax_amount)}</p>
                <p className="text-sm text-muted-foreground">Tax</p>
              </div>
            )}
            
            {data.total_amount && (
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{formatCurrency(data.total_amount)}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            )}
          </div>

          {/* Tax Breakdown */}
          {data.tax_breakdown && Object.keys(data.tax_breakdown).length > 0 && (
            <div className="space-y-2">
              <div className="h-px bg-border w-full" />
              <h4 className="font-medium">Tax Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(data.tax_breakdown).map(([key, tax]) => (
                  <div key={key} className="flex justify-between items-center text-sm">
                    <span>Tax {tax.code} ({tax.rate_percent}%)</span>
                    <div className="text-right">
                      <p>{formatCurrency(tax.tax_amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        on {formatCurrency(tax.net_amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items List */}
      {data.items && data.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Items ({data.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{item.name}</p>
                      {item.tax_code && (
                        <Badge variant="outline" className="text-xs">
                          Tax {item.tax_code}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {item.quantity && item.quantity > 1 && (
                        <span>Qty: {item.quantity}</span>
                      )}
                      
                      {item.weight_kg && (
                        <span>Weight: {formatWeight(item.weight_kg)}</span>
                      )}
                      
                      {item.price_per_kg && (
                        <span>€{item.price_per_kg.toFixed(2)}/kg</span>
                      )}
                      
                      {item.unit_type && (
                        <Badge variant="secondary" className="text-xs">
                          {item.unit_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(item.price)}</p>
                    {item.quantity && item.quantity > 1 && (
                      <p className="text-sm text-muted-foreground">
                        €{(item.price / item.quantity).toFixed(2)} each
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extraction Confidence */}
      {data.extraction_confidence !== undefined && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Extraction Confidence</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${data.extraction_confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {Math.round(data.extraction_confidence * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}