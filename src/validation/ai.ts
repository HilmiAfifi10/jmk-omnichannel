import { z } from "zod";

export const generateDescriptionSchema = z.object({
  productName: z.string().min(1, "Nama produk harus diisi"),
  category: z.string().min(1, "Kategori harus diisi"),
});

export type GenerateDescriptionInput = z.infer<
  typeof generateDescriptionSchema
>;
