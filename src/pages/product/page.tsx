import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/providers/auth"
import { productApi, type Product } from "@/api/products"
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
import { categoryApi, type Category } from "@/api/categories"
import { brandApi, type Brand } from "@/api/brands"
import { Plus, Pencil, Trash2, Package, ToggleLeft, ToggleRight, Loader2, FileJson } from "lucide-react"
import { SearchableSelect } from "@/components/searchable-select"

export function ProductPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const canManage = user?.role !== "viewer"
  const [search, setSearch] = useState("")
  const [filterCat, setFilterCat] = useState("")
  const [filterBrand, setFilterBrand] = useState("")
  const [filterLocale, setFilterLocale] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  useEffect(() => {
    Promise.all([
      categoryApi.list({ limit: 100 }).then(r => setCategories(Array.isArray(r?.data) ? r.data : [])),
      brandApi.list({ limit: 100 }).then(r => setBrands(Array.isArray(r?.data) ? r.data : [])),
    ]).catch(() => {})
  }, [])

  const catMap = new Map(categories.map(c => [c.id, c.name]))
  const brMap = new Map(brands.map(b => [b.id, b.name]))

  const fetcher = useCallback(
    (cursor?: string) => productApi.list({
      limit: 12, cursor,
      search: search || undefined,
      category_id: filterCat || undefined,
      brand_id: filterBrand || undefined,
      locale: filterLocale || undefined,
    }).then((r) => ({ data: r.data, cursor: r.cursor })),
    [search, filterCat, filterBrand, filterLocale],
  )
  const {
    items, isLoading, loadError,
    hasNext, hasPrev, page, totalPages,
    loadFirst, loadNext, loadPrev,
  } = useCursorPagination<Product>(fetcher, [search, filterCat, filterBrand, filterLocale])
  useEffect(() => { loadFirst() }, [loadFirst])

  const toggleStatus = async (product: Product) => {
    try {
      if (product.is_active) await productApi.draft(product.id)
      else await productApi.publish(product.id)
      toast.success(product.is_active ? t("product.draft") : t("product.publish"))
      loadFirst()
    } catch { toast.error(t("toast.failed")) }
  }

  const handleDelete = async (id: string) => {
    try {
      await productApi.delete(id)
      toast.success(t("toast.deleted"))
      loadFirst()
    } catch { toast.error(t("toast.failed")) }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("product.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("common.details")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder={`${t("common.search")}...`} value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-40 text-sm" />

          <SearchableSelect value={filterLocale} onChange={(v) => setFilterLocale(v)}
            placeholder="All Locales" options={[{ value: "id", label: "Indonesia" }, { value: "en", label: "English" }]} className="h-8 w-36" />
          <SearchableSelect value={filterCat} onChange={(v) => setFilterCat(v)}
            placeholder="All Categories" options={categories.map(c => ({ value: c.id, label: c.name }))} />
          <SearchableSelect value={filterBrand} onChange={(v) => setFilterBrand(v)}
            placeholder="All Brands" options={brands.map(b => ({ value: b.id, label: b.name }))} />
          {canManage && (
            <Link to="/products/new">
              <Button><Plus className="mr-1 size-4" />{t("product.new")}</Button>
            </Link>
          )}
          {canManage && (
            <Link to="/products/newjson">
              <Button variant="outline"><FileJson className="mr-1 size-4" />{t("product.new")} JSON</Button>
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
                <th className="px-4 py-3 text-left font-medium">Locale</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Brand</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
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
          <Package className="mb-2 size-12" />
          <p className="text-sm">No products yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          {isLoading && <div className="flex items-center justify-center gap-2 border-b bg-muted/30 px-4 py-1.5 text-xs text-muted-foreground"><Loader2 className="size-3 animate-spin" />Updating...</div>}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Locale</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Brand</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((product) => (
                <tr key={product.id} className={`border-b last:border-0 hover:bg-muted/30 ${isLoading ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium uppercase ${
                      product.locale === "id" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>{product.locale}</span>
                  </td>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{catMap.get(product.category_id ?? "") ?? "-"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{brMap.get(product.brand_id ?? "") ?? "-"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(product)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        product.is_active
                          ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                      {product.is_active ? <ToggleRight className="size-3.5" /> : <ToggleLeft className="size-3.5" />}
                      {product.is_active ? t("common.active") : t("common.inactive")}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canManage && (
                        <Link to={`/products/${product.id}/edit`}>
                          <Button variant="ghost" size="icon-sm"><Pencil className="size-4" /></Button>
                        </Link>
                      )}
                      {canManage && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon-sm"><Trash2 className="size-4 text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete product?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete &ldquo;{product.name}&rdquo;.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(product.id)}>Delete</AlertDialogAction>
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
