-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "tiktok_id" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "tiktok_id" TEXT;

-- CreateTable
CREATE TABLE "tiktok_integrations" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "access_token_expiry" TIMESTAMP(3) NOT NULL,
    "scopes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tiktok_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tiktok_integrations_store_id_key" ON "tiktok_integrations"("store_id");

-- AddForeignKey
ALTER TABLE "tiktok_integrations" ADD CONSTRAINT "tiktok_integrations_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
