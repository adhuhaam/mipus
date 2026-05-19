import type { ExtractedPermitFields } from "./ocr-extract";

export type OcrProgress = {
  status: string;
  progress: number;
};

/**
 * PWA scan: upload image to server PaddleOCR (PP-OCRv4).
 * Faster and more accurate than running WASM OCR in the browser.
 */
export async function scanDocumentForPermitFields(
  file: File,
  onProgress?: (p: OcrProgress) => void,
): Promise<ExtractedPermitFields> {
  onProgress?.({ status: "Uploading…", progress: 15 });

  const form = new FormData();
  form.append("image", file);

  onProgress?.({ status: "Reading document…", progress: 35 });

  const res = await fetch("/api/ocr", {
    method: "POST",
    body: form,
  });

  const body = (await res.json().catch(() => null)) as
    | ExtractedPermitFields
    | { error?: string }
    | null;

  if (!res.ok) {
    const msg =
      body && "error" in body && typeof body.error === "string"
        ? body.error
        : "Document scan failed";
    throw new Error(msg);
  }

  if (!body || !("workPermitNumber" in body)) {
    throw new Error("Invalid OCR response");
  }

  onProgress?.({ status: "Done", progress: 100 });
  return body;
}
