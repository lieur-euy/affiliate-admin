import { useEffect, useState, useCallback } from "react"
import { categoryApi, type Category, type CategoryReq } from "@/api/categories"
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
import { Textarea } from "@/components/ui/textarea"
import { PaginationBar } from "@/components/pagination-bar"
import { useCursorPagination } from "@/hooks/use-cursor-pagination"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react"

const emptyForm: CategoryReq = {
  name: "",
  description: "",
  icon: "",
  parent_id: null,
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  spec_type: "",
}

export function CategoriesPage() {
  const [search, setSearch] = useState("")
  const fetcher = useCallback(
    (cursor?: string) => categoryApi.list({ limit: 12, cursor, search: search || undefined }).then((r) => ({ data: r.data, cursor: r.cursor })),
    [search],
  )
  const {
    items, isLoading, loadError,
    hasNext, hasPrev, page, totalPages,
    loadFirst, loadNext, loadPrev,
  } = useCursorPagination<Category>(fetcher, [search])
  useEffect(() => { loadFirst() }, [loadFirst])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState<CategoryReq>(emptyForm)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (item: Category) => {
    setEditing(item)
    setForm({
      name: item.name,
      description: item.description,
      icon: item.icon,
      parent_id: item.parent_id,
      meta_title: item.meta_title,
      meta_description: item.meta_description,
      meta_keywords: item.meta_keywords,
      spec_type: item.spec_type,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    try {
      if (editing) {
        await categoryApi.update(editing.id, form)
        toast.success("Category updated")
      } else {
        await categoryApi.create(form)
        toast.success("Category created")
      }
      setDialogOpen(false)
      loadFirst()
    } catch {
      toast.error("Failed to save category")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await categoryApi.delete(id)
      toast.success("Category deleted")
      loadFirst()
    } catch {
      toast.error("Failed to delete category")
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">Manage product categories</p>
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
            Add Category
          </Button>
        </div>
      </div>

      {isLoading && !loadError ? (
        <p className="py-8 text-center text-muted-foreground">Loading...</p>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-destructive">
          <p className="mb-2 text-sm">{loadError}</p>
          <Button variant="outline" size="sm" onClick={loadFirst}>Retry</Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-muted-foreground">
          <FolderTree className="mb-2 size-12" />
          <p className="text-sm">No categories yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-left font-medium">Description</th>
                <th className="px-4 py-3 text-left font-medium">Spec Type</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.slug}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                    {item.description || "—"}
                  </td>
                  <td className="px-4 py-3">{item.spec_type || "—"}</td>
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
                            <AlertDialogTitle>Delete category?</AlertDialogTitle>
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
            <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon</label>
              <Input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="Icon name or URL"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Spec Type</label>
              <select
                value={form.spec_type}
                onChange={(e) => setForm({ ...form, spec_type: e.target.value })}
                className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
              >
                <option value="">None</option>
                <option value="cpu">CPU</option>
                <option value="gpu">GPU</option>
                <option value="ram">RAM</option>
                <option value="ssd">SSD</option>
                <option value="hdd">HDD</option>
              </select>
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
