import { useEffect, useState, useCallback, useRef } from "react"
import { mediaApi, type Media, type MediaFolder } from "@/api/media"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Folder,
  File,
  Upload,
  Plus,
  Trash2,
  ChevronRight,
  Home,
  FileImage,
  FileText,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet,
  Search,
  Copy,
  Check,
} from "lucide-react"

function formatSize(bytes: number) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getFileIcon(mime: string) {
  if (mime.startsWith("image/")) return <FileImage className="size-8 text-rose-500" />
  if (mime.startsWith("video/")) return <FileVideo className="size-8 text-blue-500" />
  if (mime.startsWith("audio/")) return <FileAudio className="size-8 text-amber-500" />
  if (mime.includes("pdf")) return <FileText className="size-8 text-red-500" />
  if (mime.includes("spreadsheet") || mime.includes("excel") || mime.includes("csv"))
    return <FileSpreadsheet className="size-8 text-emerald-500" />
  if (mime.includes("zip") || mime.includes("rar") || mime.includes("tar") || mime.includes("7z"))
    return <FileArchive className="size-8 text-purple-500" />
  return <File className="size-8 text-muted-foreground" />
}

function findPath(
  folders: MediaFolder[],
  targetId: string | null,
): MediaFolder[] {
  if (!targetId) return []
  const map = new Map(folders.map((f) => [f.id, f]))
  const path: MediaFolder[] = []
  let current = map.get(targetId)
  while (current) {
    path.unshift(current)
    current = (current.parent_id ?? null) ? map.get(current.parent_id) : undefined
  }
  return path
}

