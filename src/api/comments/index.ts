import { api } from "@/api/client"

export interface Comment {
  id: string
  article_id: string
  article_title?: string
  parent_id: string | null
  author_name: string
  author_email: string
  content: string
  status: "pending" | "approved" | "rejected"
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CommentReq {
  article_id: string
  parent_id?: string | null
  author_name: string
  author_email?: string
  content: string
}

interface CursorResp<T> {
  data: T[]
  cursor: string | null
  limit: number
}

export const commentApi = {
  list(params?: { cursor?: string; limit?: number; search?: string; status?: string; article_id?: string }) {
    const q = params
      ? "?" + Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => `${k}=${v}`).join("&")
      : ""
    return api.request<CursorResp<Comment>>("/comments" + q)
  },

  getById(id: string) {
    return api.request<Comment>(`/comments/${id}`)
  },

  approve(id: string) {
    return api.request<Comment>(`/comments/${id}/approve`, { method: "PATCH" })
  },

  reject(id: string) {
    return api.request<Comment>(`/comments/${id}/reject`, { method: "PUT" })
  },

  delete(id: string) {
    return api.request<void>(`/comments/${id}`, {
      method: "DELETE",
    })
  },
}
