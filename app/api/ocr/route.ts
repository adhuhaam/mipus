import { NextRequest, NextResponse } from "next/server";
import {
  scanBufferForPermitFieldsServer,
  warmOcrEngine,
} from "@/lib/ocr-scan-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

warmOcrEngine();

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("image");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing image field" }, { status: 400 });
  }

  const mime = file.type || "application/octet-stream";
  if (!mime.startsWith("image/")) {
    return NextResponse.json(
      { error: "Please upload an image (JPG or PNG)" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0) {
    return NextResponse.json({ error: "Empty image" }, { status: 400 });
  }
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image too large (max 10 MB)" },
      { status: 413 },
    );
  }

  try {
    const fields = await scanBufferForPermitFieldsServer(buffer);
    return NextResponse.json(fields);
  } catch (err) {
    console.error("OCR route error", err);
    const detail =
      err instanceof Error ? err.message : "OCR engine error";
    return NextResponse.json(
      {
        error:
          "Could not read the document. Try a clearer photo or enter numbers manually.",
        detail: process.env.NODE_ENV === "development" ? detail : undefined,
      },
      { status: 500 },
    );
  }
}
