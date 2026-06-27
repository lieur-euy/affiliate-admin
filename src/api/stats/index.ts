import { api } from "@/api/client"

export interface Stats {
  total_products: number
  total_articles: number
  total_categories: number
  total_brands: number
  total_marketplaces: number
  total_article_categories: number
  total_tags: number
  total_media: number
  total_comments: number
  pending_comments: number
}

export interface PageViewCount {
  slug: string
  view_count: number
  last_view: string
}

export const statsApi = {
  get() {
    return api.request<Stats>("/stats")
  },
  getPageViews() {
    return api.request<PageViewCount[]>("/stats/page-views")
  },
}
