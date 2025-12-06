/*
  Warnings:

  - You are about to drop the column `barcode` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `barcode` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "barcode",
ADD COLUMN     "barcode_image" TEXT,
ADD COLUMN     "gtin" TEXT;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "barcode",
DROP COLUMN "sku";
