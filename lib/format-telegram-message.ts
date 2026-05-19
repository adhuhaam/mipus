import type { WorkPermitRecord } from "@/types/work-permit";
import { displayValue, formatDate } from "@/lib/format";

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function line(label: string, value: string | null | undefined): string {
  const v = displayValue(value ?? null);
  if (v === "—") return "";
  return `<b>${esc(label)}</b>\n${esc(v)}\n`;
}

export function formatTelegramStatusMessage(record: WorkPermitRecord): string {
  const name = displayValue(record.fullName);
  const valid = displayValue(record.isValid);
  const state = displayValue(record.workPermitStateName);

  const parts = [
    "🪪 <b>Xpat status</b>\n",
    `<b>${esc(name)}</b>\n`,
    `📋 <b>${esc(valid)}</b> · ${esc(state)}\n`,
    "─────────────\n",
    line("Work permit", record.workPermitNumber),
    line("Passport", record.passportNumber),
    line("Occupation", record.occupationName),
    line("Nationality", record.nationality),
    line("Gender", record.gender),
    line("Date of birth", formatDate(record.dateOfBirth)),
    line("Issued", formatDate(record.workPermitIssuedDate)),
    line("Expiry", formatDate(record.workPermitExpiry)),
    line("Employer", record.employerName),
    line("Employer no.", record.employerNumber),
  ].filter(Boolean);

  if (record.verifyUrl) {
    const safeUrl = record.verifyUrl.replace(/"/g, "%22");
    parts.push(`\n<a href="${safeUrl}">Verify on eGov</a>`);
  }

  return parts.join("\n");
}

export function formatTelegramErrorMessage(error: string): string {
  return `❌ <b>Lookup failed</b>\n\n${esc(error)}`;
}
