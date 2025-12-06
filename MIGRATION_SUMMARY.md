# Summary Perubahan: Product & Variant Schema Update

## 📝 Overview
Perubahan ini menghilangkan field `barcode` dan `sku` dari model **Product**, dan memindahkan tracking barcode ke level **ProductVariant** dengan menambahkan field `gtin` (Global Trade Item Number) dan `barcodeImage` (URL gambar barcode yang disimpan di Supabase Storage).

---

## 🗄️ Database Changes

### Migration Created
- **File**: `20251206085436_remove_product_barcode_sku_add_variant_gtin_barcode_image`
- **Status**: ✅ Applied

### Schema Changes

#### Model `Product` (products table)
**Removed fields:**
- ❌ `sku` (String?)
- ❌ `barcode` (String?)

**Current fields:**
```prisma
model Product {
  id          String
  name        String
  slug        String
  description String?
  storeId     String
  categoryId  String?
  status      ProductStatus
  // ... relations
}
```

#### Model `ProductVariant` (product_variants table)
**Added fields:**
- ✅ `gtin` (String?) - Global Trade Item Number (EAN/UPC), max 14 characters
- ✅ `barcodeImage` (String?) - URL to barcode image stored in Supabase Storage

**Updated fields:**
```prisma
model ProductVariant {
  id           String
  name         String
  sku          String?         // Tetap ada
  gtin         String?         // NEW: GTIN/EAN/UPC
  barcodeImage String?         // NEW: URL barcode image
  price        Decimal
  costPrice    Decimal?
  stock        Int
  weight       Decimal?
  productId    String
  // ... relations
}
```

---

## 🔧 Code Changes

### 1. **Validation Schema** (`src/validation/product.ts`)
- ❌ Removed `sku` and `barcode` from `createProductSchema`
- ✅ Added `gtin` (max 14 chars) to `createProductVariantSchema`
- ✅ Added `barcodeImage` (URL validation) to `createProductVariantSchema`

### 2. **TypeScript Types** (`src/types/index.ts`)
- Updated `Product` interface - removed `sku` and `barcode`
- Updated `ProductVariant` interface - added `gtin` and `barcodeImage`
- Updated all related input interfaces

### 3. **Repository** (`src/repositories/product.repository.ts`)
- Removed `sku` from search query in `findByStoreId`

### 4. **Actions** (`src/app/dashboard/products/actions.ts`)
- **createProduct**: Removed `sku` and `barcode` handling
- **updateProduct**: Removed `sku` and `barcode` handling
- **createVariant**: Added `gtin` and `barcodeImage` handling
- **updateVariant**: Added `gtin` and `barcodeImage` handling

### 5. **UI Components**

#### Product Form (`_components/product-form.tsx`)
**Removed:**
- ❌ SKU input field
- ❌ Barcode input field

**Result:** Form sekarang hanya ada Name, Slug, Description, Category, dan Status

#### Variants Manager (`_components/variants-manager.tsx`)
**Added:**
- ✅ GTIN input field (max 14 characters)
- ✅ Barcode Image upload field dengan preview
- ✅ Image upload ke Supabase Storage
- ✅ Display GTIN di table variants

**Removed:**
- ❌ Barcode text input

**Features:**
- Upload barcode image otomatis ke Supabase Storage bucket `products/barcodes/`
- Preview image sebelum upload
- Remove image capability
- Display GTIN di table list

#### Product Detail Page (`[id]/page.tsx`)
**Updated:**
- ❌ Removed display SKU and Barcode
- ✅ Changed description dari SKU ke Slug
- ✅ Simplified product info display

---

## 📦 Supabase Integration

### New File: `src/lib/supabase.ts`
Supabase storage helper dengan fungsi:

- **`uploadFile(file, bucket, folder)`** - Generic file upload
- **`deleteFile(url, bucket)`** - Delete file by URL
- **`uploadBarcodeImage(file)`** - Specific untuk barcode upload

### Storage Structure
```
supabase-storage/
└── products/
    └── barcodes/
        ├── {timestamp}-{random}.jpg
        ├── {timestamp}-{random}.png
        └── ...
```

### Environment Variables Required
Add ke `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 📦 Dependencies Added
```json
{
  "@supabase/supabase-js": "2.86.2"
}
```

---

## ✅ Checklist Completion

- [x] Update Prisma schema
- [x] Create & apply migration
- [x] Update validation schemas
- [x] Update TypeScript types
- [x] Update repositories
- [x] Update server actions
- [x] Update product form (remove SKU/Barcode)
- [x] Update variants form (add GTIN/Barcode Image)
- [x] Update product detail page
- [x] Setup Supabase storage helper
- [x] Install Supabase client library

---

## 🚀 How to Use

### 1. Setup Supabase Storage
1. Login ke Supabase Dashboard
2. Create bucket bernama `products` (public)
3. Set RLS policies untuk upload (authenticated users)
4. Copy Project URL dan Anon Key ke `.env.local`

### 2. Create Product
- Form product sekarang **lebih simple** (tanpa SKU/Barcode)
- SKU dan tracking barcode dipindah ke **variant level**

### 3. Add Variant
- Input **SKU** (optional) - untuk internal tracking
- Input **GTIN** (optional) - untuk EAN/UPC barcode number
- Upload **Barcode Image** (optional) - untuk print label

### 4. Display Barcode
Variant sekarang punya `barcodeImage` URL yang bisa di-display:
```tsx
{variant.barcodeImage && (
  <Image src={variant.barcodeImage} alt="Barcode" />
)}
```

---

## 🎯 Benefits

1. ✅ **Better Data Organization**: SKU/Barcode di level variant (bukan product)
2. ✅ **Visual Barcode**: Bisa upload & display barcode image
3. ✅ **GTIN Support**: Standard global untuk product identification
4. ✅ **Simpler Product Form**: Fokus ke info dasar product
5. ✅ **Scalable**: Ready untuk multi-variant products dengan barcode berbeda

---

## ⚠️ Notes

- Data lama di field `products.sku` dan `products.barcode` **sudah dihapus** saat migration
- Pastikan Supabase Storage sudah di-setup sebelum upload barcode image
- File upload bersifat optional - variant tetap bisa dibuat tanpa barcode image
- GTIN max 14 karakter sesuai standard (EAN-13, UPC-A, dll)

---

## 🐛 Troubleshooting

### "Supabase upload error: Bucket not found"
- Pastikan bucket `products` sudah dibuat di Supabase Dashboard
- Set bucket sebagai public

### "Invalid file URL format"
- Check format URL Supabase: `https://{project}.supabase.co/storage/v1/object/public/products/...`

### Environment variables not found
- Check `.env.local` sudah ada `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server setelah update env

---

**Created**: December 6, 2025  
**Migration**: `20251206085436_remove_product_barcode_sku_add_variant_gtin_barcode_image`
