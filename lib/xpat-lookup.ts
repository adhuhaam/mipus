import type { WorkPermitRecord } from "@/types/work-permit";
import {
  buildWorkPermitUrl,
  upstreamErrorMessage,
  xpatHeaders,
} from "@/lib/xpat-api";

export type WorkPermitLookupResult =
  | { ok: true; record: WorkPermitRecord }
  | { ok: false; error: string; status: number };

export async function lookupWorkPermit(
  workPermitNumber: string,
  passportNumber: string,
): Promise<WorkPermitLookupResult> {
  const wp = workPermitNumber.trim();
  const pass = passportNumber.trim();

  if (!wp || !pass) {
    return {
      ok: false,
      error: "Work permit number and passport number are both required.",
      status: 400,
    };
  }

  try {
    const res = await fetch(buildWorkPermitUrl(wp, pass), {
      headers: xpatHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        ok: false,
        error: await upstreamErrorMessage(res),
        status: res.status,
      };
    }

    const record = (await res.json()) as WorkPermitRecord;
    return { ok: true, record };
  } catch {
    return {
      ok: false,
      error: "Could not reach the Xpat API. Try again later.",
      status: 500,
    };
  }
}
