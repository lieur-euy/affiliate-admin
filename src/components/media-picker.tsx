import { useEffect, useState, useCallback, useRef } from "react"
import { mediaApi, type Media, type MediaFolder } from "@/api/media"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Folder, ChevronRight, Home, Search, File, Upload, Plus, Loader2, X, Image, Check,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface MediaPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (media: Media) => void
  onSelectMultiple?: (media: Media[]) => void
  multi?: boolean
}

export function MediaPicker({ open, onOpenChange, onSelect, onSelectMultiple, multi }: MediaPickerProps) {
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [files, setFiles] = useState<Media[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [uploading, setUploading] = useState(false)
  const [imgError, setImgError] = useState<Set<string>>(new Set())
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dragCounter.current++; if (e.dataTransfer.items?.length) setDragOver(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dragCounter.current--; if (dragCounter.current <= 0) setDragOver(false) }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation() }
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false); dragCounter.current = 0
    const files = e.dataTransfer.files
    if (!files?.length) return
    setUploading(true)
    let success = 0
    for (let i = 0; i < files.length; i++) {
      try { await mediaApi.upload(files[i], currentFolderId ?? undefined); success++ } catch { /* skip */ }
    }
    setUploading(false); load()
    if (success > 0) toast.success(`${success} file(s) uploaded`)
  }

  const load = useCallback(async () => {
    try {
      const [folderRes, fileRes] = await Promise.all([
        mediaApi.listFolders({ limit: 100 }),
        mediaApi.list({ folder_id: currentFolderId ?? undefined, search: search || undefined, limit: 50 }),
      ])
      setFolders(Array.isArray(folderRes?.data) ? folderRes.data : [])
      setFiles(Array.isArray(fileRes?.data) ? fileRes.data : [])
    } catch { /* skip */ }
  }, [currentFolderId, search])

  useEffect(() => { if (open) load() }, [open, load])
  useEffect(() => { if (!open) { setSelected(new Set()); setSearch("") } }, [open])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await mediaApi.upload(file, currentFolderId ?? undefined)
      toast.success("Uploaded"); load()
    } catch { toast.error("Upload failed") }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = "" }
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) return
    try {
      await mediaApi.createFolder(newFolderName, currentFolderId)
      toast.success("Folder created"); setNewFolderName(""); setShowNewFolder(false); load()
    } catch { toast.error("Failed") }
  }

  const toggleFile = (id: string) => {
    if (!multi) return
    setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  const confirmMulti = () => {
    const picked = files.filter((f) => selected.has(f.id))
    onSelectMultiple?.(picked)
    onOpenChange(false)
  }

  const breadcrumb: MediaFolder[] = []
  if (currentFolderId) {
    const map = new Map(folders.map((f) => [f.id, f]))
    let current = map.get(currentFolderId)
    while (current) { breadcrumb.unshift(current); current = current.parent_id ? (map.get(current.parent_id) ?? undefined) : undefined }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[90vw] sm:!max-w-[90vw] md:!max-w-[90vw] lg:!max-w-[1200px] p-0 gap-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-base font-semibold">
            {multi ? "Select Media (multi)" : "Select Media"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {showNewFolder && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2.5">
              <Folder className="size-4 shrink-0 text-muted-foreground" />
              <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name" className="h-8 text-sm flex-1" autoFocus
                onKeyDown={(e) => e.key === "Enter" && createFolder()} />
              <Button size="sm" onClick={createFolder} className="h-8">Create</Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowNewFolder(false); setNewFolderName("") }} className="h-8 px-2">
                <X className="size-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search files by name..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="h-9 pl-9 text-sm" />
            </div>
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} className="h-9 gap-1.5 shrink-0">
              {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
              {uploading ? "Uploading..." : "Upload"}
            </Button>
            <input ref={fileRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx" className="hidden" onChange={handleUpload} />
            <Button size="sm" variant="outline" onClick={() => setShowNewFolder(!showNewFolder)} className="h-9 gap-1.5 shrink-0">
              <Plus className="size-3.5" />Folder
            </Button>
            {multi && (
              <Button size="sm" onClick={confirmMulti} disabled={selected.size === 0} className="h-9 gap-1.5 shrink-0">
                <Check className="size-3.5" />
                Select ({selected.size})
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <button onClick={() => { setCurrentFolderId(null); setImgError(new Set()); setSelected(new Set()) }}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 hover:bg-muted transition-colors">
              <Home className="size-3.5" />All Media
            </button>
            {breadcrumb.map((f) => (
              <span key={f.id} className="flex items-center gap-0.5">
                <ChevronRight className="size-3.5" />
                <button onClick={() => { setCurrentFolderId(f.id); setImgError(new Set()) }}
                  className="rounded-md px-2 py-1 hover:bg-muted transition-colors">{f.name}</button>
              </span>
            ))}
          </div>

          <div className="relative grid max-h-[32rem] grid-cols-4 gap-4 overflow-y-auto md:grid-cols-5 lg:grid-cols-6"
            onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
            {folders.filter((f) => (f.parent_id ?? null) === currentFolderId).map((folder) => (
              <button key={folder.id} onClick={() => { setCurrentFolderId(folder.id); setImgError(new Set()); setSelected(new Set()) }}
                className="group flex flex-col items-center gap-2 rounded-lg border border-dashed py-6 transition-all hover:border-primary hover:bg-accent/30">
                <Folder className="size-10 text-amber-500" />
                <span className="max-w-full truncate px-2 text-sm font-medium">{folder.name}</span>
              </button>
            ))}
            {files.map((file) => {
              const isSelected = selected.has(file.id)
              return (
                <button key={file.id} onClick={() => multi ? toggleFile(file.id) : (onSelect(file), onOpenChange(false))}
                  className={cn(
                    "group relative flex flex-col items-center gap-2 rounded-lg border p-2 transition-all hover:border-primary hover:shadow-sm",
                    isSelected && "border-primary ring-2 ring-primary/30"
                  )}>
                  {file.mime_type.startsWith("image/") && !imgError.has(file.id) ? (
                    <div className="aspect-square w-full overflow-hidden rounded-md bg-muted">
                      <img src={file.url} alt={file.alt || file.original_filename}
                        className="size-full object-cover" loading="lazy"
                        onError={() => setImgError((prev) => new Set(prev).add(file.id))} />
                    </div>
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center rounded-md bg-muted">
                      <File className="size-10 text-muted-foreground" />
                    </div>
                  )}
                  <span className="w-full truncate px-1 text-center text-xs text-muted-foreground">{file.original_filename}</span>
                  {multi && isSelected && (
                    <div className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" />
                    </div>
                  )}
                </button>
              )
            })}
            {folders.filter((f) => (f.parent_id ?? null) === currentFolderId).length === 0 && files.length === 0 && (
              <div className="col-span-full flex flex-col items-center gap-2 py-16 text-muted-foreground">
                <Image className="size-12" />
                <p className="text-sm font-medium">No files found</p>
                <p className="text-xs">Upload a file or create a folder to get started</p>
              </div>
            )}
            {dragOver && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-primary/60 bg-primary/5 px-8 py-6">
                  <Upload className="size-8 text-primary/60" />
                  <p className="text-sm font-semibold text-primary">Drop to upload</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
