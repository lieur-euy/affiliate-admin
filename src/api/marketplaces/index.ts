import { api } from "@/api/client"

export interface Marketplace {
  id: string
  name: string
  slug: string
  logo_url: string
  base_url: string
  created_at: string
  updated_at: string
}

export interface MarketplaceReq {
  name: string
  logo_url?: string
  base_url?: string
}

interface CursorResp<T> {
  data: T[]
  cursor: string | null
  limit: number
}

export const marketplaceApi = {
  list(params?: { cursor?: string; limit?: number; search?: string }) {
    const q = params
      ? "?" + Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => `${k}=${v}`).join("&")
      : ""
    return api.request<CursorResp<Marketplace>>("/marketplaces" + q)
  },

  getById(id: string) {
    return api.request<Marketplace>(`/marketplaces/${id}`)
  },

  create(data: MarketplaceReq) {
    return api.request<Marketplace>("/marketplaces", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  update(id: string, data: Partial<MarketplaceReq>) {
    return api.request<Marketplace>(`/marketplaces/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  delete(id: string) {
    return api.request<void>(`/marketplaces/${id}`, {
      method: "DELETE",
    })
  },
}
