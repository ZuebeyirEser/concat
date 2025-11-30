import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { type ApiError } from '@/client'
import { OpenAPI } from '@/client/core/OpenAPI'
import { request } from '@/client/core/request'
import { handleError } from '@/utils'

// Types for Product operations
interface Product {
  id: number
  name: string
  normalized_name: string
  category: string
  brand?: string
  barcode?: string
  description?: string
  calories_per_100g?: number
  protein_per_100g?: number
  carbs_per_100g?: number
  fat_per_100g?: number
  fiber_per_100g?: number
  sugar_per_100g?: number
  sodium_per_100g?: number
  typical_unit?: string
  typical_weight_g?: number
  image_url?: string
  is_organic: boolean
  is_vegan: boolean
  is_vegetarian: boolean
  is_gluten_free: boolean
  data_source?: string
  confidence_score: number
  created_at: string
  updated_at: string
}

interface ProductPurchase {
  id: number
  product_id: number
  extracted_data_id: number
  receipt_item_name: string
  quantity: number
  unit_price: number
  total_price: number
  unit_type?: string
  weight_kg?: number
  match_confidence: number
  is_manual_match: boolean
  purchase_date: string
  created_at: string
  product: Product
}

interface ExtractedData {
  id: number
  document_id: number
  store_name?: string
  store_address?: string
  receipt_number?: string
  transaction_date?: string
  transaction_time?: string
  subtotal?: number
  tax_amount?: number
  total_amount?: number
  payment_method?: string
  created_at: string
  updated_at: string
}

interface ProductPurchaseWithBill extends ProductPurchase {
  extracted_data?: ExtractedData
}

interface ProductCreate {
  name: string
  category: string
  brand?: string
  barcode?: string
  description?: string
  calories_per_100g?: number
  protein_per_100g?: number
  carbs_per_100g?: number
  fat_per_100g?: number
  typical_unit?: string
  typical_weight_g?: number
  image_url?: string
  is_organic?: boolean
  is_vegan?: boolean
  is_vegetarian?: boolean
  is_gluten_free?: boolean
}

interface ProductMatchResult {
  product?: Product
  confidence: number
  matched: boolean
  suggested_category?: string
  normalized_name?: string
}

