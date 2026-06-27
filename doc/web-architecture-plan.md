# Arsitektur Web Utama — Afiliate Project

> Target: Aman, SEO tinggi, kenceng global, scalable, backend gak terekspos.

---

## 1. MASALAH UTAMA & SOLUSI

### 1.1 Masalah SSG Build Time

SSG murni build 10.000+ halaman produk = **20-40 menit per build**. Nggak feasible.

**Solusi: Hybrid SSG + On-Demand Rendering (ISR pattern)**

| Tipe Halaman | Strategy | Build Time | Update |
|-------------|----------|-----------|--------|
| Homepage `/` | SSG | 1 detik | Rebuild via webhook |
| Category `/category/[slug]` | **On-demand + CDN cache** | 0 detik | Cache invalidate via webhook |
| Product `/product/[slug]` | **On-demand + CDN cache** | 0 detik | Cache invalidate via webhook |
| Blog `/blog/[slug]` | SSG | < 5 detik | Rebuild via webhook |
| Filter `/search` | SSG shell + client JS | 1 detik | N/A (data via Worker) |
| Sitemap `/sitemap.xml` | SSG | < 30 detik | Rebuild berkala |

### 1.2 Cara Kerja On-Demand Rendering (ISR)

```
User pertama akses /product/lenovo-legion-5-pro
        │
        ▼
Cloudflare CDN ──► Cache MISS
        │
        ▼
Astro SSR (Cloudflare Pages Functions)
        │
        ▼
Fetch backend Indo ──► Render HTML ──► Return ke user
        │                              │
        └──────────────────────────────┘
                  Hasil di-cache CDN SELAMANYA
        │
        ▼
User berikutnya akses /product/lenovo-legion-5-pro
        │
        ▼
Cloudflare CDN ──► Cache HIT ──► Return HTML instant (10ms)

HANYA cache miss yg kena backend. Itu cuma 1x per halaman per deploy.
```

**Invalidate cache saat produk di-update (admin publish/edit):**
```
Admin publish produk ──► Webhook ──► Backend Indo
                                      │
                                      POST /api/rebuild
                                      │
                                      ▼
                                Cloudflare API
                                Purge cache: /product/slug-tersebut
                                (instant, 1 halaman aja)
```

---

## 2. ARSITEKTUR LENGKAP

```
                         INTERNET
                            │
                   ┌────────▼────────┐
                   │   Cloudflare    │
                   │                 │
                   │ ┌─────────────┐ │
                   │ │ Pages       │ │  SSG pages: home, blog, sitemap
                   │ │ (static)    │ │  CDN global, instant
                   │ └─────────────┘ │
                   │ ┌─────────────┐ │
                   │ │ Functions   │ │  On-demand: product, category
                   │ │ (SSR/ISR)   │ │  First hit → render → cache forever
                   │ └─────────────┘ │
                   │ ┌─────────────┐ │
                   │ │ Worker      │ │  API proxy: filter, auth, wishlist
                   │ │ (edge)      │ │  Rate limit + JWT + cache 5m
                   │ └──────┬──────┘ │
                   └────────┼────────┘
                            │ (internal fetch only)
                   ┌────────▼────────┐
                   │  SERVER INDO    │
                   │  ┌───────────┐  │
                   │  │ Backend   │  │  Go API, port 3000
                   │  │ (private) │  │  NEVER public IP
                   │  └───────────┘  │
                   └─────────────────┘
```

---

## 3. LATENSI MATRIX

| Request | User Jakarta | User London | User New York |
|---------|------------|------------|--------------|
| Homepage (SSG) | 10ms | 10ms | 10ms |
| Product detail (cached) | 10ms | 10ms | 10ms |
| Product detail (first hit) | 50ms | 250ms | 300ms |
| Filter search (cached) | 10ms | 10ms | 10ms |
| Filter search (cache miss) | 50ms | 250ms | 300ms |
| Login/verify JWT | 10ms | 10ms | 10ms |

**Kesimpulan:** Setelah halaman pertama kali dikunjungi, **semua user global dapet 10ms**. Cache miss cuma terjadi sekali.

---

## 4. ASTRO CONFIGURATION

### 4.1 `astro.config.mjs`

```js
import { defineConfig } from "astro/config"
import cloudflare from "@astrojs/cloudflare"
import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  output: "hybrid",        // default SSG, explicit SSR via prerender=false
  adapter: cloudflare({
    mode: "directory",      // _worker.js + static dir for CF Pages
  }),
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
})
```

### 4.2 Routing — Mana SSG, Mana On-Demand

```astro
---
// src/pages/index.astro — SSG (default, pre-rendered at build)
// No export needed, Astro hybrid defaults to static
---
```

