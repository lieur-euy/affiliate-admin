import { useEffect, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { commentApi, type Comment } from "@/api/comments"
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
import { Skeleton } from "@/components/ui/skeleton"
import { PaginationBar } from "@/components/pagination-bar"
import { useCursorPagination } from "@/hooks/use-cursor-pagination"
import { SearchableSelect } from "@/components/searchable-select"
import { useRoleAccess } from "@/components/role-guard"
import { toast } from "sonner"
import {
  MessageSquareText, Check, X, Trash2, Loader2, Clock,
} from "lucide-react"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
}

export function CommentsPage() {
  const { t } = useTranslation()
  const canModerate = useRoleAccess(["admin", "editor"])
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  const fetcher = useCallback(
    (cursor?: string) => commentApi.list({
      limit: 12, cursor,
      search: search || undefined,
      status: filterStatus || undefined,
    }).then((r) => ({ data: r.data, cursor: r.cursor })),
    [search, filterStatus],
  )
  const {
    items, isLoading, loadError,
    hasNext, hasPrev, page, totalPages,
    loadFirst, loadNext, loadPrev,
  } = useCursorPagination<Comment>(fetcher, [search])
  useEffect(() => { loadFirst() }, [loadFirst])

  const handleApprove = async (id: string) => {
    if (!canModerate) return
    try {
      await commentApi.approve(id)
      toast.success("Comment approved")
      loadFirst()
    } catch { toast.error(t("toast.failed")) }
  }

  const handleReject = async (id: string) => {
    if (!canModerate) return
    try {
      await commentApi.reject(id)
      toast.success("Comment rejected")
      loadFirst()
    } catch { toast.error(t("toast.failed")) }
  }

  const handleDelete = async (id: string) => {
    try {
      await commentApi.delete(id)
      toast.success(t("toast.deleted"))
      loadFirst()
    } catch { toast.error(t("toast.failed")) }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comments</h1>
          <p className="text-sm text-muted-foreground">{t("common.details")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder={`${t("common.search")}...`} value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-40 text-sm" onKeyDown={(e) => e.key === "Enter" && loadFirst()} />
          <SearchableSelect value={filterStatus} onChange={(v) => { setFilterStatus(v); loadFirst() }}
            placeholder="All Status" options={[
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ]} />
        </div>
      </div>

      {loadError ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-destructive">
          <p className="mb-2 text-sm">{loadError}</p>
          <Button variant="outline" size="sm" onClick={loadFirst}>{t("common.retry")}</Button>
        </div>
      ) : items.length === 0 && isLoading ? (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Author</th>
                <th className="px-4 py-3 text-left font-medium">Content</th>
                <th className="px-4 py-3 text-left font-medium">Article</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-3 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1"><Skeleton className="size-8 rounded-md" /><Skeleton className="size-8 rounded-md" /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-muted-foreground">
          <MessageSquareText className="mb-2 size-12" />
          <p className="text-sm">{t("common.no_data")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          {isLoading && <div className="flex items-center justify-center gap-2 border-b bg-muted/30 px-4 py-1.5 text-xs text-muted-foreground"><Loader2 className="size-3 animate-spin" />Updating...</div>}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Author</th>
                <th className="px-4 py-3 text-left font-medium">Content</th>
                <th className="px-4 py-3 text-left font-medium">Article</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((comment) => (
                <tr key={comment.id} className={`border-b last:border-0 hover:bg-muted/30 ${isLoading ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{comment.author_name}</p>
                      <p className="text-xs text-muted-foreground">{comment.author_email}</p>
                    </div>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                    {comment.content}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {comment.article_title || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[comment.status]}`}>
                      {comment.status === "pending" && <Clock className="size-3" />}
                      {comment.status === "approved" && <Check className="size-3" />}
                      {comment.status === "rejected" && <X className="size-3" />}
                      {statusLabels[comment.status] || comment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canModerate && comment.status === "pending" && (
                        <>
                          <Button variant="ghost" size="icon-sm" onClick={() => handleApprove(comment.id)}
                            className="text-green-600 hover:text-green-700">
                            <Check className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => handleReject(comment.id)}
                            className="text-red-600 hover:text-red-700">
                            <X className="size-4" />
                          </Button>
                        </>
                      )}
                      {canModerate && comment.status === "approved" && (
                        <Button variant="ghost" size="icon-sm" onClick={() => handleReject(comment.id)}
                          className="text-red-600 hover:text-red-700">
                          <X className="size-4" />
                        </Button>
                      )}
                      {canModerate && comment.status === "rejected" && (
                        <Button variant="ghost" size="icon-sm" onClick={() => handleApprove(comment.id)}
                          className="text-green-600 hover:text-green-700">
                          <Check className="size-4" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this comment.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(comment.id)}>
                              {t("common.delete")}
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

      <PaginationBar page={page} totalPages={totalPages} hasNext={hasNext} hasPrev={hasPrev} isLoading={isLoading} onNext={loadNext} onPrev={loadPrev} />
    </div>
  )
}
