import { api } from "@/api/client"

export interface MediaFolder {
  id: string
  parent_id: string | null
  name: string
  created_at: string
  updated_at: string
}

export interface Media {
  id: string
  folder_id: string | null
  filename: string
  original_filename: string
  key: string
  mime_type: string
  size: number
  width: number
  height: number
  variants_json: Record<string, unknown>
  alt: string
  title: string
  caption: string
  created_by: string
  created_at: string
  url: string
}

interface CursorResp<T> {
  data: T[]
  cursor: string | null
  limit: number
}

function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  )
  if (entries.length === 0) return ""
  return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&")
}

export const mediaApi = {
  listFolders(params?: { search?: string; cursor?: string; limit?: number }) {
    return api.request<CursorResp<MediaFolder>>(
      "/media/folders" + buildQuery(params ?? {}),
    )
  },

  getFolder(id: string) {
    return api.request<MediaFolder>(`/media/folders/${id}`)
  },

  createFolder(name: string, parentId?: string | null) {
    return api.request<MediaFolder>("/media/folders", {
      method: "POST",
      body: JSON.stringify({ name, parent_id: parentId ?? null }),
    })
  },

  updateFolder(id: string, name: string) {
    return api.request<MediaFolder>(`/media/folders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    })
  },

  deleteFolder(id: string) {
    return api.request<void>(`/media/folders/${id}`, {
      method: "DELETE",
    })
  },

  list(params?: {
    folder_id?: string
    search?: string
    mime_type?: string
    cursor?: string
    limit?: number
  }) {
    return api.request<CursorResp<Media>>(
      "/media" + buildQuery(params ?? {}),
    )
  },

  getById(id: string) {
    return api.request<Media>(`/media/item/${id}`)
  },

  upload(file: File, folderId?: string | null) {
    const formData = new FormData()
    formData.append("file", file)
    if (folderId) {
      formData.append("folder_id", folderId)
    }
    return api.request<Media>("/media/upload", {
      method: "POST",
      body: formData,
    })
  },

  update(id: string, data: { alt?: string; title?: string; caption?: string }) {
    return api.request<Media>(`/media/item/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  delete(id: string) {
    return api.request<void>(`/media/item/${id}`, {
      method: "DELETE",
    })
  },
}
