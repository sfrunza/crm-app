import { autoLogin } from "@/api/endpoints/auth"
import { GlobalFallback } from "@/components/global-fallback"
import { useAuthStore } from "@/stores/auth-store"
import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { toast } from "sonner"

function AutoLoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser } = useAuthStore()

  const token = searchParams.get("token")
  const returnTo = searchParams.get("return_to") || "/account"

  useEffect(() => {
    if (!token) {
      toast.error("Missing login token")
      navigate("/auth/login", { replace: true })
      return
    }

    ;(async () => {
      try {
        const { user } = await autoLogin(token)
        if (user) {
          setUser(user)
          navigate(returnTo, { replace: true })
        }
      } catch {
        toast.error("Invalid or expired login link")
        navigate("/auth/login", { replace: true })
      }
    })()
  }, [token, returnTo, navigate, setUser])

  return <GlobalFallback />
}

export const Component = AutoLoginPage
