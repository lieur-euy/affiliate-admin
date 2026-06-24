import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/providers/auth"
import { articleApi, type Article } from "@/api/articles"
import { articleCategoryApi, type ArticleCategory } from "@/api/article-categories"
import { SearchableSelect } from "@/components/searchable-select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { PaginationBar } from "@/components/pagination-bar"
import { useCursorPagination } from "@/hooks/use-cursor-pagination"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, BookOpen, ToggleLeft, ToggleRight, Loader2 } from "lucide-react"

export function ArticlesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const canManage = user?.role !== "viewer"
  const [search, setSearch] = useState("")
  const [filterCat, setFilterCat] = useState("")
  const [categories, setCategories] = useState<ArticleCategory[]>([])

  useEffect(() => {
    articleCategoryApi.list().then(setCategories).catch(() => {})
  }, [])

  const fetcher = useCallback(
    (cursor?: string) => articleApi.list({
      limit: 12, cursor,
      search: search || undefined,
      category_id: filterCat || undefined,
    }).then((r) => ({ data: r.data, cursor: r.cursor })),
    [search, filterCat],
  )
  const {
    items, isLoading, loadError,
    hasNext, hasPrev, page, totalPages,
    loadFirst, loadNext, loadPrev,
  } = useCursorPagination<Article>(fetcher, [search])
  useEffect(() => { loadFirst() }, [loadFirst])

  const toggleStatus = async (article: Article) => {
    try {
      if (article.is_active) await articleApi.draft(article.id)
      else await articleApi.publish(article.id)
      toast.success(article.is_active ? t("article.draft") : t("article.publish"))
      loadFirst()
    } catch { toast.error(t("toast.failed")) }
  }

  const handleDelete = async (id: string) => {
    try {
      await articleApi.delete(id)
      toast.success(t("toast.deleted"))
      loadFirst()
    } catch { toast.error(t("toast.failed")) }
  }

  const catMap = new Map(categories.map(c => [c.id, c.name]))

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("article.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("common.details")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder={`${t("common.search")}...`} value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-40 text-sm" onKeyDown={(e) => e.key === "Enter" && loadFirst()} />
          <SearchableSelect value={filterCat} onChange={(v) => { setFilterCat(v); loadFirst() }}
            placeholder={t("article.category")} options={categories.map(c => ({ value: c.id, label: c.name }))} />
          {canManage && (
            <Link to="/articles/new">
              <Button><Plus className="mr-1 size-4" />{t("article.new")}</Button>
            </Link>
          )}
        </div>
      </div>

      {loadError ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-destructive">
          <p className="mb-2 text-sm">{loadError}</p>
          <Button variant="outline" size="sm" onClick={loadFirst}>Retry</Button>
        </div>
      ) : items.length === 0 && isLoading ? (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">{t("common.name")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("article.category")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("article.tags")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("common.status")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-3 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-3 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1"><Skeleton className="size-8 rounded-md" /><Skeleton className="size-8 rounded-md" /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-muted-foreground">
          <BookOpen className="mb-2 size-12" />
          <p className="text-sm">{t("article.title")} not found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          {isLoading && <div className="flex items-center justify-center gap-2 border-b bg-muted/30 px-4 py-1.5 text-xs text-muted-foreground"><Loader2 className="size-3 animate-spin" />Updating...</div>}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">{t("common.name")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("article.category")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("article.tags")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("common.status")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((article) => (
                <tr key={article.id} className={`border-b last:border-0 hover:bg-muted/30 ${isLoading ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-medium">{article.title}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{catMap.get(article.category_id ?? "") ?? "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(article.tags ?? []).map((tag) => (
                        <span key={tag} className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
                      ))}
                      {(!article.tags || article.tags.length === 0) && <span className="text-xs text-muted-foreground">-</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(article)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        article.is_active
                          ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                      {article.is_active ? <ToggleRight className="size-3.5" /> : <ToggleLeft className="size-3.5" />}
                      {article.is_active ? t("common.active") : t("common.inactive")}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canManage && (
                        <Link to={`/articles/${article.id}/edit`}>
                          <Button variant="ghost" size="icon-sm"><Pencil className="size-4" /></Button>
                        </Link>
                      )}
                      {canManage && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon-sm"><Trash2 className="size-4 text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete article?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete &ldquo;{article.title}&rdquo;.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(article.id)}>{t("common.delete")}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaginationBar page={page} totalPages={totalPages} hasNext={hasNext} hasPrev={hasPrev} isLoading={isLoading} onNext={loadNext} onPrev={loadPrev} />
    </div>
  )
}
