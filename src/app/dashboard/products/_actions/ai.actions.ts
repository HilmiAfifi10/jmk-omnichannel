"use server";

import { aiService } from "@/services/ai.service";
import { generateDescriptionSchema } from "@/validation/ai";
import { ActionResult } from "@/types";

export async function generateProductDescription(
  formData: FormData
): Promise<ActionResult<string>> {
  try {
    const rawData = {
      productName: formData.get("productName") as string,
      category: formData.get("category") as string,
    };

    const validatedData = generateDescriptionSchema.safeParse(rawData);

    if (!validatedData.success) {
      const fieldErrors = validatedData.error.flatten().fieldErrors;
      return {
        success: false,
        error: "Validasi gagal",
        errors: fieldErrors as Record<string, string[]>,
      };
    }

    const description = await aiService.generateProductDescription(
      validatedData.data
    );

    return {
      success: true,
      data: description,
    };
  } catch (error) {
    console.error("Error generating description:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal generate deskripsi",
    };
  }
}
