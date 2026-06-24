import { api } from "@/api/client"

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image_url: string
  category_id: string | null
  tags: string[]
  author: string
  is_active: boolean
  is_featured: boolean
  published_at: string | null
  translations: Record<string, unknown>
  created_by: string
  created_at: string
  updated_at: string
}

export interface ArticleReq {
  title: string
  excerpt?: string
  content?: string
  image_url?: string
  category_id?: string | null
  tags?: string[]
  slug?: string
  author?: string
  is_active?: boolean
  is_featured?: boolean
  translations?: Record<string, unknown>
}

interface CursorResp<T> {
  data: T[]
  cursor: string | null
  limit: number
}

export const articleApi = {
  list(params?: { cursor?: string; limit?: number; search?: string; category_id?: string; tag?: string }) {
    const q = params
      ? "?" + Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => `${k}=${v}`).join("&")
      : ""
    return api.request<CursorResp<Article>>("/articles" + q)
  },

  getById(id: string) {
    return api.request<Article>(`/articles/${id}`)
  },

  create(data: ArticleReq) {
    return api.request<Article>("/articles", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  update(id: string, data: Partial<ArticleReq>) {
    return api.request<Article>(`/articles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  delete(id: string) {
    return api.request<void>(`/articles/${id}`, {
      method: "DELETE",
    })
  },

  publish(id: string) {
    return api.request<Article>(`/articles/${id}/publish`, { method: "PATCH" })
  },

  draft(id: string) {
    return api.request<Article>(`/articles/${id}/draft`, { method: "PATCH" })
  },
}
