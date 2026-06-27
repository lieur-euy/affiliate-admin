# Strategi SEO & Anti-Plagiarisme — Afiliate Project

> Target: Product Description + Content + Article — Aman di semua search engine, SEO tinggi, bebas plagiat.

---

## 1. ARSITEKTUR KONTEN SAAT INI (Review)

| Entitas | Field Teks | Rich Editor | Multi-locale | SEO Tab |
|---------|-----------|-------------|--------------|---------|
| Product | `name`, `description`, `content` | Ya (TipTap) | id + en | meta_title, meta_description, meta_keywords, OG, canonical, robots |
| Article | `title`, `excerpt`, `content` | Ya (TipTap) | id + en | meta_title, meta_description, meta_keywords, OG, canonical, robots |

**Kesimpulan:** Sistem sudah punya fondasi SEO lengkap. Masalahnya ada di **kualitas konten yang diinput** — bukan di fitur.

---

## 2. STRATEGI ANTI-PLAGIARISME

### 2.1 Prinsip Utama

Plagiarisme terjadi ketika konten Anda:
- Copy-paste mentah dari marketplace/situs lain
- Parafrase minimal (hanya ganti beberapa kata)
- Struktur kalimat identik dengan sumber

**Google tidak menghukum "duplicate content" untuk affiliate site** selama bukan hasil scraping otomatis — tapi konten unik tetap ranking lebih tinggi.

### 2.2 Scraping Specs vs Scraping Konten — Garis Merah

```
✅ AMAN (Fakta — tidak bisa di-copyright):
   - Spesifikasi teknis (CPU, RAM, GPU, dimensi, berat, baterai)
   - Harga, varian warna, SKU
   - Tanggal rilis, garansi
   - Data benchmark publik, sertifikasi

❌ BAHAYA (Konten naratif — bisa kena duplicate content):
   - Deskripsi produk copy-paste dari marketplace
   - Review user, komentar, testimonial
   - Artikel, blog post, buying guide
   - Kalimat marketing brand ("laptop terbaik untuk...")
```

Google membedakan antara **scraping data** (spesifikasi) dan **scraping konten** (narasi). Fakta teknis adalah public domain — tidak ada yang bisa mengklaim copyright atas "Intel Core i7-14700K, 16GB DDR5". Yang kena filter adalah copy-paste kalimat deskriptif.

**Strategi yang aman:**
1. Crawler kamu ambil spesifikasi → simpan di DB (sebagai fakta)
2. Saat generate konten, AI hanya diberi fakta tersebut — bukan teks sumber
3. AI menulis ulang dengan gaya + template sendiri

Dengan cara ini, meskipun 1000 produk berasal dari crawling, **setiap deskripsi akan unik** karena narasinya dihasilkan ulang.

### 2.3 Metode "Layered Rewriting" (Terbukti Aman)

```
Sumber (Marketplace) → Ekstrak Fakta → Rewrite Total → Tambah Value → Publish
```

**Step 1: Ekstrak Fakta (bukan copy teks)**
- Spesifikasi produk (CPU, RAM, berat, dimensi)
- Harga, varian, fitur utama
- Bahan, garansi, kelengkapan

**Step 2: Rewrite Total dengan Template Bervariasi**

Gunakan 5+ template berbeda, rotasi per produk:

| Template | Pola Pembuka | Cocok Untuk |
|----------|-------------|-------------|
| Problem-first | "Butuh laptop yang..." | Product description |
| Feature-highlight | "Ditenagai oleh prosesor..." | Content |
| Comparison | "Dibanding generasi sebelumnya..." | Content / Article |
| Use-case | "Cocok untuk editing video 4K..." | Description |
| FAQ-style | "Pertanyaan umum seputar..." | Article |

**Step 3: Tambah Value Unik (ini pembeda utama)**

- Foto/gallery original (screenshot sendiri)
- Tabel perbandingan harga antar marketplace
- Video unboxing / review singkat
- Tips penggunaan / kompatibilitas
- Update harga real-time

### 2.3 Aturan Praktis Per-Kalimat

```
❌ JANGAN: "Laptop ini memiliki layar 15.6 inci dengan resolusi Full HD"
✅ LAKUKAN: "Panel 15.6" FHD di perangkat ini sudah cukup tajam untuk kerja harian, apalagi dengan color gamut 72% NTSC yang bikin warna tetap akurat saat edit foto ringan."
```

Formula: **Fakta + Opini Mini + Konteks Penggunaan**

---

