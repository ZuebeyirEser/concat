import { createFileRoute, Link } from '@tanstack/react-router'
import { Package, Plus, Search, Tag } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProductCategories, useProducts } from '@/hooks/useProductQueries'

export const Route = createFileRoute('/_layout/products/')({
  component: ProductsPage,
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

function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  // Fetch products and categories from API
  const { data: products = [], isLoading: productsLoading } = useProducts({
    search: searchTerm || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    limit: 100,
  })

  const { data: availableCategories = [] } = useProductCategories()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  // Sort products based on selected criteria
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'category':
        return a.category.localeCompare(b.category)
      case 'created_at':
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      default:
        return 0
    }
  })

  // Create categories list for dropdown
  const categories = [
    { value: 'all', label: 'All Categories' },
    ...availableCategories.map(cat => ({
      value: cat,
      label: categoryLabels[cat as keyof typeof categoryLabels] || cat,
    })),
  ]

  if (productsLoading) {
    return (
      <div className="w-full max-w-full">
        <h1 className="pt-12 text-2xl font-bold">Product Catalog</h1>
        <p className="mb-6 text-muted-foreground">Loading your products...</p>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="mb-2 h-4 w-1/3 rounded bg-muted"></div>
                <div className="h-3 w-1/2 rounded bg-muted"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full">
      <div className="mb-6 flex items-center justify-between pt-12">
        <div>
          <h1 className="text-2xl font-bold">Product Catalog</h1>
          <p className="text-muted-foreground">
            Products automatically created from your receipts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {sortedProducts.length} product
            {sortedProducts.length !== 1 ? 's' : ''}
          </Badge>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="created_at">Recently Added</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid gap-4">
        {sortedProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">
                {searchTerm || selectedCategory !== 'all'
                  ? 'No matching products'
                  : 'No products yet'}
              </h3>
              <p className="mb-4 text-muted-foreground">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Upload some receipts to automatically create your product catalog'}
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <Link to="/pdf-upload">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Your First Receipt
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          sortedProducts.map(product => (
            <Card
              key={product.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="truncate font-medium">{product.name}</h3>
                        <Badge className={getCategoryColor(product.category)}>
                          <Tag className="mr-1 h-3 w-3" />
                          {categoryLabels[
                            product.category as keyof typeof categoryLabels
                          ] || product.category}
                        </Badge>
                        {product.is_organic && (
                          <Badge
                            variant="outline"
                            className="border-green-600 text-green-600"
                          >
                            Organic
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {product.brand && <span>Brand: {product.brand}</span>}
                        {product.typical_unit && (
                          <span>Unit: {product.typical_unit}</span>
                        )}
                        <span>Added: {formatDate(product.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex items-center gap-2">
                    <Link 
                      to="/products/$productId" 
                      params={{ productId: product.id }}
                    >
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
