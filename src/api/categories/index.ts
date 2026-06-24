import { api } from "@/api/client"

export interface Category {
  id: string
  parent_id: string | null
  name: string
  slug: string
  description: string
  icon: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  spec_type: string
  created_at: string
  updated_at: string
}

export interface CategoryReq {
  name: string
  parent_id?: string | null
  description?: string
  icon?: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  spec_type?: string
}

interface CursorResp<T> {
  data: T[]
  cursor: string | null
  limit: number
}

export const categoryApi = {
  list(params?: { cursor?: string; limit?: number }) {
    const q = params
      ? "?" + Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => `${k}=${v}`).join("&")
      : ""
    return api.request<CursorResp<Category>>("/categories" + q)
  },

  getById(id: string) {
    return api.request<Category>(`/categories/${id}`)
  },

  create(data: CategoryReq) {
    return api.request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  update(id: string, data: Partial<CategoryReq>) {
    return api.request<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  delete(id: string) {
    return api.request<void>(`/categories/${id}`, {
      method: "DELETE",
    })
  },
}