## 3. APAKAH BUTUH RAG?

### 3.1 Apa itu RAG di konteks ini?

Retrieval-Augmented Generation = sistem yang:
1. Menyimpan database konten produk yang sudah ada
2. Saat bikin konten baru, mencari konten mirip dari database
3. AI generate konten baru dengan "menyadur" dari referensi internal

### 3.2 Kapan RAG diperlukan?

| Kondisi | Butuh RAG? |
|---------|------------|
| Produk < 50 | Tidak — tulis manual / pakai template |
| Produk 50–500 | Opsional — RAG bisa bantu konsistensi tone |
| Produk 500+ | Ya — RAG untuk scale + hindari duplikasi internal |
| Multi-brand sejenis (laptop semua) | Ya — hindari template monoton |
| Multi-kategori (laptop, hp, furniture) | Tidak terlalu — konteks terlalu berbeda |

### 3.3 Rekomendasi untuk Project Ini

**Untuk fase awal (produk < 100):** Tidak perlu RAG. Gunakan:
1. **Prompt template engineering** — buat 10-15 template prompt per kategori produk
2. **Fact-sheet approach** — pisahkan data spesifikasi dari narasi
3. **Human review checklist** — cek 5 poin sebelum publish

**Untuk scale-up nanti:** Bisa tambahkan RAG dengan:
- Embedding konten existing via API (OpenAI/Claude embeddings)
- Vector DB sederhana (pgvector di PostgreSQL — backend sudah pakai Go + PostgreSQL)
- Retrieval: cari top-3 konten paling mirip → pakai sebagai referensi nada/tone, bukan copy

---

## 4. STRATEGI SEO ON-PAGE (High Level)

### 4.1 Struktur Konten Ideal

```
URL: /product/lenovo-legion-5-pro-16
├── Meta Title (50-60 char): "Lenovo Legion 5 Pro 16 - Review, Harga & Spesifikasi 2025"
├── Meta Description (140-160 char): "Review lengkap Lenovo Legion 5 Pro 16: performa Intel i7-14700K, 
│    layar 165Hz, harga terbaru di 5 marketplace. Cek spesifikasi & link pembelian."
├── H1: Lenovo Legion 5 Pro 16 — Laptop Gaming Terbaik 2025?
├── Description (Short): 2-3 paragraf overview
├── Content (Long): Review mendalam, benchmark, perbandingan
├── Specs Table: Structured data (JSON-LD)
├── Price Comparison: Tabel harga multi-marketplace
├── FAQ Section: 5-10 pertanyaan
└── Affiliate CTA: Tombol beli dengan disclosure
```

### 4.2 Keywords Strategy

**Tingkatan Keyword:**

| Tier | Contoh | Volume | Target |
|------|--------|--------|--------|
| Head | "laptop gaming" | Tinggi | Article pillar |
| Mid | "laptop gaming 15 juta" | Medium | Category page |
| Long-tail | "laptop gaming rtx 4060 under 15jt 2025" | Rendah | Product page |
| Buyer-intent | "beli lenovo legion 5 pro" | Rendah-Tinggi | Product page |

**Cara riset keyword tanpa tools mahal:**
1. Ketik di Google → lihat "People also ask" & "Related searches"
2. Marketplace search autocomplete
3. Keywordtool.io (free tier)
4. AnswerThePublic (free tier)
5. Google Trends — bandingkan musim

### 4.3 NLP Keywords yang Aman & Disukai Google

Google makin pintar baca konteks. Gunakan kombinasi:

**Kata transisi alami:**
- untuk, karena, selain itu, namun, jadi, dengan kata lain, sebagai contoh, perlu diketahui, penting diingat, berdasarkan, terbukti

**Kata authority signal:**
- review, spesifikasi, perbandingan, harga terbaru, update 2025, test, benchmark, rekomendasi, tips, cara, panduan

**Kata user-centric:**
- cocok untuk, direkomendasikan bagi, pilihan tepat, alternatif, kelebihan, kekurangan, pengalaman, hasil

**Kata LSI (Latent Semantic Indexing) — contoh kategori laptop:**
- prosesor, performa, RAM, penyimpanan, SSD, GPU, VGA, layar, resolusi, refresh rate, baterai, berat, port, konektivitas, garansi

### 4.4 Aturan Emas Content-Length

| Jenis Konten | Min Words | Ideal Words |
|-------------|-----------|-------------|
| Product Description | 150 | 250–400 |
| Product Content | 500 | 1000–2000 |
| Article | 800 | 1500–3000 |
| Category Page | 300 | 500–800 |

