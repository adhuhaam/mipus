import type { WorkPermitRecord } from "@/types/work-permit";
import { displayValue, formatDateLong } from "@/lib/format";

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function row(label: string, value: string | null | undefined): string {
  const v = displayValue(value ?? null);
  if (v === "—") return "";
  return `<b>${esc(label)}:</b> ${esc(v)}\n`;
}

function rowCode(label: string, value: string | null | undefined): string {
  const v = displayValue(value ?? null);
  if (v === "—") return "";
  return `<b>${esc(label)}:</b> <code>${esc(v)}</code>\n`;
}

function section(title: string, lines: string[]): string {
  const body = lines.filter(Boolean).join("");
  if (!body) return "";
  return `<b>${esc(title)}</b>\n\n${body}\n`;
}

export function formatTelegramStatusMessage(record: WorkPermitRecord): string {
  const personal = [
    row("Name", record.fullName),
    row("Nationality", record.nationality),
    row("Gender", record.gender),
    row("Date of Birth", formatDateLong(record.dateOfBirth)),
    row("Contact", record.contactNumber),
  ];

  const permit = [
    row("Status", record.isValid),
    rowCode("Work Permit No", record.workPermitNumber),
    rowCode("Passport No", record.passportNumber),
  ];

  const employment = [
    row("Occupation", record.occupationName),
    row("Employer", record.employerName),
    row("Registration No", record.employerNumber),
    row("Employer contact", record.employerContactNumber),
  ];

  const validity = [
    row("Issued Date", formatDateLong(record.workPermitIssuedDate)),
    row("Expiry Date", formatDateLong(record.workPermitExpiry)),
  ];

  const parts = [
    section("PERSONAL INFORMATION", personal),
    section("WORK PERMIT DETAILS", permit),
    section("EMPLOYMENT INFORMATION", employment),
    section("VALIDITY DETAILS", validity),
  ].filter(Boolean);

  if (record.verifyUrl) {
    const safeUrl = record.verifyUrl.replace(/"/g, "%22");
    parts.push(
      `<b>VERIFICATION</b>\n\n<b>Verify on:</b> <a href="${safeUrl}">eGov</a>\n`,
    );
  }

  return parts.join("\n").trim();
}

export function formatTelegramErrorMessage(error: string): string {
  return `❌ <b>Lookup failed</b>\n\n${esc(error)}`;
}
