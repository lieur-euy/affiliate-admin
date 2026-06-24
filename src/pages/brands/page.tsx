import { useEffect, useState, useCallback } from "react"
import { brandApi, type Brand, type BrandReq } from "@/api/brands"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PaginationBar } from "@/components/pagination-bar"
import { useCursorPagination } from "@/hooks/use-cursor-pagination"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Store } from "lucide-react"

const emptyForm: BrandReq = { name: "", logo_url: "" }

export function BrandsPage() {
  const [search, setSearch] = useState("")
  const fetcher = useCallback(
    (cursor?: string) => brandApi.list({ limit: 12, cursor, search: search || undefined }).then((r) => ({ data: r.data, cursor: r.cursor })),
    [search],
  )
  const {
    items, isLoading, loadError,
    hasNext, hasPrev, page, totalPages,
    loadFirst, loadNext, loadPrev,
  } = useCursorPagination<Brand>(fetcher, [search])
  useEffect(() => { loadFirst() }, [loadFirst])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [form, setForm] = useState<BrandReq>(emptyForm)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (item: Brand) => {
    setEditing(item)
    setForm({ name: item.name, logo_url: item.logo_url })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    try {
      if (editing) {
        await brandApi.update(editing.id, form)
        toast.success("Brand updated")
      } else {
        await brandApi.create(form)
        toast.success("Brand created")
      }
      setDialogOpen(false)
      loadFirst()
    } catch {
      toast.error("Failed to save brand")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await brandApi.delete(id)
      toast.success("Brand deleted")
      loadFirst()
    } catch {
      toast.error("Failed to delete brand")
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brands</h1>
          <p className="text-sm text-muted-foreground">Manage product brands</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-48 text-sm"
          />
          <Button onClick={openCreate}>
            <Plus className="mr-1 size-4" />
            Add Brand
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-muted-foreground">Loading...</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-muted-foreground">
          <Store className="mb-2 size-12" />
          <p className="text-sm">No brands yet</p>
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-destructive">
          <p className="mb-2 text-sm">{loadError}</p>
          <Button variant="outline" size="sm" onClick={loadFirst}>Retry</Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-left font-medium">Logo URL</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.slug}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                    {item.logo_url || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(item)}>
                        <Pencil className="size-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete brand?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete &ldquo;{item.name}&rdquo;.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaginationBar
        page={page}
        totalPages={totalPages}
        hasNext={hasNext}
        hasPrev={hasPrev}
        isLoading={isLoading}
        onNext={loadNext}
        onPrev={loadPrev}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Brand" : "Add Brand"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Brand name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo URL</label>
              <Input
                value={form.logo_url}
                onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
