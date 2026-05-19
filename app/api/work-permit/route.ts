import { NextRequest, NextResponse } from "next/server";
import type { ApiErrorResponse, WorkPermitRecord } from "@/types/work-permit";
import {
  buildWorkPermitUrl,
  parsePhotoIds,
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
      } satisfies ApiErrorResponse,
      { status: 400 },
    );
  }

  try {
    const res = await fetch(
      buildWorkPermitUrl(workPermitNumber, passportNumber),
      {
        headers: xpatHeaders(),
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const message = await upstreamErrorMessage(res);
      return NextResponse.json(
        { errors: [message] } satisfies ApiErrorResponse,
        { status: res.status },
      );
    }

    const record = (await res.json()) as WorkPermitRecord;
    const photoIds = parsePhotoIds(record.photoUrl);

    return NextResponse.json({
      record,
      photoIds,
      assets: {
        photo:
          photoIds &&
          `/api/work-permit/photo?photoId=${encodeURIComponent(photoIds.photoId)}&serviceId=${encodeURIComponent(photoIds.serviceId)}`,
        card: `/api/work-permit/card?workPermitNumber=${encodeURIComponent(workPermitNumber)}&passportNumber=${encodeURIComponent(passportNumber)}`,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to reach Xpat API";
    return NextResponse.json(
      { errors: [message] } satisfies ApiErrorResponse,
      { status: 500 },
    );
  }
}
