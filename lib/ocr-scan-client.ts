import type { ExtractedPermitFields } from "./ocr-extract";

export type OcrProgress = {
  status: string;
  progress: number;
};

/** PWA scan: POST image to server Tesseract OCR, then auto-lookup. */
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
        : res.status === 504
          ? "Scan timed out. Enter numbers manually or try again."
          : "Document scan failed";
    throw new Error(msg);
  }

  if (!body || !("workPermitNumber" in body)) {
    throw new Error("Invalid OCR response");
  }

  onProgress?.({ status: "Done", progress: 100 });
  return body;
}