// Query Options
export function getProductsQueryOptions(params?: {
  skip?: number
  limit?: number
  category?: string
  search?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.skip) searchParams.append('skip', params.skip.toString())
  if (params?.limit) searchParams.append('limit', params.limit.toString())
  if (params?.category) searchParams.append('category', params.category)
  if (params?.search) searchParams.append('search', params.search)

  return {
    queryKey: ['products', params],
    queryFn: async (): Promise<Product[]> => {
      return request(OpenAPI, {
        method: 'GET',
        url: `/api/v1/products/?${searchParams.toString()}`,
      })
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  }
}

export function getProductQueryOptions(productId: number) {
  return {
    queryKey: ['product', productId],
    queryFn: async (): Promise<Product> => {
      return request(OpenAPI, {
        method: 'GET',
        url: `/api/v1/products/${productId}`,
      })
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  }
}

export function getProductCategoriesQueryOptions() {
  return {
    queryKey: ['product-categories'],
    queryFn: async (): Promise<string[]> => {
      return request(OpenAPI, {
        method: 'GET',
        url: '/api/v1/products/categories/',
      })
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  }
}

export function getPopularProductsQueryOptions(limit: number = 20) {
  return {
    queryKey: ['popular-products', limit],
    queryFn: async (): Promise<Product[]> => {
      return request(OpenAPI, {
        method: 'GET',
        url: `/api/v1/products/popular/?limit=${limit}`,
      })
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  }
}

export function getUserPurchasesQueryOptions(params?: {
  skip?: number
  limit?: number
  include_bill?: boolean
}) {
  const searchParams = new URLSearchParams()
  if (params?.skip) searchParams.append('skip', params.skip.toString())
  if (params?.limit) searchParams.append('limit', params.limit.toString())
  if (params?.include_bill) searchParams.append('include_bill', 'true')

  return {
    queryKey: ['user-purchases', params],
    queryFn: async (): Promise<ProductPurchaseWithBill[]> => {
      return request(OpenAPI, {
        method: 'GET',
        url: `/api/v1/products/purchases/?${searchParams.toString()}`,
      })
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  }
}

export function getProductPurchasesQueryOptions(productId: number) {
  return {
    queryKey: ['product-purchases', productId],
    queryFn: async (): Promise<ProductPurchase[]> => {
      return request(OpenAPI, {
        method: 'GET',
        url: `/api/v1/products/${productId}/purchases/`,
      })
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  }
}

// Custom Hooks
export function useProducts(params?: {
  skip?: number
  limit?: number
  category?: string
  search?: string
}) {
  return useQuery(getProductsQueryOptions(params))
}

export function useProduct(productId: number) {
  return useQuery(getProductQueryOptions(productId))
}

export function useProductCategories() {
  return useQuery(getProductCategoriesQueryOptions())
}

export function usePopularProducts(limit: number = 20) {
  return useQuery(getPopularProductsQueryOptions(limit))
}

export function useUserPurchases(params?: {
  skip?: number
  limit?: number
  include_bill?: boolean
}) {
  return useQuery(getUserPurchasesQueryOptions(params))
}

// Export types for use in components
export type { ExtractedData, Product, ProductPurchase, ProductPurchaseWithBill }

export function useProductPurchases(productId: number) {
  return useQuery(getProductPurchasesQueryOptions(productId))
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productData: ProductCreate): Promise<Product> => {
      return request(OpenAPI, {
        method: 'POST',
        url: '/api/v1/products/',
        body: productData,
      })
    },
    onSuccess: data => {
      toast.success(`Product "${data.name}" created successfully`)
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['popular-products'] })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      productId,
      productData,
    }: {
      productId: number
      productData: Partial<ProductCreate>
    }): Promise<Product> => {
      return request(OpenAPI, {
        method: 'PUT',
        url: `/api/v1/products/${productId}`,
        body: productData,
      })
    },
    onSuccess: data => {
      toast.success(`Product "${data.name}" updated successfully`)
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', data.id] })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: number): Promise<void> => {
      return request(OpenAPI, {
        method: 'DELETE',
        url: `/api/v1/products/${productId}`,
      })
    },
    onSuccess: () => {
      toast.success('Product deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['popular-products'] })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })
}

export function useMatchProduct() {
  return useMutation({
    mutationFn: async ({
      itemName,
      confidenceThreshold = 0.7,
    }: {
      itemName: string
      confidenceThreshold?: number
    }): Promise<ProductMatchResult> => {
      const searchParams = new URLSearchParams({
        item_name: itemName,
        confidence_threshold: confidenceThreshold.toString(),
      })

      return request(OpenAPI, {
        method: 'POST',
        url: `/api/v1/products/match/?${searchParams.toString()}`,
      })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })
}

export function useCreateProductFromItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      itemName,
      price,
      quantity = 1.0,
    }: {
      itemName: string
      price: number
      quantity?: number
    }): Promise<Product> => {
      const searchParams = new URLSearchParams({
        item_name: itemName,
        price: price.toString(),
        quantity: quantity.toString(),
      })

      return request(OpenAPI, {
        method: 'POST',
        url: `/api/v1/products/create-from-item/?${searchParams.toString()}`,
      })
    },
    onSuccess: data => {
      toast.success(`Product "${data.name}" created from receipt item`)
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })
}

export function useCreateProductAlias() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      productId,
      aliasName,
      storeSpecific,
    }: {
      productId: number
      aliasName: string
      storeSpecific?: string
    }): Promise<void> => {
      const searchParams = new URLSearchParams({
        alias_name: aliasName,
      })
      if (storeSpecific) {
        searchParams.append('store_specific', storeSpecific)
      }

      return request(OpenAPI, {
        method: 'POST',
        url: `/api/v1/products/${productId}/aliases/?${searchParams.toString()}`,
      })
    },
    onSuccess: () => {
      toast.success('Product alias created successfully')
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })
}