function MediaThumb({ file, onClick }: { file: Media; onClick: () => void }) {
  const [imgError, setImgError] = useState(false)
  const thumbUrl = file.variants_json?.thumb as string | undefined

  return (
    <button
      onClick={onClick}
      className="group relative flex w-full flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md"
    >
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-muted">
        {file.mime_type.startsWith("image/") && !imgError ? (
          <img
            src={thumbUrl || file.url}
            alt={file.alt || file.original_filename}
            className="size-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-1">
            {getFileIcon(file.mime_type)}
            <span className="px-2 text-center text-[10px] leading-tight text-muted-foreground">
              {file.mime_type.split("/")[1]?.toUpperCase() || file.mime_type}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-0.5 p-2.5 text-left">
        <span className="truncate text-xs font-medium">
          {file.original_filename}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {formatSize(file.size)}
          {file.width > 0 && ` \u00B7 ${file.width}\u00D7${file.height}`}
        </span>
      </div>
    </button>
  )
}
export function MediaPage() {
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [files, setFiles] = useState<Media[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const [editingFile, setEditingFile] = useState<Media | null>(null)
  const [editAlt, setEditAlt] = useState("")
  const [editTitle, setEditTitle] = useState("")
  const [editCaption, setEditCaption] = useState("")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadTotal, setUploadTotal] = useState(0)
  const [uploadDone, setUploadDone] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setDragOver(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); dragCounter.current--
    if (dragCounter.current === 0) setDragOver(false)
  }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation() }
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false); dragCounter.current = 0
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    setUploading(true); setUploadTotal(files.length); setUploadDone(0)
    let success = 0
    for (let i = 0; i < files.length; i++) {
      try { await mediaApi.upload(files[i], currentFolderId); success++ }
      catch { /* skip */ }
      setUploadDone(i + 1)
    }
    setUploading(false); loadData()
    if (success > 0) toast.success(`${success} file(s) uploaded`)
  }

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const [folderRes, fileRes] = await Promise.all([
        mediaApi.listFolders({ limit: 100 }),
        mediaApi.list({
          folder_id: currentFolderId ?? undefined,
          search: searchQuery || undefined,
          limit: 100,
        }),
      ])
      setFolders(Array.isArray(folderRes?.data) ? folderRes.data : [])
      setFiles(Array.isArray(fileRes?.data) ? fileRes.data : [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load media"
      setLoadError(msg)
      console.error("Media load error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [currentFolderId, searchQuery])

  useEffect(() => {
    loadData()
  }, [loadData])

  const currentFolders = (folders ?? []).filter(
    (f) => (f.parent_id ?? null) === currentFolderId,
  )
  const breadcrumb = findPath(folders, currentFolderId)

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    try {
      await mediaApi.createFolder(newFolderName.trim(), currentFolderId)
      setNewFolderName("")
      setFolderDialogOpen(false)
      toast.success("Folder created")
      loadData()
    } catch {
      toast.error("Failed to create folder")
    }
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const deleteSelected = async () => {
    const ids = [...selected]
    setSelected(new Set())
    setFiles((prev) => prev.filter((f) => !ids.includes(f.id)))
    setFolders((prev) => prev.filter((f) => !ids.includes(f.id)))
    let ok = 0
    for (const id of ids) {
      try { await mediaApi.delete(id); ok++ } catch { /* skip */ }
    }
    if (ok > 0) toast.success(`${ok} item(s) deleted`)
  }

  const handleDeleteFolder = async (id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id))
    try { await mediaApi.deleteFolder(id); toast.success("Folder deleted") }
    catch { toast.error("Failed to delete folder"); loadData() }
  }

  const handleDeleteFile = async (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next })
    try { await mediaApi.delete(id); toast.success("File deleted") }
    catch { toast.error("Failed to delete file"); loadData() }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true); setUploadTotal(files.length); setUploadDone(0)
    let success = 0
    for (let i = 0; i < files.length; i++) {
      try { await mediaApi.upload(files[i], currentFolderId); success++ }
      catch { /* skip failed */ }
      setUploadDone(i + 1)
    }
    setUploading(false); loadData()
    if (success > 0) toast.success(`${success} file(s) uploaded`)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSaveFile = async () => {
    if (!editingFile) return
    try {
      await mediaApi.update(editingFile.id, {
        alt: editAlt,
        title: editTitle,
        caption: editCaption,
      })
      setEditingFile(null)
      toast.success("File updated")
      loadData()
    } catch {
      toast.error("Failed to update file")
    }
  }

  const openFileDialog = (file: Media) => {
    setEditAlt(file.alt)
    setEditTitle(file.title)
    setEditCaption(file.caption)
    setCopiedKey(null)
    setEditingFile(file)
  }

  const copyUrl = (url: string, key: string) => {
    navigator.clipboard.writeText(url)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading media...
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-destructive">
        <p className="mb-2 text-sm">{loadError}</p>
        <Button variant="outline" size="sm" onClick={loadData}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <button
            onClick={() => setCurrentFolderId(null)}
            className="flex items-center gap-1 rounded px-2 py-1 hover:bg-muted"
          >
            <Home className="size-4" />
            Media
          </button>
          {breadcrumb.map((f) => (
            <span key={f.id} className="flex items-center gap-1">
              <ChevronRight className="size-4" />
              <button
                onClick={() => setCurrentFolderId(f.id)}
                className="rounded px-2 py-1 hover:bg-muted"
              >
                {f.name}
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-48 pl-8 text-sm"
            />
          </div>

          <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-1 size-4" />
                Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Folder</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleCreateFolder()
                }}
                className="space-y-4"
              >
                <Input
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFolderDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload className="mr-1 size-4" />
            {uploading ? `${uploadDone} / ${uploadTotal}` : "Upload"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2.5">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>Clear</Button>
            <Button size="sm" variant="destructive" onClick={deleteSelected}>
              <Trash2 className="mr-1 size-4" /> Delete
            </Button>
          </div>
        </div>
      )}

      {currentFolders.length === 0 && files.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-muted-foreground">
          <Folder className="mb-2 size-12" />
          <p className="text-sm font-medium">This folder is empty</p>
          <p className="text-xs">Upload files or create a folder</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {currentFolders.map((folder) => (
            <div key={folder.id} className="group relative">
              <div className={`rounded-lg border bg-card transition-all ${selected.has("f_"+folder.id) ? "border-primary ring-2 ring-primary/30" : ""}`}>
                <button onClick={() => setCurrentFolderId(folder.id)}
                  className="flex w-full flex-col items-center gap-2 p-6"
                >
                  <Folder className="size-14 text-blue-500" />
                  <span className="max-w-full truncate text-center text-sm font-medium">{folder.name}</span>
                </button>
              </div>
              <button onClick={() => toggleSelect("f_"+folder.id)}
                className="absolute left-1.5 top-1.5 flex size-5 items-center justify-center rounded border bg-background text-xs shadow-sm hover:bg-muted">
                {selected.has("f_"+folder.id) ? <Check className="size-3" /> : null}
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="absolute right-1.5 top-1.5 hidden rounded-md bg-background/80 p-1.5 text-muted-foreground shadow-sm backdrop-blur hover:bg-destructive/10 hover:text-destructive group-hover:block">
                    <Trash2 className="size-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete folder?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete &ldquo;{folder.name}&rdquo;.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteFolder(folder.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}

          {files.map((file) => (
            <div key={file.id} className="group relative">
              <div className={`rounded-lg transition-all ${selected.has(file.id) ? "ring-2 ring-primary/30" : ""}`}>
                <MediaThumb file={file} onClick={() => openFileDialog(file)} />
              </div>
              <button onClick={() => toggleSelect(file.id)}
                className="absolute left-1.5 top-1.5 flex size-5 items-center justify-center rounded border bg-background text-xs shadow-sm hover:bg-muted">
                {selected.has(file.id) ? <Check className="size-3" /> : null}
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="absolute right-1.5 top-1.5 hidden rounded-md bg-background/80 p-1.5 text-muted-foreground shadow-sm backdrop-blur hover:bg-destructive/10 hover:text-destructive group-hover:block">
                    <Trash2 className="size-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete file?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete &ldquo;
                      {file.original_filename}&rdquo; ({formatSize(file.size)}).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={!!editingFile}
        onOpenChange={(open) => {
          if (!open) setEditingFile(null)
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>File Details</DialogTitle>
          </DialogHeader>
          {editingFile && (
            <div className="space-y-5">
              <div className="flex items-center justify-center rounded-lg bg-muted">
                {editingFile.mime_type.startsWith("image/") ? (
                  <img
                    src={editingFile.url}
                    alt={editAlt}
                    className="max-h-56 rounded-md object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 py-8">
                    {getFileIcon(editingFile.mime_type)}
                    <span className="text-sm text-muted-foreground">
                      {editingFile.mime_type}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="text-muted-foreground">Name</div>
                <div className="truncate font-medium">
                  {editingFile.original_filename}
                </div>

                <div className="text-muted-foreground">Type</div>
                <div>{editingFile.mime_type}</div>

                <div className="text-muted-foreground">Size</div>
                <div>{formatSize(editingFile.size)}</div>

                {editingFile.width > 0 && (
                  <>
                    <div className="text-muted-foreground">Dimensions</div>
                    <div>
                      {editingFile.width} &times; {editingFile.height} px
                    </div>
                  </>
                )}

                <div className="text-muted-foreground">Created</div>
                <div>{formatDate(editingFile.created_at)}</div>

                <div className="text-muted-foreground">Storage</div>
                <div className="truncate text-xs">{editingFile.filename}</div>

                <div className="text-muted-foreground">URL</div>
                <div className="flex items-center gap-1">
                  <span className="flex-1 truncate text-xs text-blue-600 dark:text-blue-400">
                    {editingFile.url}
                  </span>
                  <button
                    onClick={() => copyUrl(editingFile.url, "url")}
                    className="shrink-0 rounded p-1 hover:bg-muted"
                    title="Copy URL"
                  >
                    {copiedKey === "url" ? (
                      <Check className="size-3.5 text-green-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {Object.keys(editingFile.variants_json).length > 0 && (
                <>
                  <div className="col-span-2 mt-1 border-t pt-3 text-xs font-medium text-muted-foreground">
                    Variants
                  </div>
                  {Object.entries(editingFile.variants_json).map(
                    ([variant, url]) => (
                      <div key={variant} className="contents">
                        <div className="text-muted-foreground capitalize">
                          {variant}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="flex-1 truncate text-xs text-blue-600 dark:text-blue-400">
                            {String(url)}
                          </span>
                          <button
                            onClick={() => copyUrl(String(url), variant)}
                            className="shrink-0 rounded p-1 hover:bg-muted"
                            title={`Copy ${variant} URL`}
                          >
                            {copiedKey === variant ? (
                              <Check className="size-3.5 text-green-500" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ),
                  )}
                </>
              )}

              <div className="col-span-2">
                <Separator />
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Alt Text</label>
                  <Input
                    value={editAlt}
                    onChange={(e) => setEditAlt(e.target.value)}
                    placeholder="Describe the image"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Image title"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Caption</label>
                  <Input
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Caption text"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingFile(null)}>
                  Close
                </Button>
                <Button onClick={handleSaveFile}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {dragOver && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary/60 bg-primary/5 px-12 py-10">
            <Upload className="size-12 text-primary/60" />
            <p className="text-lg font-semibold text-primary">Drop files to upload</p>
            <p className="text-sm text-muted-foreground">Drop your files here to upload them to this folder</p>
          </div>
        </div>
      )}
    </div>
  )
}
