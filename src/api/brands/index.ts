import { api } from "@/api/client"

export interface Brand {
  id: string
  name: string
  slug: string
  logo_url: string
  created_at: string
  updated_at: string
}

export interface BrandReq {
  name: string
  logo_url?: string
}

interface CursorResp<T> {
  data: T[]
  cursor: string | null
  limit: number
}

export const brandApi = {
  list(params?: { cursor?: string; limit?: number; search?: string }) {
    const q = params
      ? "?" + Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => `${k}=${v}`).join("&")
      : ""
    return api.request<CursorResp<Brand>>("/brands" + q)
  },

  getById(id: string) {
    return api.request<Brand>(`/brands/${id}`)
  },

  create(data: BrandReq) {
    return api.request<Brand>("/brands", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  update(id: string, data: Partial<BrandReq>) {
    return api.request<Brand>(`/brands/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  delete(id: string) {
    return api.request<void>(`/brands/${id}`, {
      method: "DELETE",
    })
  },
}
