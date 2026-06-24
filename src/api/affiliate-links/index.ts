import { api } from "@/api/client"

export interface AffiliateLink {
  id: string
  product_id: string
  marketplace_id: string
  url: string
  current_price: number | null
  currency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AffiliateLinkReq {
  product_id: string
  marketplace_id: string
  url: string
  current_price?: number | null
  currency?: string
}

export const affiliateLinkApi = {
  listByProduct(productId: string) {
    return api.request<AffiliateLink[]>(`/products/${productId}/affiliate-links`)
  },

  create(data: AffiliateLinkReq) {
    return api.request<AffiliateLink>("/affiliate-links", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  update(id: string, data: Partial<AffiliateLinkReq>) {
    return api.request<AffiliateLink>(`/affiliate-links/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  delete(id: string) {
    return api.request<void>(`/affiliate-links/${id}`, {
      method: "DELETE",
    })
  },
}
