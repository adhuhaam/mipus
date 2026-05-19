import { NextRequest, NextResponse } from "next/server";
import { buildImageUrl, upstreamErrorMessage, xpatHeaders } from "@/lib/xpat-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const photoId = request.nextUrl.searchParams.get("photoId")?.trim();
  const serviceId = request.nextUrl.searchParams.get("serviceId")?.trim();

  if (!photoId || !serviceId) {
    return NextResponse.json(
      { errors: ["photoId and serviceId are required"] },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(buildImageUrl(photoId, serviceId), {
      headers: xpatHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const message = await upstreamErrorMessage(res);
      return NextResponse.json({ errors: [message] }, { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/jpeg";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch photo";
    return NextResponse.json({ errors: [message] }, { status: 500 });
  }
}
