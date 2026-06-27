import { useEffect, useState } from "react"
import { statsApi, type PageViewCount } from "@/api/stats"
import { Link } from "react-router-dom"
import { BarChart3, Eye, ExternalLink, Loader2, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PageViewsPage() {
  const [data, setData] = useState<PageViewCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsApi.getPageViews().then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const totalViews = data.reduce((s, v) => s + v.view_count, 0)
  const topProduct = data[0]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Page Views</h1>
        <p className="text-sm text-muted-foreground">Total views per product dari pengunjung website</p>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Eye className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-xl font-bold">{totalViews.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Views</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <BarChart3 className="size-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-bold">{data.length}</p>
            <p className="text-xs text-muted-foreground">Products Viewed</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <TrendingUp className="size-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xl font-bold truncate max-w-[140px]">{topProduct?.slug ?? "-"}</p>
            <p className="text-xs text-muted-foreground">Most Viewed</p>
          </div>
        </div>
      </div>

      {/* Table */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-muted-foreground">
          <Eye className="mb-2 size-10" />
          <p className="text-sm">Belum ada data page views</p>
          <p className="text-xs">Data akan muncul setelah pengunjung mengakses halaman produk di website</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium w-12">#</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-right font-medium w-24">Views</th>
                <th className="px-4 py-3 text-left font-medium w-44">Last View</th>
                <th className="px-4 py-3 text-right font-medium w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <tr key={item.slug} className={`border-b last:border-0 hover:bg-muted/30 ${i < 3 ? "bg-primary/5" : ""}`}>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">
                    {i + 1}
                  </td>
                  <td className="px-4 py-2.5 font-medium truncate max-w-[300px]">
                    <span className="text-xs">{item.slug}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      i === 0 ? "bg-primary/10 text-primary" :
                      i < 3 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {item.view_count.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {new Date(item.last_view).toLocaleString("id-ID", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link to={`/products?search=${item.slug}`} title="View product">
                        <ExternalLink className="size-3.5" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
