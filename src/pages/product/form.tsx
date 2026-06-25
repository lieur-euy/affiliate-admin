import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { productApi, type ProductReq, type ProductBulkReq, type ProductBulkLocale, type LocalizationRef } from "@/api/products"
import { seoApi, type SEOReq } from "@/api/seo"
import { specApi, type ProductSpecs } from "@/api/specs"
import { affiliateLinkApi, type AffiliateLink, type AffiliateLinkReq } from "@/api/affiliate-links"
import { categoryApi, type Category } from "@/api/categories"
import { brandApi, type Brand } from "@/api/brands"
import { marketplaceApi, type Marketplace } from "@/api/marketplaces"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RichEditor } from "@/components/rich-editor"
import { SpecsForm, type SpecType } from "@/components/specs-form"
import { MediaPicker } from "@/components/media-picker"
import { toast } from "sonner"
import { SearchableSelect } from "@/components/searchable-select"
import { ChevronLeft, ChevronRight, Plus, Trash2, Save, Image as ImageIcon, X, Languages, Globe } from "lucide-react"

const emptyProduct: ProductReq = {
  name: "", description: "", content: "", image_url: "",
  category_id: null, brand_id: null, locale: "id", is_active: true, is_featured: false,
}

const emptySeo: SEOReq = {
  meta_title: "", meta_description: "", meta_keywords: "",
  og_title: "", og_description: "", og_image: "",
  canonical_url: "", robots: "",
}

const tabs = ["product.title", "common.details", "product.specs", "product.seo", "product.affiliates"]

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

const SPEC_LABELS: Record<SpecType, string> = { cpu: "CPU", vga: "VGA", ram: "RAM", ssd: "SSD", hdd: "HDD", psu: "PSU", motherboard: "Motherboard", cooler: "CPU Cooler", casing: "Casing", monitor: "Monitor" }
const LOCALE_LABELS: Record<string, string> = { id: "Indonesia", en: "English" }
const LOCALES = ["id", "en"]

