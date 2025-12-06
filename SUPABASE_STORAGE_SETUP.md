# Setup Supabase Storage untuk Product Images

Error yang Anda alami: **"Bucket not found"** terjadi karena bucket `products` belum dibuat di Supabase.

## 📋 Langkah-langkah Setup:

### 1. Login ke Supabase Dashboard
1. Buka https://supabase.com/dashboard
2. Login dengan akun Anda
3. Pilih project yang sesuai

### 2. Buat Storage Bucket
1. Di sidebar kiri, klik **"Storage"**
2. Klik tombol **"Create a new bucket"** atau **"New bucket"**
3. Isi form:
   - **Name**: `products`
   - **Public bucket**: ✅ **CENTANG** (harus public agar gambar bisa diakses)
   - **File size limit**: 50 MB (optional, sesuaikan kebutuhan)
   - **Allowed MIME types**: image/* (optional, untuk restrict hanya image)
4. Klik **"Create bucket"**

### 3. Setup RLS (Row Level Security) Policies

Karena autentikasi dihandle di level aplikasi (bukan Supabase Auth), kita akan buat policy public untuk semua operasi:

1. Klik bucket `products`
2. Klik tab **"Policies"**
3. Klik **"New Policy"**
4. Pilih **"New policy"** → **"For full customization"**

#### Policy 1: Public Read Access
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');
```

#### Policy 2: Public Insert/Upload Access
```sql
CREATE POLICY "Public insert access"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'products');
```

#### Policy 3: Public Update Access
```sql
CREATE POLICY "Public update access"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'products');
```

#### Policy 4: Public Delete Access
```sql
CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'products');
```

> **✅ Keamanan**: Access control dihandle di level aplikasi Next.js (server actions), jadi aman untuk memberikan public access di Supabase Storage.

### 4. Buat Folder Structure (Optional)
Buat folder untuk organize files:
1. Klik bucket `products`
2. Klik **"Create folder"**
3. Buat folder:
   - `images` (untuk product images)
   - `barcodes` (untuk barcode images)

> **Note:** Folder akan otomatis dibuat saat upload jika belum ada.

### 5. Setup Environment Variables

Pastikan file `.env.local` sudah ada dan berisi:

```env
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public

# Auth
AUTH_SECRET=your-super-secret-key
SALT_ROUNDS=10

# Supabase - WAJIB DIISI!
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Cara Dapatkan Credentials:
1. Di Supabase Dashboard, klik **"Settings"** (gear icon)
2. Klik **"API"**
3. Copy nilai:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** → **anon/public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 6. Restart Dev Server
Setelah update `.env.local`, restart dev server:
```bash
# Stop server (Ctrl+C)
# Start lagi
pnpm dev
```

---

## ✅ Verifikasi Setup

### Test Manual Upload:
1. Di Supabase Dashboard → Storage → `products`
2. Klik **"Upload file"**
3. Upload gambar test
4. Jika berhasil, setup sudah OK!

### Test dari Aplikasi:
1. Buka aplikasi
2. Create atau Edit product
3. Upload gambar
4. Jika tidak ada error "Bucket not found", sukses! ✅

---

## 🐛 Troubleshooting

### Error: "Bucket not found"
- ✅ Pastikan bucket `products` sudah dibuat
- ✅ Pastikan bucket name persis `products` (lowercase, no spaces)
- ✅ Restart dev server setelah setup

### Error: "Policy violation" atau "Access denied"
- ✅ Pastikan bucket di-set **public**
- ✅ Setup RLS policies dengan public access (jalankan SQL script)
- ✅ Check di Supabase: Storage → products → Policies (harus ada 4 policies)

### Error: "Invalid credentials"
- ✅ Check environment variables di `.env.local`
- ✅ Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` correct
- ✅ Restart dev server

### Gambar tidak muncul setelah upload
- ✅ Pastikan bucket PUBLIC atau
- ✅ Check RLS policy untuk SELECT
- ✅ Verify URL gambar di browser (harus bisa diakses)

---

## 📦 Storage Structure Setelah Setup

```
Supabase Storage
└── products/ (bucket)
    ├── images/          ← Product images
    │   ├── 1733467200000-abc123.jpg
    │   ├── 1733467201000-def456.png
    │   └── ...
    └── barcodes/        ← Barcode images
        ├── 1733467202000-ghi789.jpg
        └── ...
```

---

## 🚀 Quick Setup Script

Jika ingin cepat, gunakan SQL ini di **SQL Editor** Supabase:

1. Di Supabase Dashboard, klik **"SQL Editor"** di sidebar
2. Klik **"New query"**
3. Copy-paste SQL berikut:

```sql
-- Policies untuk bucket 'products' - Full Public Access
-- Catatan: Bucket 'products' harus sudah dibuat manual via UI terlebih dahulu

-- Policy 1: Public read
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Policy 2: Public insert/upload
CREATE POLICY "Public insert access"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'products');

-- Policy 3: Public update
CREATE POLICY "Public update access"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'products');

-- Policy 4: Public delete
CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'products');
```

4. Klik **"Run"** atau tekan `Ctrl+Enter`

> **⚠️ Important:** 
> - Buat bucket `products` dulu secara manual via UI (Storage → New bucket)
> - Centang "Public bucket" saat create
> - Baru jalankan SQL policies di atas
> - Security dihandle di aplikasi Next.js, bukan di Supabase

---

## 📞 Need Help?

Jika masih ada error:
1. Check browser console untuk detail error
2. Check Supabase dashboard logs
3. Verify bucket name = `products` (exact match)
4. Pastikan env variables sudah di-load (restart server)

---

**Created**: December 6, 2025  
**Purpose**: Setup Supabase Storage untuk fitur upload product images
