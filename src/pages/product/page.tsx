import { useEffect, useState, useCallback, useMemo } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Plus, Pencil, Trash2, Package, ToggleLeft, ToggleRight,
  Loader2, FileJson, ArrowUpDown, CheckSquare, Square,
} from "lucide-react"
import { SearchableSelect } from "@/components/searchable-select"

type SortKey = "name" | "created_at"

export function ProductPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const canManage = user?.role !== "viewer"
  const [search, setSearch] = useState("")
  const [filterCat, setFilterCat] = useState("")
  const [filterBrand, setFilterBrand] = useState("")
  const [filterLocale, setFilterLocale] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("created_at")
  const [sortAsc, setSortAsc] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
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
      limit: 20, cursor,
      search: search || undefined,
      category_id: filterCat || undefined,
      brand_id: filterBrand || undefined,
      locale: filterLocale || undefined,
      status: filterStatus || undefined,
    } as any).then((r) => ({ data: r.data, cursor: r.cursor })),
    [search, filterCat, filterBrand, filterLocale, filterStatus],
  )
  const {
    items: rawItems, isLoading, loadError,
    hasNext, hasPrev, page, totalPages,
    loadFirst, loadNext, loadPrev,
  } = useCursorPagination<Product>(fetcher, [search, filterCat, filterBrand, filterLocale, filterStatus])
  useEffect(() => { loadFirst() }, [loadFirst])

  const items = useMemo(() => {
    const sorted = [...rawItems]
    sorted.sort((a, b) => {
      let cmp = 0
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name)
      } else {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      return sortAsc ? cmp : -cmp
    })
    return sorted
  }, [rawItems, sortKey, sortAsc])

  useEffect(() => { setSelected(new Set()) }, [rawItems])

  const allSelected = items.length > 0 && selected.size === items.length
  const someSelected = selected.size > 0 && selected.size < items.length

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(items.map(p => p.id)))
    }
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

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
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n })
      loadFirst()
    } catch { toast.error(t("toast.failed")) }
  }

  const handleBulkDelete = async () => {
    if (selected.size === 0) return
    setBulkDeleting(true)
    let ok = 0
    let fail = 0
    for (const id of selected) {
      try {
        await productApi.delete(id)
        ok++
      } catch { fail++ }
    }
    setBulkDeleting(false)
    setSelected(new Set())
    if (fail === 0) toast.success(`${ok} product(s) deleted`)
    else toast.error(`${ok} deleted, ${fail} failed`)
    loadFirst()
  }

  const SortHeader = ({ label, sk }: { label: string; sk: SortKey }) => (
    <button onClick={() => toggleSort(sk)} className="inline-flex items-center gap-1 hover:text-foreground">
      {label}
      <ArrowUpDown className={`size-3 ${sortKey === sk ? "text-foreground" : "text-muted-foreground/40"}`} />
    </button>
  )

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("product.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("common.details")}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Input placeholder={`${t("common.search")}...`} value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-40 text-sm" />

          <SearchableSelect value={filterLocale} onChange={(v) => setFilterLocale(v)}
            placeholder="All Locales" options={[{ value: "id", label: "Indonesia" }, { value: "en", label: "English" }]} className="h-8 w-36" />
          <SearchableSelect value={filterCat} onChange={(v) => setFilterCat(v)}
            placeholder="All Categories" options={categories.map(c => ({ value: c.id, label: c.name }))} />
          <SearchableSelect value={filterBrand} onChange={(v) => setFilterBrand(v)}
            placeholder="All Brands" options={brands.map(b => ({ value: b.id, label: b.name }))} />
          <SearchableSelect value={filterStatus} onChange={(v) => setFilterStatus(v)}
            placeholder="All Status" options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} className="h-8 w-32" />

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

      {someSelected && canManage && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2">
          <span className="text-sm text-muted-foreground">{selected.size} selected</span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={bulkDeleting}>
                {bulkDeleting ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Trash2 className="mr-1 size-3" />}
                Delete Selected
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Delete {selected.size} product(s)?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete}>Delete All</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

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
                <th className="w-10 px-3 py-3"><Skeleton className="mx-auto size-4" /></th>
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
                  <td className="px-3 py-3"><Skeleton className="mx-auto size-4 rounded-sm" /></td>
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
                <th className="w-10 px-3 py-3">
                  <button onClick={toggleSelectAll} className="flex items-center justify-center">
                    {allSelected ? <CheckSquare className="size-4 text-primary" /> : someSelected ? <CheckSquare className="size-4 text-muted-foreground" /> : <Square className="size-4 text-muted-foreground" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Locale</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground"><SortHeader label="Name" sk="name" /></th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Brand</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((product) => (
                <tr key={product.id} className={`border-b last:border-0 hover:bg-muted/30 ${isLoading ? "opacity-50" : ""}`}>
                  <td className="px-3 py-3">
                    <Checkbox checked={selected.has(product.id)} onCheckedChange={() => toggleSelect(product.id)} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium uppercase ${
                      product.locale === "id" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>{product.locale}</span>
                  </td>
                  <td className="px-4 py-3 font-medium max-w-60 truncate" title={product.name}>{product.name}</td>
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