function CreateAffiliateLinks({ links, onChange, marketplaces, locale }: {
  links: { marketplace_id: string; url: string; current_price?: number | null; currency: string }[]
  onChange: (links: any[]) => void
  marketplaces: Marketplace[]
  locale: string
}) {
  const [newLink, setNewLink] = useState<{ marketplace_id: string; url: string; current_price?: number | null; currency: string }>({
    marketplace_id: "", url: "", currency: "IDR",
  })

  return (
    <div className="space-y-3">
      {links.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Links ({LOCALE_LABELS[locale]})</p>
          {links.map((link, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{marketplaces.find((m) => m.id === link.marketplace_id)?.name || link.marketplace_id}</span>
                  {link.current_price != null && <span className="text-muted-foreground">{link.currency} {link.current_price.toLocaleString()}</span>}
                </div>
                <div className="truncate text-xs text-muted-foreground">{link.url}</div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => onChange(links.filter((_, j) => j !== i))}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-lg border p-4">
        <p className="mb-3 text-sm font-medium">Add Link ({LOCALE_LABELS[locale]})</p>
        <div className="space-y-3">
          <select value={newLink.marketplace_id} onChange={(e) => setNewLink({ ...newLink, marketplace_id: e.target.value })}
            className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs">
            <option value="">Select marketplace</option>
            {(marketplaces ?? []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <Input value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} placeholder="https://affiliate-link.com/product" />
          <div className="flex gap-2">
            <Input value={newLink.currency} onChange={(e) => setNewLink({ ...newLink, currency: e.target.value })} placeholder="IDR" className="w-20" />
            <Input type="number" value={newLink.current_price ?? ""} onChange={(e) => setNewLink({ ...newLink, current_price: e.target.value ? Number(e.target.value) : null })} placeholder="Current price" className="flex-1" />
            <Button size="sm" onClick={() => {
              if (!newLink.marketplace_id || !newLink.url) { toast.error("Select marketplace and enter URL"); return }
              onChange([...links, { ...newLink }])
              setNewLink({ marketplace_id: "", url: "", currency: "IDR" })
            }}><Plus className="mr-1 size-4" />Add</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [tab, setTab] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([])
  const [pf, setPf] = useState<ProductReq>(emptyProduct)
  const [sf, setSf] = useState<SEOReq>(emptySeo)
  const [specs, setSpecs] = useState<ProductSpecs>({})
  const [specType, setSpecType] = useState<SpecType>("cpu")
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([])
  const [linksLoaded, setLinksLoaded] = useState(false)
  const [newLink, setNewLink] = useState<AffiliateLinkReq>({ product_id: "", marketplace_id: "", url: "", currency: "IDR" })
  const [saving, setSaving] = useState(false)
  const [savingSeo, setSavingSeo] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"featured" | "gallery">("featured")
  const [confirmLeave, setConfirmLeave] = useState<string | null>(null)
  const [localizations, setLocalizations] = useState<LocalizationRef[]>([])
  const [enSf, setEnSf] = useState<SEOReq>(emptySeo)
  const [enProductId, setEnProductId] = useState<string | null>(null)
  const slugEdited = useRef(false)

  // CREATE mode: dual-locale state with per-locale SEO + gallery
  const [createLocales, setCreateLocales] = useState<Record<string, ProductReq & { gallery?: string[] }>>({
    id: { ...emptyProduct, locale: "id", gallery: [] },
    en: { ...emptyProduct, locale: "en", gallery: [] },
  })
  const [createSeo, setCreateSeo] = useState<Record<string, SEOReq>>({
    id: { ...emptySeo },
    en: { ...emptySeo },
  })
  const [activeCreateLang, setActiveCreateLang] = useState("id")

  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = "" }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [dirty])

  const markDirty = () => { if (!dirty) setDirty(true) }

  useEffect(() => {
    Promise.all([
      categoryApi.list({ limit: 100 }).then(r => setCategories(Array.isArray(r?.data) ? r.data : [])),
      brandApi.list({ limit: 100 }).then(r => setBrands(Array.isArray(r?.data) ? r.data : [])),
      marketplaceApi.list({ limit: 100 }).then(r => setMarketplaces(Array.isArray(r?.data) ? r.data : [])),
    ]).catch(() => {})
  }, [])

  useEffect(() => {
    if (!id) return
    productApi.getById(id).then((p) => {
      setPf({ ...p, description: p.description, content: p.content } as any)
      setNewLink((prev) => ({ ...prev, product_id: p.id }))
      if (p.localization_group_id) {
        productApi.getLocalizations(id).then((locs) => {
          const list = locs ?? []
          setLocalizations(list)
          const en = list.find((l) => l.locale === "en")
          if (en) { setEnProductId(en.id) }
        }).catch(() => {})
      }
      productApi.getGallery(id).then((g) => setPf((prev) => ({ ...prev, gallery: g }))).catch(() => {})
    }).catch(() => navigate("/products", { replace: true }))

    seoApi.getByProductId(id).then((s) => {
      if (!s) { setSf({ ...emptySeo }); return }
      setSf({ ...emptySeo,
        meta_title: s.meta_title || "", meta_description: s.meta_description || "",
        meta_keywords: s.meta_keywords || "", og_title: s.og_title || "",
        og_description: s.og_description || "", og_image: s.og_image || "",
        canonical_url: s.canonical_url || "", robots: s.robots || "",
      })
    }).catch(() => setSf({ ...emptySeo }))

    affiliateLinkApi.listByProduct(id).then((links) => { setAffiliateLinks(links ?? []); setLinksLoaded(true) }).catch(() => {})
    specApi.getByProductId(id).then((s) => { if (s) setSpecs(s) }).catch(() => {})
  }, [id, navigate])

  // Load EN SEO when enProductId is known
  useEffect(() => {
    if (!enProductId) return
    seoApi.getByProductId(enProductId).then((s) => {
      if (!s) { setEnSf({ ...emptySeo }); return }
      setEnSf({ ...emptySeo,
        meta_title: s.meta_title || "", meta_description: s.meta_description || "",
        meta_keywords: s.meta_keywords || "", og_title: s.og_title || "",
        og_description: s.og_description || "", og_image: s.og_image || "",
        canonical_url: s.canonical_url || "", robots: s.robots || "",
      })
    }).catch(() => setEnSf({ ...emptySeo }))
  }, [enProductId])

  useEffect(() => {
    const catId = isEdit ? pf.category_id : createLocales[activeCreateLang]?.category_id ?? null
    if (!catId) { setSpecType("cpu"); return }
    const cat = categories.find((c) => c.id === catId)
    if (cat?.spec_type && SPEC_LABELS[cat.spec_type as SpecType]) {
      setSpecType(cat.spec_type as SpecType)
    }
  }, [pf.category_id, createLocales, activeCreateLang, categories, isEdit])

  const handleMediaSelect = (media: { url: string }) => {
    if (mediaPickerTarget === "gallery") {
      handleGallerySelect([media])
      return
    }
    if (isEdit) setPf((prev) => ({ ...prev, image_url: media.url }))
    else setCreateLocales((prev) => ({
      ...prev, [activeCreateLang]: { ...prev[activeCreateLang], image_url: media.url },
    }))
  }

  const handleGallerySelect = (mediaList: { url: string }[]) => {
    if (isEdit) {
      const g = (pf as any).gallery ?? []
      setPf((prev) => ({ ...prev, gallery: [...g, ...mediaList.map((m) => m.url)] }))
    } else {
      const g = (createLocales[activeCreateLang] as any).gallery ?? []
      setCreateLocales((prev) => ({
        ...prev, [activeCreateLang]: { ...prev[activeCreateLang], gallery: [...g, ...mediaList.map((m) => m.url)] },
      }))
    }
  }

  const removeGalleryImage = (index: number) => {
    if (isEdit) {
      const g = (pf as any).gallery ?? []
      setPf((prev) => ({ ...prev, gallery: g.filter((_: any, i: number) => i !== index) }))
    } else {
      const g = (createLocales[activeCreateLang] as any).gallery ?? []
      setCreateLocales((prev) => ({
        ...prev, [activeCreateLang]: { ...prev[activeCreateLang], gallery: g.filter((_: any, i: number) => i !== index) },
      }))
    }
  }

  const updateCreateField = useCallback((field: string, value: any) => {
    markDirty()
    setCreateLocales((prev) => ({
      ...prev, [activeCreateLang]: { ...prev[activeCreateLang], [field]: value },
    }))
  }, [activeCreateLang])

  const updateCreateSeo = useCallback((field: string, value: string) => {
    markDirty()
    setCreateSeo((prev) => ({
      ...prev, [activeCreateLang]: { ...prev[activeCreateLang], [field]: value },
    }))
  }, [activeCreateLang])

  const activeLocale: string = isEdit ? (pf.locale ?? "id") : activeCreateLang
  const allLocales: string[] = isEdit
    ? [...new Set([pf.locale, ...localizations.map((l) => l.locale)].filter(Boolean))] as string[]
    : LOCALES

  const switchTargetId = (loc: string) => {
    if (isEdit) return loc === pf.locale ? id : localizations.find((l) => l.locale === loc)?.id
    return null
  }

  const handleSwitchLocale = (targetId?: string) => {
    if (!targetId) { setActiveCreateLang(activeCreateLang === "id" ? "en" : "id"); return }
    if (!dirty) { navigate(`/products/${targetId}/edit`); return }
    setConfirmLeave(`/products/${targetId}/edit`)
  }

  const saveSeo = async () => {
    if (!isEdit || !id) return
    const hasSeo = sf.meta_title || sf.meta_description || sf.meta_keywords ||
                   sf.og_title || sf.og_description || sf.og_image ||
                   sf.canonical_url || sf.robots
    if (!hasSeo && !(enProductId && (enSf.meta_title || enSf.meta_description || enSf.meta_keywords))) return
    setSavingSeo(true)
    try {
      if (hasSeo) await seoApi.upsert(id, sf)
      if (enProductId && (enSf.meta_title || enSf.meta_description || enSf.meta_keywords ||
          enSf.og_title || enSf.og_description || enSf.og_image ||
          enSf.canonical_url || enSf.robots)) {
        await seoApi.upsert(enProductId, enSf)
      }
    } catch { /* non-critical */ }
    finally { setSavingSeo(false) }
  }

  const saveProduct = async (): Promise<string | null> => {
    setSaving(true)
    try {
      if (isEdit) {
        await saveSeo()

        const idData: ProductBulkLocale = {
          name: pf.name, slug: pf.slug ?? "",
          description: pf.description ?? "", content: pf.content ?? "",
          category_id: pf.category_id, brand_id: pf.brand_id,
          image_url: pf.image_url, is_active: pf.is_active, is_featured: pf.is_featured,
          gallery: (pf as any).gallery ?? [],
          specs: (specs[specType] ?? {}) as Record<string, unknown>,
        }
        if (linksLoaded && affiliateLinks.length > 0) {
          idData.affiliate_links = affiliateLinks.map((l) => ({
            marketplace_id: l.marketplace_id,
            url: l.url,
            current_price: l.current_price,
            currency: l.currency || "IDR",
          }))
        }
        const enData: ProductBulkLocale = {
          name: "", description: "", content: "",
          specs: (specs[specType] ?? {}) as Record<string, unknown>,
        }
        const bulk: ProductBulkReq = { id: idData, en: enData }
        const resp = await productApi.updateBulk(id!, bulk)
        return resp.id.id
      }
      if (!createLocales.id.name && !createLocales.en.name) {
        toast.error("Product name is required")
        return null
      }
      if (!createLocales.id.name && createLocales.en.name) {
        setCreateLocales((prev) => ({ ...prev, id: { ...prev.id, name: prev.en.name } }))
      }
      const toLocale = (loc: string): ProductBulkLocale => ({
        name: createLocales[loc].name,
        slug: createLocales[loc].slug ?? "",
        description: createLocales[loc].description ?? "",
        content: createLocales[loc].content ?? "",
        category_id: createLocales[loc].category_id,
        brand_id: createLocales[loc].brand_id,
        image_url: createLocales[loc].image_url,
        is_active: createLocales[loc].is_active,
        is_featured: createLocales[loc].is_featured,
        gallery: (createLocales[loc] as any).gallery ?? [],
        affiliate_links: (createLocales[loc] as any)._links ?? [],
        specs: (specs[specType] ?? {}) as Record<string, unknown>,
        seo: createSeo[loc],
      })
      const bulk: ProductBulkReq = { id: toLocale("id"), en: toLocale("en") }
      const resp = await productApi.createBulk(bulk)
      return resp.id.id
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
      return null
    } finally {
      setSaving(false)
    }
  }

  const addLink = () => {
    if (!newLink.marketplace_id || !newLink.url) { toast.error("Select marketplace and enter URL"); return }
    markDirty()
    setAffiliateLinks((prev) => [...prev, { id: "temp_" + Date.now(), product_id: id ?? "", marketplace_id: newLink.marketplace_id, url: newLink.url, current_price: newLink.current_price, currency: newLink.currency, is_active: true, created_at: "", updated_at: "" } as AffiliateLink])
    setNewLink({ product_id: id ?? "", marketplace_id: "", url: "", currency: "IDR" })
  }

  const deleteLink = async (linkId: string) => {
    markDirty()
    setAffiliateLinks((prev) => prev.filter((l) => l.id !== linkId))
    if (!linkId.startsWith("temp_")) {
      try { await affiliateLinkApi.delete(linkId) } catch { toast.error("Failed to delete link") }
    }
  }

  const finalSave = async () => {
    const pid = await saveProduct()
    return pid
  }

  const handleSave = async () => {
    const pid = await finalSave()
    if (!pid) return
    navigate("/products")
    toast.success(isEdit ? "Product updated" : "Product created")
  }

  const handleSaveAndNext = async () => {
    if (!isEdit) {
      if (tab === 0) {
        if (!createLocales.id.name && !createLocales.en.name) {
          toast.error("Product name is required"); return
        }
      }
      setTab((t) => Math.min(t + 1, tabs.length - 1))
      return
    }
    if (tab === 3) await saveSeo()
    setTab((t) => Math.min(t + 1, tabs.length - 1))
  }

  const handleDelete = async () => {
    if (!id) return
    try {
      await productApi.delete(id)
      toast.success("Product deleted")
      navigate("/products")
    } catch { toast.error("Failed to delete product") }
  }

  const currentPf = isEdit ? pf : createLocales[activeCreateLang] ?? emptyProduct
  const currentSeo = isEdit ? sf : createSeo[activeCreateLang] ?? emptySeo
  const currentGallery = (isEdit ? (pf as any).gallery : (createLocales[activeCreateLang] as any).gallery) ?? []

  // ============ RENDER ============

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate("/products")}>
            <ChevronLeft className="size-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{isEdit ? t("product.edit") : t("product.new")}</h1>
              {isEdit && <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary uppercase">{pf.locale}</span>}
            </div>
            <p className="text-sm text-muted-foreground">{isEdit ? t("common.update") : t("common.create")}</p>
          </div>
        </div>

        {/* Locale switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border p-0.5">
            {allLocales.map((loc) => {
              const targetId = switchTargetId(loc)
              const isActive = isEdit ? loc === pf.locale : loc === activeCreateLang
              return (
                <button
                  key={loc}
                  onClick={() => isEdit ? handleSwitchLocale(targetId!) : setActiveCreateLang(loc)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {LOCALE_LABELS[loc] ?? loc}
                </button>
              )
            })}
          </div>
          {(() => {
            const existing = [pf.locale ?? "", ...localizations.map((l) => l.locale)]
            const missing = LOCALES.find((l) => !existing.includes(l))
            if (!isEdit || !missing) return null
            const label = LOCALE_LABELS[missing] ?? missing
            return (
              <Button variant="outline" size="sm" onClick={async () => {
                try {
                  const newProduct = await productApi.createLocalization(id!, missing)
                  setDirty(false)
                  navigate(`/products/${newProduct.id}/edit`, { replace: true })
                } catch { toast.error(`Failed to add ${label} variant`) }
              }}>
                <Languages className="mr-1 size-3.5" /> Add {label}
              </Button>
            )
          })()}
          {isEdit && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm"><Trash2 className="mr-1 size-3.5 text-destructive" /> Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete product?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete &ldquo;{pf.name}&rdquo;.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Tab bar — all tabs clickable */}
      <div className="mb-6 flex gap-1 rounded-lg bg-muted p-1 text-sm">
        {tabs.map((label, i) => (
          <button key={label} onClick={async () => {
            if (isEdit && tab === 3 && i !== 3) await saveSeo()
            setTab(i)
          }}
            className={`flex-1 rounded-md px-3 py-2 text-center text-xs font-medium transition-colors cursor-pointer ${
              i === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}>
            {t(label)}
          </button>
        ))}
      </div>

      {/* Tab 0: Basic info */}
      {tab === 0 && (
        <div className="space-y-5" key={`tab0-${activeLocale}`}>
          {!isEdit && (
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="size-3.5" />
              <span>Editing: <strong>{LOCALE_LABELS[activeLocale]}</strong> — each locale has its own name & gallery</span>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("common.name")} *</label>
            <Input value={currentPf.name} onChange={(e) => {
              const name = e.target.value
              if (isEdit) { markDirty(); setPf((prev) => ({ ...prev, name, slug: slugEdited.current ? prev.slug ?? "" : slugify(name) })) }
              else { markDirty(); setCreateLocales((prev) => ({ ...prev, [activeCreateLang]: { ...prev[activeCreateLang], name, slug: slugEdited.current ? prev[activeCreateLang]?.slug ?? "" : slugify(name) } })) }
            }} placeholder={`Product name (${LOCALE_LABELS[activeLocale]})`} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Slug</label>
            <Input value={currentPf.slug ?? ""} onChange={(e) => {
              slugEdited.current = true
              if (isEdit) { markDirty(); setPf({ ...pf, slug: e.target.value }) }
              else updateCreateField("slug", e.target.value)
            }} placeholder="auto-generated-from-name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("product.category")}</label>
              <SearchableSelect
                value={currentPf.category_id ?? ""}
                onChange={(val) => {
                  const v = val || null
                  if (isEdit) { markDirty(); setPf({ ...pf, category_id: v }) }
                  else updateCreateField("category_id", v)
                }}
                placeholder="Select category"
                options={(categories ?? []).map((c) => ({ value: c.id, label: c.name }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("product.brand")}</label>
              <SearchableSelect
                value={currentPf.brand_id ?? ""}
                onChange={(val) => {
                  const v = val || null
                  if (isEdit) { markDirty(); setPf({ ...pf, brand_id: v }) }
                  else updateCreateField("brand_id", v)
                }}
                placeholder="Select brand"
                options={(brands ?? []).map((b) => ({ value: b.id, label: b.name }))}
              />
            </div>
          </div>

          {/* Featured image */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("product.image")}</label>
            <div className="flex items-start gap-3">
              {currentPf.image_url ? (
                <div className="group relative size-28 overflow-hidden rounded-lg border">
                  <img src={currentPf.image_url} alt="Featured" className="size-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                  <button onClick={() => {
                    if (isEdit) setPf({ ...pf, image_url: "" })
                    else updateCreateField("image_url", "")
                  }} className="absolute right-0.5 top-0.5 hidden rounded-full bg-background/80 p-0.5 text-destructive group-hover:block"><X className="size-3.5" /></button>
                </div>
              ) : (
                <div onClick={() => { setMediaPickerTarget("featured"); setMediaPickerOpen(true) }} className="flex size-40 cursor-pointer items-center justify-center rounded-lg border border-dashed text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  <div className="flex flex-col items-center gap-1">
                    <ImageIcon className="size-8" />
                    <span className="text-xs">Click to select</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gallery */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("product.gallery")}</label>
            <div className="flex flex-wrap gap-2">
              {currentGallery.map((url: string, idx: number) => (
                <div key={idx} className="group relative size-20 overflow-hidden rounded-lg border">
                  <img src={url} alt="" className="size-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                  <button onClick={() => removeGalleryImage(idx)} className="absolute right-0.5 top-0.5 hidden rounded-full bg-background/80 p-0.5 text-destructive group-hover:block"><X className="size-3" /></button>
                </div>
              ))}
              <div onClick={() => { setMediaPickerTarget("gallery"); setMediaPickerOpen(true) }} className="flex size-20 cursor-pointer items-center justify-center rounded-lg border border-dashed text-muted-foreground hover:border-primary hover:text-primary">
                <Plus className="size-6" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={currentPf.is_active ?? false} onChange={(e) => {
                markDirty()
                if (isEdit) setPf({ ...pf, is_active: e.target.checked })
                else updateCreateField("is_active", e.target.checked)
              }} className="size-4" />
              {t("common.active")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={currentPf.is_featured ?? false} onChange={(e) => {
                markDirty()
                if (isEdit) setPf({ ...pf, is_featured: e.target.checked })
                else updateCreateField("is_featured", e.target.checked)
              }} className="size-4" />
              {t("common.featured")}
            </label>
          </div>
        </div>
      )}

      {/* Tab 1: Description & Content */}
      {tab === 1 && (
        <div className="space-y-5" key={`tab1-${activeLocale}`}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description ({LOCALE_LABELS[activeLocale]})</label>
            <RichEditor value={currentPf.description ?? ""} onChange={(v) => {
              if (isEdit) { markDirty(); setPf({ ...pf, description: v }) }
              else updateCreateField("description", v)
            }} minHeight={150} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Content ({LOCALE_LABELS[activeLocale]})</label>
            <RichEditor value={currentPf.content ?? ""} onChange={(v) => {
              if (isEdit) { markDirty(); setPf({ ...pf, content: v }) }
              else updateCreateField("content", v)
            }} minHeight={300} />
          </div>
        </div>
      )}

      {/* Tab 2: Specs */}
      {tab === 2 && (
        <div className="space-y-5">
          {!currentPf.category_id ? (
            <p className="text-sm text-muted-foreground">Select a category first to set specs based on product type.</p>
          ) : !SPEC_LABELS[specType] ? (
            <p className="text-sm text-muted-foreground">Selected category has no spec type defined.</p>
          ) : (
            <>
              <p className="text-sm font-medium">{SPEC_LABELS[specType]} Specifications</p>
              <SpecsForm specType={specType} data={(specs[specType] ?? {}) as Record<string, unknown>}
                onChange={(data) => setSpecs({ ...specs, [specType]: data })} />
            </>
          )}
        </div>
      )}

      {/* Tab 3: SEO */}
      {tab === 3 && (
        <div className="space-y-5" key={`tab3-${activeLocale}`}>
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="size-3.5" />
            <span>SEO for <strong>{LOCALE_LABELS[activeLocale]}</strong></span>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("common.meta_title")}</label>
            <Input value={currentSeo.meta_title} onChange={(e) => {
              if (isEdit) { markDirty(); setSf({ ...sf, meta_title: e.target.value }) }
              else updateCreateSeo("meta_title", e.target.value)
            }} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("common.meta_description")}</label>
            <Textarea value={currentSeo.meta_description} onChange={(e) => {
              if (isEdit) { markDirty(); setSf({ ...sf, meta_description: e.target.value }) }
              else updateCreateSeo("meta_description", e.target.value)
            }} rows={3} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("common.meta_keywords")}</label>
            <Input value={currentSeo.meta_keywords} onChange={(e) => {
              if (isEdit) { markDirty(); setSf({ ...sf, meta_keywords: e.target.value }) }
              else updateCreateSeo("meta_keywords", e.target.value)
            }} placeholder="keyword1, keyword2" />
          </div>
          <details className="group rounded-lg border p-3">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">{t("common.advanced") || "Advanced (OG Tags)"}</summary>
            <div className="mt-4 space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">OG Title</label>
                <Input value={currentSeo.og_title} onChange={(e) => {
                  if (isEdit) { markDirty(); setSf({ ...sf, og_title: e.target.value }) }
                  else updateCreateSeo("og_title", e.target.value)
                }} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">OG Description</label>
                <Textarea value={currentSeo.og_description} onChange={(e) => {
                  if (isEdit) { markDirty(); setSf({ ...sf, og_description: e.target.value }) }
                  else updateCreateSeo("og_description", e.target.value)
                }} rows={2} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">OG Image URL</label>
                <Input value={currentSeo.og_image} onChange={(e) => {
                  if (isEdit) { markDirty(); setSf({ ...sf, og_image: e.target.value }) }
                  else updateCreateSeo("og_image", e.target.value)
                }} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Canonical URL</label>
                <Input value={currentSeo.canonical_url} onChange={(e) => {
                  if (isEdit) { markDirty(); setSf({ ...sf, canonical_url: e.target.value }) }
                  else updateCreateSeo("canonical_url", e.target.value)
                }} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Robots</label>
                <Input value={currentSeo.robots} onChange={(e) => {
                  if (isEdit) { markDirty(); setSf({ ...sf, robots: e.target.value }) }
                  else updateCreateSeo("robots", e.target.value)
                }} placeholder="index, follow" /></div>
            </div>
          </details>
        </div>
      )}

      {/* Tab 4: Affiliate links */}
      {tab === 4 && (
        <div className="space-y-5">
          {isEdit ? (
            <>
              {affiliateLinks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Saved Links ({LOCALE_LABELS[activeLocale]})</p>
                  {affiliateLinks.map((link) => (
                    <div key={link.id} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{marketplaces.find((m) => m.id === link.marketplace_id)?.name || link.marketplace_id}</span>
                          {link.current_price != null && <span className="text-muted-foreground">{link.currency} {link.current_price.toLocaleString()}</span>}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">{link.url}</div>
                      </div>
                      <Button variant="ghost" size="icon-sm" onClick={() => deleteLink(link.id)}><Trash2 className="size-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="rounded-lg border p-4">
                <p className="mb-3 text-sm font-medium">Add New Link</p>
                <div className="space-y-3">
                  <select value={newLink.marketplace_id} onChange={(e) => setNewLink({ ...newLink, marketplace_id: e.target.value })} className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs">
                    <option value="">Select marketplace</option>
                    {(marketplaces ?? []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <Input value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} placeholder="https://affiliate-link.com/product" />
                  <div className="flex gap-2">
                    <Input value={newLink.currency} onChange={(e) => setNewLink({ ...newLink, currency: e.target.value })} placeholder="IDR" className="w-20" />
                    <Input type="number" value={newLink.current_price ?? ""} onChange={(e) => setNewLink({ ...newLink, current_price: e.target.value ? Number(e.target.value) : null })} placeholder="Current price" className="flex-1" />
                    <Button size="sm" onClick={addLink}><Plus className="mr-1 size-4" />Add</Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <CreateAffiliateLinks
              links={(createLocales[activeCreateLang] as any)._links ?? []}
              onChange={(links) => updateCreateField("_links", links)}
              marketplaces={marketplaces}
              locale={activeCreateLang}
            />
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <Button variant="outline" disabled={tab === 0} onClick={() => setTab((t) => t - 1)}>
          <ChevronLeft className="mr-1 size-4" /> Previous
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving || savingSeo}>
            <Save className="mr-1 size-4" /> {isEdit ? "Update" : "Save"}
          </Button>
          {tab < tabs.length - 1 ? (
            <Button onClick={handleSaveAndNext} disabled={saving}>
              {isEdit ? "Next" : "Save & Next"} <ChevronRight className="ml-1 size-4" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving || savingSeo}>
              {savingSeo ? "Saving SEO..." : saving ? "Saving..." : (isEdit ? "Update Product" : "Create Product")}
            </Button>
          )}
        </div>
      </div>

      <MediaPicker open={mediaPickerOpen} onOpenChange={setMediaPickerOpen}
        onSelect={handleMediaSelect} onSelectMultiple={handleGallerySelect} multi={mediaPickerTarget === "gallery"} />

      {confirmLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setConfirmLeave(null)}>
          <div className="w-full max-w-sm rounded-xl bg-popover p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold">{isEdit ? "Save before switching?" : t("common.unsaved_title")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{isEdit ? "Your changes will be saved before switching locale." : t("common.unsaved_desc")}</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmLeave(null)}>Cancel</Button>
              <Button onClick={async () => {
                const pid = isEdit ? await saveProduct() : null
                if (isEdit && !pid) return
                setDirty(false)
                navigate(confirmLeave)
              }}>Save & {isEdit ? "Switch" : "Leave"}</Button>
              {isEdit && <Button variant="destructive" onClick={() => { setDirty(false); navigate(confirmLeave) }}>Discard</Button>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}