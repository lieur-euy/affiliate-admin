import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { articleApi, type ArticleReq } from "@/api/articles"
import { articleCategoryApi, type ArticleCategory } from "@/api/article-categories"
import { seoApi, type SEOReq } from "@/api/seo"
import { SearchableSelect } from "@/components/searchable-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RichEditor } from "@/components/rich-editor"
import { MediaPicker } from "@/components/media-picker"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, Save, Image as ImageIcon, X } from "lucide-react"

const emptyArticle: ArticleReq = {
  title: "",
  excerpt: "",
  content: "",
  image_url: "",
  category_id: null,
  tags: [],
  author: "",
  is_active: true,
  is_featured: false,
}

const emptySeo: SEOReq = {
  meta_title: "", meta_description: "", meta_keywords: "",
  og_title: "", og_description: "", og_image: "",
  canonical_url: "", robots: "",
}

const tabs = ["article.title", "article.content", "article.seo"]

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

export function ArticleFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [tab, setTab] = useState(0)
  const [categories, setCategories] = useState<ArticleCategory[]>([])
  const [form, setForm] = useState<ArticleReq>(emptyArticle)
  const [sf, setSf] = useState<SEOReq>(emptySeo)
  const [saving, setSaving] = useState(false)
  const [contentLang, setContentLang] = useState("id")
  const slugEdited = useRef(false)
  const [dirty, setDirty] = useState(false)
  const [mediaOpen, setMediaOpen] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState<string | null>(null)

  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = "" }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [dirty])

  const markDirty = () => { if (!dirty) setDirty(true) }

  const handleNav = (path: string) => {
    if (dirty) setConfirmLeave(path)
    else navigate(path)
  }

  useEffect(() => {
    articleCategoryApi.list().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    if (!id) return
    articleApi.getById(id).then((a) => {
      setForm({
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        content: a.content,
        image_url: a.image_url,
        category_id: a.category_id,
        tags: a.tags ?? [],
        author: a.author,
        is_active: a.is_active,
        is_featured: a.is_featured,
        translations: a.translations ?? {},
      })
    }).catch(() => navigate("/articles", { replace: true }))

    seoApi.getByArticleId(id).then((s) => {
      setSf({
        meta_title: s.meta_title, meta_description: s.meta_description,
        meta_keywords: s.meta_keywords, og_title: s.og_title,
        og_description: s.og_description, og_image: s.og_image,
        canonical_url: s.canonical_url, robots: s.robots,
      })
    }).catch(() => {})
  }, [id, navigate])

  const getTrans = (key: string) => {
    const trans = form.translations?.[contentLang] as Record<string, string> | undefined
    return trans?.[key] ?? (contentLang === "id" ? (form as Record<string, unknown>)[key] ?? "" : "")
  }

  const setTrans = (key: string, value: string) => {
    const trans = { ...((form.translations?.[contentLang] as Record<string, string>) ?? {}) }
    trans[key] = value
    setForm({ ...form, translations: { ...form.translations, [contentLang]: trans } })
  }

  const handleMediaSelect = (media: { url: string }) => {
    setForm({ ...form, image_url: media.url })
  }

  const saveArticle = async (): Promise<string | null> => {
    setSaving(true)
    try {
      const translations = form.translations ?? {}
      const res = isEdit
        ? await articleApi.update(id!, { ...form, translations })
        : await articleApi.create({ ...form, translations })
      return res.id
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("toast.failed"))
      return null
    } finally {
      setSaving(false)
    }
  }

  const saveSeo = async (articleId: string) => {
    try { await seoApi.upsertArticle(articleId, sf) } catch { toast.error("Failed to save SEO") }
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required")
      return
    }
    const pid = await saveArticle()
    if (!pid) return
    if (isEdit) await saveSeo(pid)
    navigate("/articles")
    toast.success(isEdit ? t("toast.updated") : t("toast.created"))
  }

  const handleSaveAndNext = async () => {
    if (tab === 0) {
      if (!form.title.trim()) {
        toast.error("Title is required")
        return
      }
      const pid = isEdit ? id : await saveArticle()
      if (!pid) return
      if (!isEdit) navigate(`/articles/${pid}/edit`, { replace: true })
    }
    if (tab === 2 && id) await saveSeo(id)
    setTab((t) => Math.min(t + 1, tabs.length - 1))
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => handleNav("/articles")}>
          <ChevronLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? t("article.edit") : t("article.new")}</h1>
          <p className="text-sm text-muted-foreground">{isEdit ? t("common.update") : t("common.create")}</p>
        </div>
      </div>

      <div className="mb-6 flex gap-1 rounded-lg bg-muted p-1 text-sm">
        {tabs.map((label, i) => (
          <button
            key={label}
            onClick={() => setTab(i)}
            className={`flex-1 rounded-md px-3 py-2 text-center text-xs font-medium transition-colors ${
              i === tab ? "bg-background text-foreground shadow-sm" : i < tab ? "text-primary cursor-pointer" : "text-muted-foreground cursor-default"
            }`}
          >
            {t(label)}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="space-y-5">
          <div className="flex gap-1 border-b pb-3">
            {["id", "en"].map((l) => (
              <button key={l} onClick={() => setContentLang(l)}
                className={`rounded-md px-3 py-1 text-xs font-medium ${contentLang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {l === "id" ? "Indonesia" : "English"}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("common.name")} *</label>
            <Input value={contentLang === "id" ? form.title : getTrans("title")} onChange={(e) => {
              markDirty()
              if (contentLang === "id") {
                const t = e.target.value
                setForm((prev) => ({ ...prev, title: t, slug: slugEdited.current ? prev.slug : slugify(t) }))
              } else setTrans("title", e.target.value)
            }} placeholder={`Article title (${contentLang})`} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Slug</label>
            <Input value={form.slug ?? ""} onChange={(e) => {
              markDirty(); slugEdited.current = true; setForm({ ...form, slug: e.target.value })
            }} placeholder="auto-generated-from-title" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("article.category")}</label>
              <SearchableSelect
                value={form.category_id ?? ""}
                onChange={(val) => { markDirty(); setForm({ ...form, category_id: val || null }) }}
                placeholder={t("common.select") + " " + t("article.category")}
                options={(categories ?? []).map((c) => ({ value: c.id, label: c.name }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("article.author")}</label>
              <Input value={form.author ?? ""} onChange={(e) => { markDirty(); setForm({ ...form, author: e.target.value }) }}
                placeholder="Author name" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("article.tags")}</label>
            <Input
              value={(form.tags ?? []).join(", ")}
              onChange={(e) => {
                markDirty()
                const tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                setForm({ ...form, tags })
              }}
              placeholder="tag1, tag2, tag3"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("article.excerpt")}</label>
            <Textarea
              value={contentLang === "id" ? form.excerpt ?? "" : getTrans("excerpt")}
              onChange={(e) => {
                markDirty()
                if (contentLang === "id") setForm({ ...form, excerpt: e.target.value })
                else setTrans("excerpt", e.target.value)
              }}
              placeholder="Brief article excerpt"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("article.image")}</label>
            <div className="flex items-start gap-3">
              {form.image_url ? (
                <div className="group relative size-28 overflow-hidden rounded-lg border">
                  <img src={form.image_url} alt="Featured" className="size-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                  <button onClick={() => setForm({ ...form, image_url: "" })} className="absolute right-0.5 top-0.5 hidden rounded-full bg-background/80 p-0.5 text-destructive group-hover:block"><X className="size-3.5" /></button>
                </div>
              ) : (
                <div onClick={() => setMediaOpen(true)} className="flex size-40 cursor-pointer items-center justify-center rounded-lg border border-dashed text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  <div className="flex flex-col items-center gap-1">
                    <ImageIcon className="size-8" />
                    <span className="text-xs">Click to select</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active ?? false} onChange={(e) => { markDirty(); setForm({ ...form, is_active: e.target.checked }) }} className="size-4" />
              {t("common.active")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_featured ?? false} onChange={(e) => { markDirty(); setForm({ ...form, is_featured: e.target.checked }) }} className="size-4" />
              {t("common.featured")}
            </label>
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="space-y-5">
          <div className="flex gap-1 border-b pb-3">
            {["id", "en"].map((l) => (
              <button key={l} onClick={() => setContentLang(l)}
                className={`rounded-md px-3 py-1 text-xs font-medium ${contentLang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {l === "id" ? "Indonesia" : "English"}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("article.content")} ({contentLang})</label>
            <RichEditor
              value={getTrans("content")}
              onChange={(v) => {
                markDirty()
                setTrans("content", v)
              }}
              minHeight={500}
            />
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("common.meta_title")}</label>
            <Input value={sf.meta_title} onChange={(e) => setSf({ ...sf, meta_title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("common.meta_description")}</label>
            <Textarea value={sf.meta_description} onChange={(e) => setSf({ ...sf, meta_description: e.target.value })} rows={3} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("common.meta_keywords")}</label>
            <Input value={sf.meta_keywords} onChange={(e) => setSf({ ...sf, meta_keywords: e.target.value })} placeholder="keyword1, keyword2" />
          </div>
          <details className="group rounded-lg border p-3">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">{t("common.advanced") || "Advanced (OG Tags)"}</summary>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">OG Title</label>
                <Input value={sf.og_title} onChange={(e) => setSf({ ...sf, og_title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">OG Description</label>
                <Textarea value={sf.og_description} onChange={(e) => setSf({ ...sf, og_description: e.target.value })} rows={2} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">OG Image URL</label>
                <Input value={sf.og_image} onChange={(e) => setSf({ ...sf, og_image: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Canonical URL</label>
                <Input value={sf.canonical_url} onChange={(e) => setSf({ ...sf, canonical_url: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Robots</label>
                <Input value={sf.robots} onChange={(e) => setSf({ ...sf, robots: e.target.value })} placeholder="index, follow" />
              </div>
            </div>
          </details>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <Button variant="outline" disabled={tab === 0} onClick={() => setTab((t) => t - 1)}>
          <ChevronLeft className="mr-1 size-4" /> {t("common.previous")}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="mr-1 size-4" /> {t("common.save")}
          </Button>
          {tab < tabs.length - 1 ? (
            <Button onClick={handleSaveAndNext} disabled={saving}>
              {t("common.save_next")} <ChevronRight className="ml-1 size-4" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-1 size-4" /> {isEdit ? t("common.update") : t("common.create")} {t("article.title")}
            </Button>
          )}
        </div>
      </div>

      <MediaPicker
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        onSelect={handleMediaSelect}
      />

      {confirmLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setConfirmLeave(null)}>
          <div className="w-full max-w-sm rounded-xl bg-popover p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold">{t("common.unsaved_title")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("common.unsaved_desc")}</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmLeave(null)}>{t("common.stay")}</Button>
              <Button variant="destructive" onClick={() => { setDirty(false); navigate(confirmLeave) }}>{t("common.leave")}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
