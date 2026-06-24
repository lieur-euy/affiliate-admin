import { useEffect, useState } from "react"
import { statsApi, type Stats } from "@/api/stats"
import { Package, BookOpen, Tags, FolderTree, Building2, Store, Image, MessageSquareText, Loader2 } from "lucide-react"

const FIELDS: { key: keyof Stats; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "total_products", label: "Total Products", icon: <Package className="size-6 text-blue-600" />, color: "text-blue-600" },
  { key: "total_articles", label: "Total Articles", icon: <BookOpen className="size-6 text-emerald-600" />, color: "text-emerald-600" },
  { key: "total_categories", label: "Categories", icon: <FolderTree className="size-6 text-amber-600" />, color: "text-amber-600" },
  { key: "total_brands", label: "Brands", icon: <Building2 className="size-6 text-purple-600" />, color: "text-purple-600" },
  { key: "total_marketplaces", label: "Marketplaces", icon: <Store className="size-6 text-rose-600" />, color: "text-rose-600" },
  { key: "total_article_categories", label: "Article Categories", icon: <FolderTree className="size-6 text-cyan-600" />, color: "text-cyan-600" },
  { key: "total_tags", label: "Tags", icon: <Tags className="size-6 text-orange-600" />, color: "text-orange-600" },
  { key: "total_media", label: "Media Files", icon: <Image className="size-6 text-pink-600" />, color: "text-pink-600" },
  { key: "total_comments", label: "Comments", icon: <MessageSquareText className="size-6 text-indigo-600" />, color: "text-indigo-600" },
  { key: "pending_comments", label: "Pending Comments", icon: <MessageSquareText className="size-6 text-yellow-600" />, color: "text-yellow-600" },
]

export function DashboardPage() {
  const [data, setData] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsApi.get().then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {FIELDS.map((f) => (
          <div key={f.key} className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex size-12 items-center justify-center rounded-lg bg-muted">{f.icon}</div>
            <div>
              <p className="text-2xl font-bold">{data?.[f.key] ?? 0}</p>
              <p className="text-xs text-muted-foreground">{f.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
