import { recognize } from "tesseract.js";
import { extractPermitFields, type ExtractedPermitFields } from "./ocr-extract";
import { preprocessOcrImage } from "./ocr-preprocess";

/** Fast English models (downloaded once into /tmp on Vercel). */
const TESSDATA_BASE = "https://tessdata.projectnaptha.com/4.0.0_fast";

/** Server OCR for Telegram photos only (Tesseract v7). */
export async function scanBufferForPermitFieldsServer(
  image: Buffer,
): Promise<ExtractedPermitFields> {
  const processed = await preprocessOcrImage(image);

  const result = await recognize(processed, "eng", {
    cachePath: "/tmp",
    langPath: TESSDATA_BASE,
    gzip: true,
    logger: () => {},
  });

  return extractPermitFields(result.data.text);
}

/** No-op warm; tessdata loads on first recognize() into /tmp. */
export function warmOcrEngine(): void {}
