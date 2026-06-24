import { api } from "@/api/client"

export interface ArticleTag {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface ArticleTagReq {
  name: string
  slug: string
}

export const articleTagApi = {
  list() {
    return api.request<ArticleTag[]>("/articles/tags")
  },

  create(data: ArticleTagReq) {
    return api.request<ArticleTag>("/articles/tags", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  update(id: string, data: ArticleTagReq) {
    return api.request<ArticleTag>(`/articles/tags/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  delete(id: string) {
    return api.request<void>(`/articles/tags/${id}`, {
      method: "DELETE",
    })
  },
}