```astro
---
// src/pages/product/[slug].astro — ON-DEMAND (ISR)
export const prerender = false  // ← Ditandain, render pas request
import { fetchProductBySlug } from "@/lib/api"

const { slug } = Astro.params
const product = await fetchProductBySlug(slug)
---
<html>
  <h1>{product.name}</h1>
  <article>{product.content}</article>
</html>
```

```astro
---
// src/pages/category/[slug].astro — ON-DEMAND
export const prerender = false
import { fetchCategoryWithProducts } from "@/lib/api"
// ...
---
```

```astro
---
// src/pages/search.astro — SSG SHELL (filter jalan di browser)
import SearchFilter from "@/components/SearchFilter"
---
<Layout>
  <h1>Cari Hardware</h1>
  <SearchFilter client:load />
</Layout>
```

```astro
---
// src/pages/blog/[slug].astro — SSG (pre-built)
// getStaticPaths handles build-time fetching
export async function getStaticPaths() {
  const articles = await fetchAllArticles()
  return articles.map(a => ({ params: { slug: a.slug }, props: { article: a } }))
}
---
```

### 4.3 File Structure

```
web/
├── astro.config.mjs
├── package.json
├── wrangler.toml                # CF Pages + Worker config
├── src/
│   ├── pages/
│   │   ├── index.astro          # SSG: Homepage
│   │   ├── search.astro         # SSG shell: Filter page
│   │   ├── product/
│   │   │   └── [slug].astro     # ON-DEMAND: Product detail
│   │   ├── category/
│   │   │   └── [slug].astro     # ON-DEMAND: Category listing
│   │   ├── blog/
│   │   │   └── [slug].astro     # SSG: Blog article
│   │   ├── sitemap.xml.ts       # SSG: Sitemap
│   │   └── api/                 # API proxy endpoints
│   │       └── search.ts        # Fallback search endpoint
│   ├── lib/
│   │   ├── api.ts               # Backend fetch helper (server-side only)
│   │   ├── cache.ts             # CDN cache utility
│   │   └── constants.ts         # URLs, env vars
│   ├── components/
│   │   ├── SearchFilter.tsx     # React: client-side filter UI
│   │   ├── ProductCard.tsx      # React: product card
│   │   ├── SpecsTable.tsx       # React: specs display
│   │   └── PriceTable.tsx       # React: affiliate price comparison
│   └── layouts/
│       └── main.astro           # Base layout
├── functions/                   # CF Pages Functions (Astro adapter uses this)
│   └── [[path]].js             # Auto-generated by astro build
└── workers/                     # Separate CF Worker for API proxy
    └── api-proxy.js            # Filter, auth, rate limit
```

---

## 5. CLOUDFLARE WORKER — API PROXY

### 5.1 `workers/api-proxy.js`

