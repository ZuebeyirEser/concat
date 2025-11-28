import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Package, Zap } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useProduct, useProductPurchases } from '@/hooks/useProductQueries'
import z from 'zod'

export const Route = createFileRoute('/_layout/products/$productId')({
  parseParams: (params) => ({
    productId: z.coerce.number().parse(params.productId),
  }),
  component: ProductDetailsPage,
})

const categoryLabels = {
  fruits: 'Fruits',
  vegetables: 'Vegetables',
  dairy: 'Dairy',
  meat_fish: 'Meat & Fish',
  bakery: 'Bakery',
  pantry: 'Pantry',
  beverages: 'Beverages',
  snacks: 'Snacks',
  frozen: 'Frozen',
  household: 'Household',
  personal_care: 'Personal Care',
  other: 'Other',
}

function ProductDetailsPage() {
  const { productId } = Route.useParams()

  // Fetch product data from API
  const { data: product, isLoading, error } = useProduct(productId)
  const { data: purchases = [] } = useProductPurchases(productId)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      fruits:
        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      vegetables:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
      dairy: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      meat_fish: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      bakery:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      pantry:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      beverages:
        'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
      snacks:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      frozen:
        'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      household:
        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      personal_care:
        'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
      other:
        'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400',
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-full">
        <div className="mb-6 pt-12">
          <Link to="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
        <div className="space-y-6">
          <Card className="animate-pulse">
            <CardContent className="p-12">
              <div className="mb-4 h-8 w-1/3 rounded bg-muted"></div>
              <div className="h-4 w-1/2 rounded bg-muted"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="w-full max-w-full">
        <div className="mb-6 pt-12">
          <Link to="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">Product not found</h3>
            <p className="mb-4 text-muted-foreground">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/products">
              <Button>Back to Products</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full">
      {/* Header */}
      <div className="mb-6 pt-12">
        <div className="mb-4 flex items-center gap-4">
          <Link to="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-xl bg-muted">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>

            <div>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <Badge className={getCategoryColor(product.category)}>
                  {
                    categoryLabels[
                      product.category as keyof typeof categoryLabels
                    ]
                  }
                </Badge>
              </div>

              {product.brand && (
                <p className="mb-2 text-lg text-muted-foreground">
                  by {product.brand}
                </p>
              )}

              {product.description && (
                <p className="mb-4 text-muted-foreground">
                  {product.description}
                </p>
              )}

              <div className="flex items-center gap-4">
                {product.is_organic && (
                  <Badge
                    variant="outline"
                    className="border-green-600 text-green-600"
                  >
                    Organic
                  </Badge>
                )}
                {product.is_vegan && (
                  <Badge
                    variant="outline"
                    className="border-blue-600 text-blue-600"
                  >
                    Vegan
                  </Badge>
                )}
                {product.is_vegetarian && (
                  <Badge
                    variant="outline"
                    className="border-purple-600 text-purple-600"
                  >
                    Vegetarian
                  </Badge>
                )}
                {product.is_gluten_free && (
                  <Badge
                    variant="outline"
                    className="border-orange-600 text-orange-600"
                  >
                    Gluten Free
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(product.confidence_score * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">
              Match Confidence
            </div>
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Category
                  </label>
                  <p className="text-sm">
                    {
                      categoryLabels[
                        product.category as keyof typeof categoryLabels
                      ]
                    }
                  </p>
                </div>
                {product.brand && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Brand
                    </label>
                    <p className="text-sm">{product.brand}</p>
                  </div>
                )}
                {product.barcode && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Barcode
                    </label>
                    <p className="font-mono text-sm">{product.barcode}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Typical Unit
                  </label>
                  <p className="text-sm">{product.typical_unit}</p>
                </div>
              </div>

              <div className="space-y-3">
                {product.typical_weight_g && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Typical Weight
                    </label>
                    <p className="text-sm">{product.typical_weight_g}g</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Data Source
                  </label>
                  <p className="text-sm">
                    {product.data_source === 'receipt_auto'
                      ? 'Auto-created from receipt'
                      : 'Manual entry'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Added
                  </label>
                  <p className="text-sm">{formatDate(product.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </label>
                  <p className="text-sm">{formatDate(product.updated_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nutritional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Nutritional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {product.calories_per_100g || 0}
                </div>
                <div className="text-sm text-muted-foreground">Calories</div>
                <div className="text-xs text-muted-foreground">per 100g</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {product.protein_per_100g || 0}g
                </div>
                <div className="text-sm text-muted-foreground">Protein</div>
                <div className="text-xs text-muted-foreground">per 100g</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {product.carbs_per_100g || 0}g
                </div>
                <div className="text-sm text-muted-foreground">Carbs</div>
                <div className="text-xs text-muted-foreground">per 100g</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {product.fat_per_100g || 0}g
                </div>
                <div className="text-sm text-muted-foreground">Fat</div>
                <div className="text-xs text-muted-foreground">per 100g</div>
              </div>
            </div>

            {(product.fiber_per_100g ||
              product.sugar_per_100g ||
              product.sodium_per_100g) && (
              <>
                <Separator className="my-6" />
                <div className="grid grid-cols-3 gap-6">
                  {product.fiber_per_100g && (
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {product.fiber_per_100g}g
                      </div>
                      <div className="text-sm text-muted-foreground">Fiber</div>
                    </div>
                  )}
                  {product.sugar_per_100g && (
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {product.sugar_per_100g}g
                      </div>
                      <div className="text-sm text-muted-foreground">Sugar</div>
                    </div>
                  )}
                  {product.sodium_per_100g && (
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {product.sodium_per_100g}mg
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Sodium
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Purchase History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Purchase History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No purchase history yet for this product
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <div className="mb-1 font-medium">
                        {purchase.receipt_item_name}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {formatDate(purchase.purchase_date)}
                        </span>
                        <span>
                          Qty: {purchase.quantity} {purchase.unit_type || ''}
                        </span>
                        {purchase.weight_kg && (
                          <span>Weight: {purchase.weight_kg}kg</span>
                        )}
                        <span>
                          Match: {Math.round(purchase.match_confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {new Intl.NumberFormat('de-DE', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(purchase.total_price)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Intl.NumberFormat('de-DE', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(purchase.unit_price)}{' '}
                        / unit
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
