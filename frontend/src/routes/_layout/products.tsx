import { createFileRoute } from '@tanstack/react-router'
import { Package, Plus, Search, Tag } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const Route = createFileRoute('/_layout/products')({
  component: ProductsPage,
})

// Mock data - will be replaced with real API calls
const mockProducts = [
  {
    id: 1,
    name: 'Bananen',
    category: 'fruits',
    brand: null,
    typical_unit: 'kg',
    calories_per_100g: 89,
    is_organic: false,
    purchase_count: 15,
    last_purchased: '2024-01-15',
    avg_price: 1.99
  },
  {
    id: 2,
    name: 'Vollmilch 3.5%',
    category: 'dairy',
    brand: 'REWE Bio',
    typical_unit: 'liter',
    calories_per_100g: 64,
    is_organic: true,
    purchase_count: 8,
    last_purchased: '2024-01-12',
    avg_price: 1.29
  },
  {
    id: 3,
    name: 'Spaghetti',
    category: 'pantry',
    brand: 'Barilla',
    typical_unit: 'pack',
    calories_per_100g: 371,
    is_organic: false,
    purchase_count: 5,
    last_purchased: '2024-01-10',
    avg_price: 1.49
  }
]

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'meat_fish', label: 'Meat & Fish' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'pantry', label: 'Pantry' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'frozen', label: 'Frozen' },
  { value: 'household', label: 'Household' },
  { value: 'personal_care', label: 'Personal Care' },
  { value: 'other', label: 'Other' }
]

function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      fruits: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      vegetables: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
      dairy: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      meat_fish: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      bakery: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      pantry: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      beverages: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
      snacks: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      frozen: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      household: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      personal_care: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
      other: 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400'
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="w-full max-w-full">
      <div className="flex items-center justify-between pt-12 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Product Catalog</h1>
          <p className="text-muted-foreground">
            Manage your product database and purchase history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </Badge>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
            <SelectItem value="purchase_count">Purchase Count</SelectItem>
            <SelectItem value="last_purchased">Last Purchased</SelectItem>
            <SelectItem value="avg_price">Average Price</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid gap-4">
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm || selectedCategory !== 'all' ? 'No matching products' : 'No products yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Products will appear here as you process receipts'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map(product => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        <Badge className={getCategoryColor(product.category)}>
                          <Tag className="h-3 w-3 mr-1" />
                          {categories.find(c => c.value === product.category)?.label}
                        </Badge>
                        {product.is_organic && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Organic
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                        {product.brand && (
                          <div>
                            <span className="font-medium">Brand:</span>
                            <p>{product.brand}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Unit:</span>
                          <p>{product.typical_unit}</p>
                        </div>
                        <div>
                          <span className="font-medium">Calories:</span>
                          <p>{product.calories_per_100g} kcal/100g</p>
                        </div>
                        <div>
                          <span className="font-medium">Avg Price:</span>
                          <p>{formatCurrency(product.avg_price)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Purchased {product.purchase_count} times</span>
                        <span>Last: {formatDate(product.last_purchased)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
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