import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/providers/auth"

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const loggedInUser = await login(email, password)
      if (loggedInUser.role === "viewer") {
        setError("You don't have access to the admin panel")
        setIsLoading(false)
        return
      }
      navigate("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <LoginForm
        onSubmit={handleLogin}
        isLoading={isLoading}
        error={error}
        className="w-full max-w-sm"
      />
    </div>
  )
}