```js
// Cloudflare Worker — Edge API proxy
// Deployed as separate Worker, bound to domain via route pattern

const BACKEND_HOST = "backend.internal.techspecsdb.com"
const BACKEND_TOKEN = "" // set via CF secrets: wrangler secret put BACKEND_TOKEN

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const ip = request.headers.get("CF-Connecting-IP")

    // === Rate Limiting ===
    const rateOk = await checkRateLimit(env, ip, url.pathname)
    if (!rateOk) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      })
    }

    // === Routing ===

    // Auth: Verify JWT at edge (no backend call)
    if (url.pathname === "/api/auth/verify") {
      return handleVerifyJWT(request, env)
    }

    // Auth: Login → proxy to backend
    if (url.pathname === "/api/auth/login") {
      return proxyToBackend(request, env, { cache: false })
    }

    // Search / Filter → proxy with cache
    if (url.pathname === "/api/search") {
      return proxyToBackend(request, env, { cache: true, ttl: 300 }) // 5 menit
    }

    // Fallback: proxy without cache
    return proxyToBackend(request, env, { cache: false })
  },
}

// ====== Helpers ======

async function checkRateLimit(env, ip, path) {
  const key = `ratelimit:${path}:${ip}`
  const count = parseInt((await env.RATE_STORE.get(key)) || "0")
  const limit = path === "/api/search" ? 60 : 20 // 60/menit search, 20/menit lainnya

  if (count >= limit) return false

  await env.RATE_STORE.put(key, String(count + 1), { expirationTtl: 60 })
  return true
}

async function handleVerifyJWT(request, env) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(401, "Missing token")
  }

  try {
    const token = authHeader.slice(7)
    // Verify JWT at edge using Web Crypto (no backend call!)
    const { payload } = await verifyJWT(token, env.JWT_SECRET)
    return jsonResponse({ user_id: payload.sub, role: payload.role })
  } catch {
    return errorResponse(401, "Invalid token")
  }
}

async function verifyJWT(token, secret) {
  const encoder = new TextEncoder()
  const [headerB64, payloadB64, signatureB64] = token.split(".")

  // Verify signature
  const data = encoder.encode(`${headerB64}.${payloadB64}`)
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
  )
  const sig = base64UrlDecode(signatureB64)
  const valid = await crypto.subtle.verify("HMAC", key, sig, data)
  if (!valid) throw new Error("Invalid signature")

  // Decode payload
  const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64)))

  // Check expiry
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired")
  }

  return { payload }
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/")
  while (str.length % 4) str += "="
  return Uint8Array.from(atob(str), c => c.charCodeAt(0))
}

async function proxyToBackend(request, env, opts = {}) {
  const url = new URL(request.url)

  // Cache check (only if enabled)
  if (opts.cache) {
    const cacheKey = new Request(url.toString(), request)
    const cached = await caches.default.match(cacheKey)
    if (cached) return cached
  }

  // Fetch from backend (internal network)
  const backendURL = new URL(url.pathname + url.search, `https://${BACKEND_HOST}`)
  const backendReq = new Request(backendURL, {
    method: request.method,
    headers: {
      "Authorization": `Bearer ${BACKEND_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: request.method !== "GET" && request.method !== "HEAD"
      ? await request.clone().arrayBuffer() : undefined,
  })

  const resp = await fetch(backendReq)
  const data = await resp.json()

  // Strip sensitive fields from response
  const safe = sanitizeResponse(data, url.pathname)

  const response = jsonResponse(safe)

  // Save to cache if enabled
  if (opts.cache && resp.ok) {
    const cacheKey = new Request(url.toString(), request)
    const cached = new Response(JSON.stringify(safe), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${opts.ttl || 300}`,
      },
    })
    ctx.waitUntil(caches.default.put(cacheKey, cached))
  }

  return response
}

function sanitizeResponse(data, path) {
  // Strip internal IDs, keep only public-safe fields
  if (Array.isArray(data.data)) {
    return {
      ...data,
      data: data.data.map(item => ({
        slug: item.slug,
        name: item.name,
        excerpt: item.excerpt || item.description?.slice(0, 200),
        image: item.image_url,
        brand: item.brand_name || item.brand,
        category: item.category_name,
        price: item.min_price || item.price,
        is_active: item.is_active,
        // specs: only keep display-relevant fields
        specs: item.specs ? pickDisplaySpecs(item.specs) : undefined,
      })),
    }
  }
  return data
}

