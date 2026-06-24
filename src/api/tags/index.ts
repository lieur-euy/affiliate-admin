import { api } from "@/api/client"

export interface Tag {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface TagReq {
  name: string
}

interface CursorResp<T> {
  data: T[]
  cursor: string | null
  limit: number
}

export const tagApi = {
  list(params?: { cursor?: string; limit?: number; search?: string }) {
    const q = params
      ? "?" + Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => `${k}=${v}`).join("&")
      : ""
    return api.request<CursorResp<Tag>>("/tags" + q)
  },

  getById(id: string) {
    return api.request<Tag>(`/tags/${id}`)
  },

  create(data: TagReq) {
    return api.request<Tag>("/tags", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  update(id: string, data: TagReq) {
    return api.request<Tag>(`/tags/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  delete(id: string) {
    return api.request<void>(`/tags/${id}`, {
      method: "DELETE",
    })
  },
}
