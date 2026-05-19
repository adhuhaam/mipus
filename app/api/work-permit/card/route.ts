import { NextRequest, NextResponse } from "next/server";
import {
  buildCardUrl,
  upstreamErrorMessage,
  xpatHeaders,
} from "@/lib/xpat-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const workPermitNumber = request.nextUrl.searchParams
    .get("workPermitNumber")
    ?.trim();
  const passportNumber = request.nextUrl.searchParams
    .get("passportNumber")
    ?.trim();

  if (!workPermitNumber || !passportNumber) {
    return NextResponse.json(
      {
        errors: [
          "You are required to provide passport number and work permit number.",
        ],
      },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(buildCardUrl(workPermitNumber, passportNumber), {
      headers: xpatHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const message = await upstreamErrorMessage(res);
      return NextResponse.json({ errors: [message] }, { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/png";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch card image";
    return NextResponse.json({ errors: [message] }, { status: 500 });
  }
}