function pickDisplaySpecs(specs) {
  // Only return specs relevant for search/filter display
  const displayKeys = [
    "cores", "threads", "base_clock", "boost_clock", "tdp", "socket",
    "vram_size", "vram_type",
    "speed", "capacity", "cas_latency",
    "wattage", "certification",
    "screen_size", "resolution", "refresh_rate",
  ]
  const out = {}
  for (const k of displayKeys) {
    if (specs[k] !== undefined && specs[k] !== null) {
      out[k] = specs[k]
    }
  }
  return out
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function errorResponse(status, message) {
  return jsonResponse({ error: message }, status)
}
```

### 5.2 Deploy Worker

```bash
# Set secrets
npx wrangler secret put BACKEND_TOKEN
npx wrangler secret put JWT_SECRET

# Deploy
npx wrangler deploy workers/api-proxy.js
```

### 5.3 `wrangler.toml`

```toml
name = "afiliate-web"
compatibility_date = "2025-06-01"

# Cloudflare Pages (Astro)
[pages]
build.command = "npm run build"
build.output_dir = "dist"

# Worker route binding (api subdomain → worker)
[[workers.routes]]
pattern = "api.techspecsdb.com/*"
script = "api-proxy"

# KV for rate limiting
[[kv_namespaces]]
binding = "RATE_STORE"
id = "xxx"
```

---

## 6. CACHE INVALIDATION FLOW

### 6.1 Saat Admin Publish/Edit Produk

```
Admin panel (React) ──► PUT /api/products/:id (publish)
                              │
                              ▼
                        Backend (Go) ──► Update DB
                              │
                              ├──► Trigger webhook: POST /api/rebuild
                              │         │
                              │         ▼
                              │    Cloudflare API
                              │    Purge cache:
                              │    - /product/{slug}
                              │    - /category/{slug}
                              │    - /api/search (all cache)
                              │    - /sitemap.xml
                              │
                              └──► Log: "Cache purged for {slug}"
```

**Code di backend Go:**
```go
// internal/handler/rebuild.go
func (h *Handler) RebuildCache(c fiber.Ctx) error {
    var req struct {
        ProductSlug string `json:"product_slug"`
        CategorySlug string `json:"category_slug"`
    }
    c.Bind().Body(&req)

    urls := []string{
        fmt.Sprintf("https://techspecsdb.com/product/%s", req.ProductSlug),
        fmt.Sprintf("https://techspecsdb.com/category/%s", req.CategorySlug),
        "https://api.techspecsdb.com/api/search",
    }

    for _, url := range urls {
        purgeCloudflareCache(url)
    }
    return c.JSON(fiber.Map{"purged": urls})
}

func purgeCloudflareCache(url string) {
    cfZoneID := os.Getenv("CF_ZONE_ID")
    cfToken := os.Getenv("CF_API_TOKEN")

    body := fmt.Sprintf(`{"files":["%s"]}`, url)
    req, _ := http.NewRequest("POST",
        fmt.Sprintf("https://api.cloudflare.com/client/v4/zones/%s/purge_cache", cfZoneID),
        strings.NewReader(body))
    req.Header.Set("Authorization", "Bearer "+cfToken)
    req.Header.Set("Content-Type", "application/json")
    http.DefaultClient.Do(req)
}
```

---

## 7. SECURITY LAYER

| Lapisan | Mekanisme |
|---------|-----------|
| **Cloudflare CDN** | DDoS protection, bot filtering, WAF |
| **Worker Rate Limit** | 60 req/menit per IP untuk `/api/search`, 20 req/menit lainnya |
| **JWT Verify at Edge** | Gak perlu backend call, 1ms verify |
| **Backend Token** | Disimpan di CF Secrets, gak pernah di browser |
| **No Public IDs** | Hanya slug di URL & response — UUID gak pernah bocor |
| **No Full Data Dump** | Filter cuma return hasil match, bukan semua produk |
| **Response Sanitization** | Worker strip field sensitif sebelum return ke browser |

---

## 8. BUILD & DEPLOY FLOW

```
Developer push ke GitHub
        │
        ▼
GitHub Actions / Cloudflare Pages CI
        │
        ├── npm install
        ├── npm run build
        │     ├── SSG pages: pre-render (home, blog, sitemap)
        │     └── On-demand pages: skip (render pas request)
        ├── Upload ke Cloudflare Pages
        └── Deploy ke production branch
                │
                ▼
           Cloudflare Pages (CDN global)
```

**Build time:** < 2 menit (hanya SSG pages: homepage + blog articles + sitemap).

---

## 9. PERBANDINGAN: SEBELUM vs SESUDAH

| Aspek | SSG Murni 10K Produk | Hybrid (Rencana Ini) |
|-------|---------------------|---------------------|
| Build time | 20-40 menit | < 2 menit |
| Deploy time | 30-60 menit | < 3 menit |
| Product page update | Rebuild semua | Purge 1 URL (instant) |
| Global latency | 10ms (semua) | 10ms (cached) / 250ms (first hit) |
| Backend load | 0 (static) | Sangat rendah (cache miss only) |
| Cost | Storage 10K HTML files | Storage < 100 HTML files + edge compute |
| Scalability | Build timeout > 20K produk | Unlimited (on-demand per page) |

---

## 10. IMPLEMENTASI STEP-BY-STEP

| Step | Task | File |
|------|------|------|
| 1 | Install `@astrojs/cloudflare` adapter | `package.json` |
| 2 | Update `astro.config.mjs` ke hybrid + CF adapter | `astro.config.mjs` |
| 3 | Buat `src/lib/api.ts` — server-side fetch helper | `lib/api.ts` |
| 4 | Buat `src/pages/product/[slug].astro` — on-demand | `product/[slug].astro` |
| 5 | Buat `src/pages/category/[slug].astro` — on-demand | `category/[slug].astro` |
| 6 | Buat `src/pages/blog/[slug].astro` — SSG | `blog/[slug].astro` |
| 7 | Buat `src/components/SearchFilter.tsx` — client-side filter | `SearchFilter.tsx` |
| 8 | Buat `src/components/ProductCard.tsx` | `ProductCard.tsx` |
| 9 | Buat `workers/api-proxy.js` — Cloudflare Worker | `workers/api-proxy.js` |
| 10 | Buat `wrangler.toml` — deploy config | `wrangler.toml` |
| 11 | Tambah webhook handler di backend Go | `internal/handler/rebuild.go` |
| 12 | Setup CF secrets (BACKEND_TOKEN, JWT_SECRET) | CLI |
| 13 | Deploy Worker + Pages | CLI / CI |
