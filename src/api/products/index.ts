import { api } from "@/api/client"

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  content: string
  image_url: string
  category_id: string | null
  brand_id: string | null
  locale: string
  localization_group_id: string | null
  is_active: boolean
  is_featured: boolean
  published_at: string | null
  specs_jsonb: Record<string, unknown>
  translations: Record<string, unknown>
  created_by: string
  created_at: string
  updated_at: string
}

export interface ProductReq {
  name: string
  slug?: string
  description?: string
  content?: string
  image_url?: string
  category_id?: string | null
  brand_id?: string | null
  locale?: string
  localization_group_id?: string | null
  is_active?: boolean
  is_featured?: boolean
  specs_jsonb?: Record<string, unknown>
  translations?: Record<string, unknown>
}

export interface LocalizationRef {
  id: string
  name: string
  slug: string
  locale: string
  image_url?: string | null
  is_active: boolean
}

export interface ProductBulkLocale {
  name: string
  description: string
  content: string
  slug?: string
  category_id?: string | null
  brand_id?: string | null
  image_url?: string
  is_active?: boolean
  is_featured?: boolean
  gallery?: string[]
  affiliate_links?: {
    marketplace_id: string
    url: string
    current_price?: number | null
    currency: string
  }[]
  specs?: Record<string, unknown>
}

export interface ProductBulkReq {
  id: ProductBulkLocale
  en: ProductBulkLocale
}

export interface ProductBulkResp {
  id: Product
  en: Product | null
}

interface CursorResp<T> {
  data: T[]
  cursor: string | null
  limit: number
}

export const productApi = {
  list(params?: { cursor?: string; limit?: number; search?: string; category_id?: string; brand_id?: string; locale?: string }) {
    const q = params
      ? "?" + Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => `${k}=${v}`).join("&")
      : ""
    return api.request<CursorResp<Product>>("/products" + q)
  },

  getById(id: string) {
    return api.request<Product>(`/products/${id}`)
  },

  create(data: ProductReq) {
    return api.request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  createBulk(data: ProductBulkReq) {
    return api.request<ProductBulkResp>("/products/bulk", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  update(id: string, data: Partial<ProductReq>) {
    return api.request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  updateBulk(id: string, data: ProductBulkReq) {
    return api.request<ProductBulkResp>(`/products/${id}/bulk`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  delete(id: string) {
    return api.request<void>(`/products/${id}`, {
      method: "DELETE",
    })
  },

  publish(id: string) {
    return api.request<Product>(`/products/${id}/publish`, { method: "PATCH" })
  },

  draft(id: string) {
    return api.request<Product>(`/products/${id}/draft`, { method: "PATCH" })
  },

  getLocalizations(id: string) {
    return api.request<LocalizationRef[]>(`/products/${id}/localizations`)
  },

  createLocalization(id: string, locale: string) {
    return api.request<Product>(`/products/${id}/localizations`, {
      method: "POST",
      body: JSON.stringify({ locale }),
    })
  },

  getGallery(id: string) {
    return api.request<string[]>(`/products/${id}/gallery`)
  },
}
