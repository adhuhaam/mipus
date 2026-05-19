const XPAT_BASE = "https://mobile-xpat.egov.mv/api/v1";

export function getApiKey(): string {
  const key = process.env.XPAT_API_KEY;
  if (!key) {
    throw new Error("XPAT_API_KEY is not configured");
  }
  return key;
}

export function xpatHeaders(): HeadersInit {
  return { ApiKey: getApiKey() };
}

export function parsePhotoIds(
  photoUrl: string | null | undefined,
): { photoId: string; serviceId: string } | null {
  if (!photoUrl) return null;
  try {
    const url = new URL(photoUrl);
    const photoId =
      url.searchParams.get("photoId") ?? url.searchParams.get("PhotoId");
    const serviceId =
      url.searchParams.get("serviceId") ?? url.searchParams.get("ServiceId");
    if (photoId && serviceId) return { photoId, serviceId };
  } catch {
    /* ignore */
  }
  return null;
}

export function buildWorkPermitUrl(
  workPermitNumber: string,
  passportNumber: string,
): string {
  const url = new URL(`${XPAT_BASE}/WorkPermit`);
  url.searchParams.set("WorkPermitNumber", workPermitNumber.trim());
  url.searchParams.set("PassportNumber", passportNumber.trim());
  return url.toString();
}

export function buildCardUrl(
  workPermitNumber: string,
  passportNumber: string,
): string {
  const url = new URL(`${XPAT_BASE}/WorkPermitCard/GetWorkPermitCard`);
  url.searchParams.set("WorkPermitNumber", workPermitNumber.trim());
  url.searchParams.set("PassportNumber", passportNumber.trim());
  return url.toString();
}

export function buildImageUrl(photoId: string, serviceId: string): string {
  const url = new URL(`${XPAT_BASE}/WorkPermit/GetImage`);
  url.searchParams.set("PhotoId", photoId);
  url.searchParams.set("ServiceId", serviceId);
  return url.toString();
}

export async function upstreamErrorMessage(
  res: Response,
): Promise<string> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await res.json()) as { errors?: string[] };
    if (body.errors?.length) return body.errors.join(" ");
  }
  return `Upstream API returned ${res.status}`;
}