### 4.5 Internal Linking Strategy

Setiap produk/article harus punya:
- **2-3 internal links** ke produk/article terkait
- **Breadcrumb** (Category > Subcategory > Product)
- **Related products** section

---

## 5. PANDUAN PRAKTIS MEMBUAT KONTEN

### 5.0 Menyamarkan Jejak AI — Agar Konten Tidak Terdeteksi Generate

Konten AI punya "fingerprint" yang gampang dikenali — baik oleh pembaca maupun detektor AI. Ini cara menghilangkannya:

#### Ciri Konten AI yang Harus Dihilangkan

| Ciri AI | Kenapa Ketahuan | Cara Samarkan |
|---------|----------------|---------------|
| **Kata repetitif** ("selain itu", "namun", "jadi") | Muncul tiap 2-3 kalimat | Rotasi sinonim, kadang hapus total |
| **Kalimat semua panjang & sempurna** | Manusia nulis pendek-panjang campur | Variasi: 3-5 kata, lalu 20+ kata, lalu 8 kata |
| **Struktur paragraf seragam** (3-4 kalimat semua) | Robotik | Paragraf 1: 1 kalimat. Paragraf 2: 5 kalimat. |
| **Transisi textbook** ("Moreover", "Furthermore", "In conclusion") | Kaku, kayak esai sekolah | Ganti: "Yang menarik...", "Oh ya...", "Intinya..." |
| **Tidak ada "suara personal"** | Flat, impersonal | Sisipkan: "gue", "kamu", "jujur", "BTW" |
| **Em dash (—) & semicolon berlebihan** | GPT suka banget pake — | Batasi 1-2 per artikel |
| **Listicle monoton** ("Pertama, Kedua...") | Template-generate | Variasi: kadang numbered, kadang inline, kadang tabel |
| **Kesimpulan "kesimpulannya..."** | ChatGPT signature | Tutup dengan pertanyaan retoris atau opini |
| **Passive voice dominan** ("dapat digunakan") | AI suka pasif | Paksa aktif: "kamu bisa pakai", "gue coba" |
| **Adverbia berlebihan** ("sangat", "luar biasa") | Over-hype | Pilih 1 per paragraf maks |

#### Teknik "AI Draft → Human Polish"

```
Step 1: AI generate draft dengan prompt khusus (lihat §7.3)
Step 2: Deteksi fingerprint AI:
        - Cek 5 kata pertama tiap paragraf — ada pola?
        - Hitung rata-rata panjang kalimat —  >18 kata = red flag
        - Cari "selain itu" / "by the way" / "it is worth noting"
Step 3: Manual polish minimal:
        - Pecah 1-2 kalimat panjang jadi pendek
        - Tambah 1 kalimat super santai di tengah artikel
        - Ganti 3-5 kata formal → informal
        - Sisipkan 1 opini subjektif ("menurut gue sih...")
        - Hapus 1 paragraf yang terlalu generik
Step 4: Cek ulang dengan GPTZero / Originality.ai (sampling)
```

#### Contoh Before → After

**AI (ketahuan):**
> Laptop ini dilengkapi dengan prosesor Intel Core i7-14700K yang menawarkan performa tinggi untuk kebutuhan komputasi berat. Selain itu, laptop ini memiliki RAM 16GB DDR5 yang memungkinkan multitasking lancar tanpa hambatan. Dengan demikian, laptop ini sangat cocok untuk para profesional kreatif yang membutuhkan performa handal.

**After Polish (manusiawi):**
> Prosesor i7-14700K di mesin ini udah lebih dari cukup buat rendering 4K. Gue sempat test render video 10 menit di Premiere — cuma butuh 3 menit 20 detik. RAM 16GB-nya juga lega, bisa buka 30 tab Chrome + Photoshop barengan tanpa ngadat. Cocok lah buat editor video yang mobilitas tinggi.

**Bedanya:** fakta tetap sama, tapi ada data konkret (3 menit 20 detik), bahasa gaul (ngadat, lah), pengalaman pribadi (gue sempat test).

#### Rule of Thumb "50-30-20"

Untuk 1000 kata konten:
- **50%** dari AI draft (fakta, spesifikasi, data)
- **30%** hasil parafrase manual (gaya bahasa diubah total)
- **20%** konten original manusia (opini, pengalaman, humor, referensi lokal)

#### Prompt Anti-Terdeteksi (Untuk AI Generator)

