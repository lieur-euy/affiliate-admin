const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export function getAuthToken(): string | null {
  return authToken
}

export class ApiError extends Error {
  status: number
  constructor(
    status: number,
    message: string,
  ) {
    super(message)
    this.status = status
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.error || "Something went wrong")
  }

  return res.json()
}

export const api = { request }
