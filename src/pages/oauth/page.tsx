import { useEffect, useState, useCallback } from "react"
import { oauthApi, type OAuthClient, type OAuthClientCreateReq, type OAuthClientUpdateReq } from "@/api/oauth"
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
import { Switch } from "@/components/ui/switch"
import { PaginationBar } from "@/components/pagination-bar"
import { useCursorPagination } from "@/hooks/use-cursor-pagination"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Key, Database } from "lucide-react"

const emptyCreateForm: OAuthClientCreateReq = {
  name: "",
  token_expiry: "30d",
  rate_limit: 100,
}

export function OAuthPage() {
  const [search, setSearch] = useState("")
  const fetcher = useCallback(
    (cursor?: string) => oauthApi.list({ limit: 12, cursor, search: search || undefined }).then((r) => ({ data: r.data, cursor: r.cursor })),
    [search],
  )
  const {
    items, isLoading, loadError,
    hasNext, hasPrev, page, totalPages,
    loadFirst, loadNext, loadPrev,
  } = useCursorPagination<OAuthClient>(fetcher, [search])
  useEffect(() => { loadFirst() }, [loadFirst])

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<OAuthClientCreateReq>(emptyCreateForm)
  const [createdResult, setCreatedResult] = useState<{ client_id: string; client_secret: string } | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<OAuthClient | null>(null)
  const [editForm, setEditForm] = useState<OAuthClientUpdateReq>({ name: "", token_expiry: "30d", rate_limit: 100, is_active: true })

  const [secretOpen, setSecretOpen] = useState(false)
  const [secretResult, setSecretResult] = useState<string | null>(null)

  const openCreate = () => {
    setCreateForm({ ...emptyCreateForm })
    setCreatedResult(null)
    setCreateOpen(true)
  }

  const handleCreate = async () => {
    if (!createForm.name.trim()) return
    try {
      const result = await oauthApi.create(createForm)
      setCreatedResult({ client_id: result.client_id, client_secret: result.client_secret || "" })
      toast.success("OAuth client created")
      loadFirst()
    } catch {
      toast.error("Failed to create OAuth client")
    }
  }

  const openEdit = (item: OAuthClient) => {
    setEditing(item)
    setEditForm({
      name: item.name,
      token_expiry: item.token_expiry,
      rate_limit: item.rate_limit,
      is_active: item.is_active,
    })
    setEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!editing) return
    try {
      await oauthApi.update(editing.id, editForm)
      toast.success("OAuth client updated")
      setEditOpen(false)
      loadFirst()
    } catch {
      toast.error("Failed to update OAuth client")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await oauthApi.delete(id)
      toast.success("OAuth client deleted")
      loadFirst()
    } catch {
      toast.error("Failed to delete OAuth client")
    }
  }

  const handleRegenerate = async (id: string) => {
    try {
      const result = await oauthApi.regenerateSecret(id)
      setSecretResult(result.client_secret || "")
      setSecretOpen(true)
    } catch {
      toast.error("Failed to regenerate secret")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const expiryLabel = (v: string) => {
    const map: Record<string, string> = { "7d": "7 Days", "30d": "30 Days", "90d": "90 Days", unlimited: "Unlimited" }
    return map[v] || v
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">OAuth Clients</h1>
          <p className="text-sm text-muted-foreground">Manage API client credentials</p>
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
            Add Client
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
          <Database className="mb-2 size-12" />
          <p className="text-sm">No OAuth clients yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Client ID</th>
                <th className="px-4 py-3 text-left font-medium">Token Expiry</th>
                <th className="px-4 py-3 text-left font-medium">Rate Limit</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground font-mono text-xs">
                    {item.client_id}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                      {expiryLabel(item.token_expiry)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.rate_limit}/min</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${item.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(item)} title="Edit">
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleRegenerate(item.id)} title="Regenerate secret">
                        <Key className="size-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete OAuth client?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete &ldquo;{item.name}&rdquo; and revoke all tokens.
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

      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) setCreatedResult(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{createdResult ? "Client Created" : "Add OAuth Client"}</DialogTitle>
          </DialogHeader>
          {createdResult ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                Make sure to copy the client secret now. You won&apos;t be able to see it again.
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Client ID</label>
                <div className="flex gap-2">
                  <Input value={createdResult.client_id} readOnly className="font-mono text-xs" />
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(createdResult.client_id)}>
                    Copy
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Client Secret</label>
                <div className="flex gap-2">
                  <Input value={createdResult.client_secret} readOnly className="font-mono text-xs" />
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(createdResult.client_secret)}>
                    Copy
                  </Button>
                </div>
              </div>
              <Button className="w-full" onClick={() => { setCreateOpen(false); setCreatedResult(null) }}>
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Client name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Token Expiry</label>
                <select
                  value={createForm.token_expiry}
                  onChange={(e) => setCreateForm({ ...createForm, token_expiry: e.target.value })}
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
                >
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="90d">90 Days</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>
              <div className="space-y-2">
              <label className="text-sm font-medium">Rate Limit (requests/minute)</label>
              <Input
                type="number"
                value={createForm.rate_limit}
                onChange={(e) => setCreateForm({ ...createForm, rate_limit: Number(e.target.value) })}
                min={1}
              />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Create</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit OAuth Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Client name"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Active</label>
              <Switch
                checked={editForm.is_active ?? true}
                onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Token Expiry</label>
              <select
                value={editForm.token_expiry}
                onChange={(e) => setEditForm({ ...editForm, token_expiry: e.target.value })}
                className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
              >
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rate Limit (requests/minute)</label>
              <Input
                type="number"
                value={editForm.rate_limit}
                onChange={(e) => setEditForm({ ...editForm, rate_limit: Number(e.target.value) })}
                min={1}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate}>Update</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={secretOpen} onOpenChange={setSecretOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Secret Regenerated</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
              The old secret has been revoked. Make sure to copy the new secret now.
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Client Secret</label>
              <div className="flex gap-2">
                <Input value={secretResult || ""} readOnly className="font-mono text-xs" />
                <Button variant="outline" size="sm" onClick={() => secretResult && copyToClipboard(secretResult)}>
                  Copy
                </Button>
              </div>
            </div>
            <Button className="w-full" onClick={() => setSecretOpen(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