```
SYSTEM: Tulis dalam bahasa Indonesia natural seperti obrolan tech blogger, 
BUKAN esai akademik. Rules:
- Variasi panjang kalimat: pendek (3-5 kata) + panjang (15-25 kata) acak
- Gunakan kata gaul secukupnya: "gue", "lo", "nggak", "banget", "sih"
- JANGAN pakai: "selain itu" >1x, "dengan demikian", "kesimpulannya", em dash
- Tiap paragraf punya 1 opini atau pengalaman pribadi
- Sesekali pakai pertanyaan retoris
- Jangan semua paragraf strukturnya sama
```

### 5.1 Product Description Template (250-400 kata)

```markdown
## {Nama Produk} — {Value Proposition singkat}

{Paragraf 1: Masalah yang dipecahkan + positioning produk}
{Paragraf 2: Fitur unggulan utama (3-5 poin, bukan list spek mentah)}
{Paragraf 3: Untuk siapa produk ini cocok? (target audience)}
{CTA: Cek harga terbaru + disclosure affiliate}
```

### 5.2 Product Content Template (1000-2000 kata)

```markdown
## Review Lengkap {Nama Produk}

### Overview & First Impression
{Unboxing, build quality, desain}

### Spesifikasi Teknis
{Tabel spesifikasi + penjelasan singkat tiap komponen penting}

### Performa & Benchmark
{Untuk laptop/PC: Cinebench, gaming FPS. Untuk HP: AnTuTu, battery test. 
Gunakan data benchmark publik — sebutkan sumber}

### Pengalaman Penggunaan Sehari-hari
{Bukan cuma spek — ceritakan feel, kenyamanan, noise, panas}

### Kelebihan & Kekurangan
{Pro: 3-5 poin. Cons: 2-3 poin jujur — ini justru bikin trusted}

### Perbandingan dengan Kompetitor
{Tabel singkat vs 2-3 produk seharga}

### Harga & Tempat Beli
{Tabel harga per marketplace + affiliate link + disclosure}

### FAQ
{5-10 pertanyaan umum dengan jawaban singkat}

### Kesimpulan
{Rekomendasi final: beli/tidak, untuk siapa}
```

### 5.3 Article Template (1500-3000 kata)

```markdown
## {Keyword Utama} — {Hook menarik}

### Pendahuluan
{Konteks kenapa topik ini penting sekarang}

### {Sub-topik 1}: {Poin Utama}
{300-500 kata}

### {Sub-topik 2}: {Poin Utama}
{300-500 kata}

### {Sub-topik 3}: {Poin Utama}
{300-500 kata}

### Tips / Rekomendasi
{Actionable advice}

### FAQ
{5-10 pertanyaan}

### Kesimpulan
{Ringkasan + CTA}
```

---

## 6. ARSITEKTUR CRAWLER → KONTEN (Pipeline Aman)

```
┌─────────────┐     ┌───────────────┐     ┌──────────────┐     ┌─────────────┐
│  Crawler    │ ──► │  DB Specs     │ ──► │  AI Rewriter │ ──► │  Konten     │
│  (Scrape    │     │  (Fakta       │     │  (Fakta +     │     │  Original   │
│   Spesifikasi)│    │   Mentah)     │     │   Template +  │     │  + SEO      │
└─────────────┘     └───────────────┘     │   Opini)      │     └─────────────┘
                                          └──────────────┘
                          ▲
                          │
               Aman — hanya ambil data fakta,
               bukan teks naratif sumber.
```

**Poin kunci pipeline:**
- Crawler hanya menyimpan field terstruktur (name, specs key-value, price), bukan HTML mentah
- AI/renderer menerima JSON specs, bukan teks sumber marketplace
- Setiap generate pakai template berbeda (rotasi 5+ pola)
- Human reviewer cek sampling sebelum publish massal

## 7. CHECKLIST ANTI-PLAGIARISME (Sebelum Publish)

- [ ] Judul original (tidak copy dari marketplace)
- [ ] Struktur/subheading berbeda dari sumber
- [ ] Opini/kalimat personal ada di tiap paragraf
- [ ] Ada setidaknya 1 elemen unik (tabel harga, tips, foto sendiri)
- [ ] Cek 2-3 kalimat acak di Google (pakai tanda kutip) — pastikan 0 hasil
- [ ] Afiliate disclosure jelas
- [ ] Specs akurat (cross-check 2+ sumber)
- [ ] Internal link ke 2+ halaman lain
- [ ] Images punya alt text dengan keyword
- [ ] Meta title & description unik per halaman

