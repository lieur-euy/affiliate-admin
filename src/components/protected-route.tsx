import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/providers/auth"

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <div className="flex min-h-svh items-center justify-center text-muted-foreground">Loading...</div>
  }

  if (!isAuthenticated || user?.role === "viewer") {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
