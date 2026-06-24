import { api } from "@/api/client"

export interface ArticleCategory {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface ArticleCategoryReq {
  name: string
  slug: string
  description?: string | null
}

export const articleCategoryApi = {
  list() {
    return api.request<ArticleCategory[]>("/articles/categories")
  },

  create(data: ArticleCategoryReq) {
    return api.request<ArticleCategory>("/articles/categories", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  update(id: string, data: ArticleCategoryReq) {
    return api.request<ArticleCategory>(`/articles/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  delete(id: string) {
    return api.request<void>(`/articles/categories/${id}`, {
      method: "DELETE",
    })
  },
}