---

## 8. IMPLEMENTASI TEKNIS (Yang Bisa Ditambahkan)

### 7.1 Fitur di Admin Panel yang Bisa Dikembangkan

| Fitur | Prioritas | Benefit |
|-------|-----------|---------|
| Content uniqueness checker (API) | Medium | Deteksi plagiat sebelum publish |
| SEO scoring real-time | Medium | Skor on-page SEO langsung di form |
| Template content generator | Rendah | Dropdown pilih template → prefill struktur |
| Keyword density checker | Rendah | Hitung kepadatan keyword di content |
| Readability score | Rendah | Flesch Reading Ease untuk tiap locale |
| Auto internal link suggestion | Rendah | Rekomendasi internal link berdasarkan tag/kategori |
| Bulk content diff | Rendah | Cek konten mirip antar produk sendiri |

### 7.2 Structured Data (Sudah didukung arsitektur)

Tambahkan JSON-LD di frontend (Astro web):

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Lenovo Legion 5 Pro 16",
  "description": "...",
  "image": "...",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "14999000",
    "highPrice": "18999000",
    "priceCurrency": "IDR",
    "offerCount": "5"
  },
  "review": {
    "@type": "Review",
    "reviewBody": "..."
  }
}
```

### 7.3 Prompt Engineering untuk AI Content Generator (Jika Pakai)

```
SYSTEM: Anda adalah copywriter affiliate Indonesia. Gaya: natural, informatif, 
tidak hard-sell. Target: membantu pembeli memutuskan. Rules:
1. JANGAN gunakan kalimat template/pengulangan antar produk
2. Setiap deskripsi HARUS punya 1 opini + 1 use-case spesifik
3. Struktur HARUS berbeda antar produk — rotasi antara problem-first, 
   feature-highlight, atau comparison-based
4. Disclosure affiliate: "Sebagai catatan, kami bisa mendapat komisi dari 
   pembelian melalui link di atas tanpa biaya tambahan untuk Anda."
5. Gunakan fakta dari spesifikasi yang diberikan, JANGAN mengarang spek
```

---

## 9. KESIMPULAN & REKOMENDASI

| Aspek | Rekomendasi |
|-------|-------------|
| **Anti-plagiat** | Layered rewriting (fakta → rewrite total → tambah value). Template rotasi min 5 pola. Opini mini di tiap paragraf. |
| **RAG** | Tidak butuh sekarang. Pakai prompt template + human review untuk <100 produk. Evaluasi lagi setelah 500+ produk. |
| **SEO On-page** | Struktur konten terstandarisasi, meta tag lengkap, internal linking, FAQ section, structured data JSON-LD. |
| **Keywords** | Fokus long-tail + buyer-intent. Riset dari Google suggest & marketplace autocomplete. |
| **Tools** | Google Trends (gratis), AnswerThePublic (gratis), Keywordtool.io (free), Copyscape/Quetext (cek plagiat). |
| **Scale plan** | Phase 1: Manual + template (<100 produk). Phase 2: AI-assisted + human review (100-500). Phase 3: RAG + automation (500+). |

---

## 10. KATA & FRASA AMAN UNTUK SEO (ID + EN)

### Indonesia (ID)
**Pembuka paragraf:** Perlu diketahui, Penting diingat, Menariknya, Tak hanya itu, Sebagai informasi, Perlu dicatat, Faktanya, Yang membedakan, Satu hal yang

**Authority signal:** Berdasarkan, Hasil pengujian, Terbukti, Review pengguna, Menurut data, Spesifikasi resmi, Klaim pabrikan

**Use-case:** Cocok untuk, Ideal bagi, Direkomendasikan untuk, Pilihan tepat bagi, Alternatif bagi

**Call-to-action:** Cek harga terbaru, Lihat di marketplace, Beli dengan harga terbaik, Dapatkan penawaran

**Transisi:** Selain itu, Di sisi lain, Namun, Sementara itu, Jadi, Dengan demikian, Oleh karena itu

### English (EN)
**Opening:** It's worth noting, Interestingly, What sets this apart, The key highlight, One thing to mention, As it turns out

**Authority:** Based on, According to, Tested, Proven, Reviews indicate, Official specs, Manufacturer claims

**Use-case:** Suitable for, Ideal for, Recommended for, A great choice for, Perfect for

**CTA:** Check latest price, See on marketplace, Get the best deal, Shop now

**Transition:** Moreover, On the other hand, However, Meanwhile, Therefore, As a result, In addition
