import { Navigate } from "react-router-dom"
import { useAuth } from "@/providers/auth"
import { type ReactNode } from "react"

interface RoleGuardProps {
  roles: string[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGuard({ roles, children, fallback }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user) return null

  if (!roles.includes(user.role)) {
    if (fallback) return <>{fallback}</>
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export function useRoleAccess(allowedRoles: string[]) {
  const { user } = useAuth()
  return user ? allowedRoles.includes(user.role) : false
}
