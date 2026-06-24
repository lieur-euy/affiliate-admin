import { api } from "@/api/client"

export interface OAuthClient {
  id: string
  client_id: string
  name: string
  token_expiry: string
  rate_limit: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OAuthClientCreateReq {
  name: string
  token_expiry?: string
  rate_limit?: number
}

export interface OAuthClientUpdateReq {
  name: string
  token_expiry?: string
  rate_limit?: number
  is_active?: boolean
}

export interface ClientResponse extends OAuthClient {
  client_secret?: string
}

interface CursorResp<T> {
  data: T[]
  cursor: string | null
  limit: number
}

export const oauthApi = {
  list(params?: { cursor?: string; limit?: number; search?: string }) {
    const q = params
      ? "?" + Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => `${k}=${v}`).join("&")
      : ""
    return api.request<CursorResp<OAuthClient>>("/oauth/clients" + q)
  },

  getById(id: string) {
    return api.request<OAuthClient>(`/oauth/clients/${id}`)
  },

  create(data: OAuthClientCreateReq) {
    return api.request<ClientResponse>("/oauth/clients", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  update(id: string, data: OAuthClientUpdateReq) {
    return api.request<OAuthClient>(`/oauth/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  delete(id: string) {
    return api.request<void>(`/oauth/clients/${id}`, {
      method: "DELETE",
    })
  },

  regenerateSecret(id: string) {
    return api.request<ClientResponse>(`/oauth/clients/${id}/regenerate`, {
      method: "POST",
    })
  },
}
