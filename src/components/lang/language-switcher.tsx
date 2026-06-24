import { useTranslation } from "react-i18next"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language || "id"

  const toggle = () => {
    const next = current === "id" ? "en" : "id"
    i18n.changeLanguage(next)
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      title={current === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
    >
      <Globe className="size-3.5" />
      <span>{current === "id" ? "ID" : "EN"}</span>
    </button>
  )
}
