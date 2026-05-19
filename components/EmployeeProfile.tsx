"use client";

import type { WorkPermitRecord } from "@/types/work-permit";
import { displayValue, formatDate } from "@/lib/format";

export interface EmployeeProfileProps {
  record: WorkPermitRecord;
  photoUrl: string | null;
  cardImageUrl: string;
}

type DetailRow = {
  label: string;
  value: string;
  highlight?: boolean;
};

function formatField(
  key: keyof WorkPermitRecord,
  value: string | null,
): string {
  if (
    key === "dateOfBirth" ||
    key === "workPermitIssuedDate" ||
    key === "workPermitExpiry"
  ) {
    return formatDate(value);
  }
  return displayValue(value);
}

function isRecordValid(isValid: string | null | undefined): boolean {
  if (!isValid) return false;
  const lower = isValid.toLowerCase();
  return (
    lower.includes("valid") &&
    !lower.includes("in-valid") &&
    !lower.includes("invalid")
  );
}

function DetailSection({
  title,
  rows,
}: {
  title: string;
  rows: DetailRow[];
}) {
  const visible = rows.filter((r) => r.value !== "—");
  if (visible.length === 0) return null;

  return (
    <section className="profile-section card">
      <h3 className="profile-section-title">{title}</h3>
      <ul className="detail-list">
        {visible.map((row) => (
          <li
            key={row.label}
            className={`detail-row ${row.highlight ? "detail-row--highlight" : ""}`}
          >
            <span className="detail-label">{row.label}</span>
            <span className="detail-value">{row.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function EmployeeProfile({
  record,
  photoUrl,
  cardImageUrl,
}: EmployeeProfileProps) {
  const valid = isRecordValid(record.isValid);
  const wp = displayValue(record.workPermitNumber);
  const passport = displayValue(record.passportNumber);
  const name = displayValue(record.fullName);

  const permitRows: DetailRow[] = [
    {
      label: "Permit number",
      value: wp,
      highlight: true,
    },
    { label: "Status", value: displayValue(record.workPermitStateName) },
    { label: "Validity", value: displayValue(record.isValid), highlight: true },
    { label: "Occupation", value: displayValue(record.occupationName) },
    {
      label: "Issued",
      value: formatField("workPermitIssuedDate", record.workPermitIssuedDate),
    },
    {
      label: "Expiry",
      value: formatField("workPermitExpiry", record.workPermitExpiry),
      highlight: true,
    },
  ];

  const employeeRows: DetailRow[] = [
    { label: "Full name", value: name, highlight: true },
    { label: "Gender", value: displayValue(record.gender) },
    {
      label: "Date of birth",
      value: formatField("dateOfBirth", record.dateOfBirth),
    },
    { label: "Passport", value: passport, highlight: true },
    { label: "Nationality", value: displayValue(record.nationality) },
    {
      label: "Country",
      value: displayValue(record.isoAlpha3CountryCode),
    },
    { label: "Contact", value: displayValue(record.contactNumber) },
  ];

  const employerRows: DetailRow[] = [
    {
      label: "Employer",
      value: displayValue(record.employerName),
      highlight: true,
    },
    {
      label: "Employer no.",
      value: displayValue(record.employerNumber),
    },
    {
      label: "Contact",
      value: displayValue(record.employerContactNumber),
    },
  ];

  return (
    <div className="employee-profile">
      <section className="profile-hero card">
        <div className="profile-hero-bg" aria-hidden />
        <div className="profile-hero-body">
          <div className="profile-hero-top">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="profile-hero-photo"
                src={photoUrl}
                alt={`${name}`}
                width={100}
                height={125}
              />
            ) : (
              <div className="profile-hero-photo skeleton" />
            )}
            <div className="profile-hero-text">
              <p className="profile-eyebrow">Employee profile</p>
              <h2 className="profile-name">{name}</h2>
              <p className="profile-role">
                {displayValue(record.occupationName)}
              </p>
              <div className="profile-chips">
                <span className="profile-chip profile-chip--accent">
                  <span className="profile-chip-label">Passport</span>
                  <span className="profile-chip-value">{passport}</span>
                </span>
                <span className="profile-chip profile-chip--accent">
                  <span className="profile-chip-label">Permit</span>
                  <span className="profile-chip-value">{wp}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="profile-hero-meta">
            <span
              className={`profile-pill ${valid ? "profile-pill--valid" : "profile-pill--invalid"}`}
            >
              {displayValue(record.isValid)}
            </span>
            <span className="profile-pill profile-pill--muted">
              {displayValue(record.workPermitStateName)}
            </span>
            <span className="profile-pill profile-pill--muted">
              {displayValue(record.nationality)}
            </span>
          </div>

          {record.verifyUrl && (
            <a
              className="profile-verify-btn"
              href={record.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Verify on eGov →
            </a>
          )}
        </div>
      </section>

      <DetailSection title="Work permit" rows={permitRows} />
      <DetailSection title="Personal details" rows={employeeRows} />
      <DetailSection title="Employer" rows={employerRows} />

      <section className="profile-section card permit-card-section">
        <h3 className="profile-section-title">Official permit card</h3>
        <div className="permit-card-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="permit-card-image"
            src={cardImageUrl}
            alt="Work permit card"
          />
        </div>
      </section>
    </div>
  );
}
