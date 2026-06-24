import { api } from "@/api/client"

export interface SEO {
  id: string
  entity_type: string
  entity_id: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  og_title: string
  og_description: string
  og_image: string
  canonical_url: string
  robots: string
  created_at: string
  updated_at: string
}

export interface SEOReq {
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  og_title?: string
  og_description?: string
  og_image?: string
  canonical_url?: string
  robots?: string
}

export const seoApi = {
  getByProductId(productId: string) {
    return api.request<SEO>(`/products/${productId}/seo`)
  },

  upsert(productId: string, data: SEOReq) {
    return api.request<SEO>(`/products/${productId}/seo`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  getByArticleId(articleId: string) {
    return api.request<SEO>(`/articles/${articleId}/seo`)
  },

  upsertArticle(articleId: string, data: SEOReq) {
    return api.request<SEO>(`/articles/${articleId}/seo`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
}
