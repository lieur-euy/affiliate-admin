import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { productApi, type ProductBulkReq } from "@/api/products"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ChevronLeft, Upload } from "lucide-react"

const EXAMPLE = `[
  {
    "id": {
      "name": "Lenovo Legion 5 Pro 16",
      "description": "<p>Deskripsi produk bahasa Indonesia</p>",
      "content": "<p>Konten lengkap produk</p>",
      "category_id": "uuid-kategori",
      "brand_id": "uuid-brand",
      "image_url": "",
      "gallery": [],
      "specs": {
        "brand": "Intel",
        "model": "Core i7-14700K",
        "cores": 20,
        "threads": 28,
        "base_clock": 3.4,
        "boost_clock": 5.6,
        "tdp": 125,
        "socket": "LGA1700"
      },
      "affiliate_links": [
        {
          "marketplace_id": "uuid-marketplace",
          "url": "https://tokopedia.com/product/xxx",
          "current_price": 15000000,
          "currency": "IDR"
        }
      ]
    },
    "en": {
      "name": "Lenovo Legion 5 Pro 16",
      "description": "<p>Product description in English</p>",
      "content": "<p>Full product content</p>"
    }
  }
]`

interface ImportResult { index: number; name: string; status: "success" | "error"; id?: string; error?: string }

export function ProductJsonPage() {
  const navigate = useNavigate()
  const [raw, setRaw] = useState("")
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<ImportResult[]>([])

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  const sanitize = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(sanitize)
    if (obj && typeof obj === "object") {
      const cleaned: any = {}
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "string" && (k.endsWith("_id") || k === "marketplace_id") && !UUID_RE.test(v)) {
          cleaned[k] = null
        } else {
          cleaned[k] = sanitize(v)
        }
      }
      return cleaned
    }
    return obj
  }

  const handleImport = async () => {
    let items: ProductBulkReq[]
    try {
      items = JSON.parse(raw)
      if (!Array.isArray(items)) { toast.error("JSON must be an array"); return }
      items = sanitize(items)
    } catch {
      toast.error("Invalid JSON format"); return
    }

    setImporting(true)
    setResults([])
    const out: ImportResult[] = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const name = item.id?.name || `Item #${i + 1}`
      try {
        const resp = await productApi.createBulk(item)
        out.push({ index: i, name, status: "success", id: resp.id.id })
      } catch (err) {
        out.push({ index: i, name, status: "error", error: err instanceof Error ? err.message : "Failed" })
      }
      setResults([...out])
    }

    setImporting(false)
    toast.success(`Imported ${out.filter((r) => r.status === "success").length}/${items.length} products`)
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate("/products")}>
            <ChevronLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Import Products (JSON)</h1>
            <p className="text-sm text-muted-foreground">Bulk create products from a JSON array</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Button onClick={handleImport} disabled={importing || !raw.trim()}>
          <Upload className="mr-1 size-4" /> {importing ? "Importing..." : "Import"}
        </Button>
        <Button variant="outline" onClick={() => setRaw(EXAMPLE)}>Load Example</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">JSON Input</label>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            className="h-[60vh] w-full rounded-md border bg-[#1e1e2e] p-4 font-mono text-xs text-[#cdd6f4] shadow-xs focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder={EXAMPLE}
            spellCheck={false}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Results ({results.length}/{importing ? "..." : (raw ? (() => { try { const p = JSON.parse(raw); return Array.isArray(p) ? p.length : "?" } catch { return "?" } })() : "0")})</label>
          <div className="h-[60vh] overflow-y-auto rounded-md border p-2 text-xs font-mono">
            {results.length === 0 ? (
              <p className="text-muted-foreground">Import results will appear here...</p>
            ) : (
              results.map((r) => (
                <div key={r.index} className={`mb-1 rounded px-2 py-1 ${r.status === "success" ? "bg-green-900/20 text-green-400" : "bg-red-900/20 text-red-400"}`}>
                  <span className="font-medium">#{r.index + 1}</span> {r.name}
                  {r.status === "success" ? ` ✓ ${r.id?.slice(0, 8)}...` : ` ✗ ${r.error}`}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
