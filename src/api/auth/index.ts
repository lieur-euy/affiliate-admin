import { api } from "@/api/client"

export interface UserResponse {
  id: string
  username: string
  email: string
  role: string
}

export interface AuthResponse {
  token: string
  user: UserResponse
}

export const authApi = {
  login(email: string, password: string) {
    return api.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  register(username: string, email: string, password: string) {
    return api.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    })
  },

  logout() {
    return api.request<{ message: string }>("/auth/logout", {
      method: "POST",
    })
  },

  me() {
    return api.request<UserResponse>("/auth/me")
  },
}
