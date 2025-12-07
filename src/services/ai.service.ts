import { openai } from "@/lib/ai";
import { GenerateDescriptionInput } from "@/validation/ai";

export interface AIService {
  generateProductDescription(input: GenerateDescriptionInput): Promise<string>;
}

export class GeminiAIService implements AIService {
  async generateProductDescription(
    input: GenerateDescriptionInput
  ): Promise<string> {
    const { productName, category } = input;

    const prompt = `Buatkan template deskripsi produk untuk:
Nama Produk: ${productName}
Kategori: ${category}

Template harus berisi:
1. Placeholder untuk fitur utama (misal: [FITUR_UTAMA])
2. Placeholder untuk manfaat utama (misal: [MANFAAT_PENGGUNA])
3. Placeholder untuk ukuran/spesifikasi (misal: [UKURAN/SPESIFIKASI])
4. Placeholder untuk target pengguna (misal: [TARGET_PENGGUNA])
5. Placeholder untuk keunggulan kompetitif (misal: [KEUNGGULAN_UNIK])
6. Placeholder untuk call-to-action (misal: [AJAKAN_BERTINDAK])
7. Format template dalam bentuk paragraf yang koheren
8. Gunakan placeholder dalam kurung siku ([...]) agar mudah diganti
9. Panjang template: 100-150 kata`;

    const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash-lite",
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah seorang copywriter profesional yang membuat template deskripsi produk. Gunakan placeholder dalam kurung siku [NAMA_PLACEHOLDER] untuk bagian-bagian yang bisa diedit pengguna. Template harus mudah dimodifikasi dan tetap koheren saat placeholder diganti.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Gagal mendapatkan respons dari AI");
    }

    return content;
  }
}

// Singleton instance
export const aiService = new GeminiAIService();
