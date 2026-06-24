import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { articleTagApi, type ArticleTag, type ArticleTagReq } from "@/api/article-tags"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Tags } from "lucide-react"

const emptyForm: ArticleTagReq = { name: "", slug: "" }

export function ArticleTagsPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState<ArticleTag[]>([])
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ArticleTag | null>(null)
  const [form, setForm] = useState<ArticleTagReq>(emptyForm)

  const load = () => { articleTagApi.list().then((data) => setItems(data ?? [])).catch(() => {}) }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true) }
  const openEdit = (item: ArticleTag) => {
    setEditing(item)
    setForm({ name: item.name, slug: item.slug })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    try {
      if (editing) { await articleTagApi.update(editing.id, form); toast.success(t("toast.updated")) }
      else { await articleTagApi.create(form); toast.success(t("toast.created")) }
      setDialogOpen(false); load()
    } catch { toast.error(t("toast.failed")) }
  }

  const handleDelete = async (id: string) => {
    try { await articleTagApi.delete(id); toast.success(t("toast.deleted")); load() }
    catch { toast.error(t("toast.failed")) }
  }

  const filtered = items.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tags</h1>
          <p className="text-sm text-muted-foreground">{t("common.details")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder={`${t("common.search")}...`} value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-48 text-sm" />
          <Button onClick={openCreate}><Plus className="mr-1 size-4" />{t("common.add")}</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-muted-foreground">
          <Tags className="mb-2 size-12" />
          <p className="text-sm">{t("common.no_data")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">{t("common.name")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("common.slug")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.slug}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(item)}><Pencil className="size-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm"><Trash2 className="size-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Delete tag?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete &ldquo;{item.name}&rdquo;.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)}>{t("common.delete")}</AlertDialogAction>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Tag" : "Add Tag"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("common.name")} *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : e.target.value.toLowerCase().replace(/\s+/g, "-") })} placeholder="Tag name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("common.slug")}</label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="tag-slug" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleSave}>{editing ? t("common.update") : t("common.create")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
