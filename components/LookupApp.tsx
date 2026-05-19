"use client";

import { FormEvent, useCallback, useState } from "react";
import { DocumentScan } from "@/components/DocumentScan";
import type { WorkPermitRecord } from "@/types/work-permit";
import { displayValue, formatDate } from "@/lib/format";

interface LookupPayload {
  record: WorkPermitRecord;
  photoIds: { photoId: string; serviceId: string } | null;
  assets: {
    photo: string | null;
    card: string;
  };
}

const DETAIL_SECTIONS: {
  title: string;
  fields: { key: keyof WorkPermitRecord; label: string }[];
}[] = [
  {
    title: "Work permit",
    fields: [
      { key: "workPermitNumber", label: "Permit number" },
      { key: "workPermitStateName", label: "State" },
      { key: "isValid", label: "Validity" },
      { key: "occupationName", label: "Occupation" },
      { key: "workPermitIssuedDate", label: "Issued" },
      { key: "workPermitExpiry", label: "Expiry" },
    ],
  },
  {
    title: "Employee",
    fields: [
      { key: "fullName", label: "Full name" },
      { key: "firstName", label: "First name" },
      { key: "middleName", label: "Middle name" },
      { key: "lastName", label: "Last name" },
      { key: "gender", label: "Gender" },
      { key: "dateOfBirth", label: "Date of birth" },
      { key: "passportNumber", label: "Passport" },
      { key: "nationality", label: "Nationality" },
      { key: "isoAlpha3CountryCode", label: "Country code" },
      { key: "contactNumber", label: "Contact" },
    ],
  },
  {
    title: "Employer",
    fields: [
      { key: "employerName", label: "Employer name" },
      { key: "employerNumber", label: "Employer number" },
      { key: "employerContactNumber", label: "Employer contact" },
    ],
  },
];

function formatFieldValue(
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

export function LookupApp() {
  const [workPermitNumber, setWorkPermitNumber] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupPayload | null>(null);

  const performLookup = useCallback(async (wp: string, pass: string) => {
    const wpTrim = wp.trim();
    const passTrim = pass.trim();

    if (!wpTrim || !passTrim) {
      setError("Work permit number and passport number are both required.");
      return;
    }

    setWorkPermitNumber(wpTrim);
    setPassportNumber(passTrim);
    setLoading(true);
    setError(null);
    setResult(null);

    const params = new URLSearchParams({
      workPermitNumber: wpTrim,
      passportNumber: passTrim,
    });

    try {
      const res = await fetch(`/api/work-permit?${params}`);
      const data = await res.json();

      if (!res.ok) {
        const msg =
          Array.isArray(data.errors) && data.errors.length
            ? data.errors.join(" ")
            : "Lookup failed";
        setError(msg);
        return;
      }

      setResult(data as LookupPayload);
      requestAnimationFrame(() => {
        document.getElementById("lookup-results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void performLookup(workPermitNumber, passportNumber);
  }

  function handleOcrExtracted(fields: {
    workPermitNumber: string;
    passportNumber: string;
  }) {
    setError(null);
    void performLookup(fields.workPermitNumber, fields.passportNumber);
  }

  return (
    <div className="app-shell">
      <header className="header">
        <h1>Xpat Lookup</h1>
        <p>Work permit · photo · card</p>
      </header>

      <section className="card search-card">
        <DocumentScan
          disabled={loading}
          onExtracted={handleOcrExtracted}
          onPartial={(fields) => {
            if (fields.workPermitNumber)
              setWorkPermitNumber(fields.workPermitNumber);
            if (fields.passportNumber) setPassportNumber(fields.passportNumber);
          }}
          onError={setError}
        />

        <div className="search-divider">
          <span>or enter manually</span>
        </div>

        <form className="lookup-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="wp">Work permit number</label>
            <input
              id="wp"
              name="workPermitNumber"
              value={workPermitNumber}
              onChange={(e) => setWorkPermitNumber(e.target.value.toUpperCase())}
              placeholder="WP00595305"
              required
              autoComplete="off"
              autoCapitalize="characters"
              enterKeyHint="next"
              inputMode="text"
            />
          </div>
          <div className="field">
            <label htmlFor="passport">Passport number</label>
            <input
              id="passport"
              name="passportNumber"
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
              placeholder="V7255877"
              required
              autoComplete="off"
              autoCapitalize="characters"
              enterKeyHint="search"
              inputMode="text"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Looking up…" : "Look up permit"}
          </button>
        </form>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}
      </section>

      {result && (
        <div id="lookup-results" className="results">
          <section className="card">
            <div className="profile-row">
              {result.assets.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="profile-photo"
                  src={result.assets.photo}
                  alt={`Photo of ${result.record.fullName ?? "employee"}`}
                  width={112}
                  height={140}
                />
              ) : (
                <div
                  className="profile-photo skeleton"
                  style={{ width: 112, height: 140 }}
                />
              )}
              <div className="profile-head">
                <h2>{displayValue(result.record.fullName)}</h2>
                <p className="meta">
                  {displayValue(result.record.occupationName)}
                </p>
                <p className="meta">
                  {displayValue(result.record.nationality)} ·{" "}
                  {displayValue(result.record.passportNumber)}
                </p>
                <span
                  className={`status-badge ${
                    isRecordValid(result.record.isValid)
                      ? "status-valid"
                      : "status-invalid"
                  }`}
                >
                  {displayValue(result.record.isValid)} ·{" "}
                  {displayValue(result.record.workPermitStateName)}
                </span>
                {result.record.verifyUrl && (
                  <div className="link-row">
                    <a
                      className="link-btn"
                      href={result.record.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open verification (QR)
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>

          {DETAIL_SECTIONS.map((section) => (
            <section key={section.title} className="card">
              <h3 className="section-title">{section.title}</h3>
              <dl className="field-grid">
                {section.fields.map(({ key, label }) => (
                  <div key={key} className="field-item">
                    <dt>{label}</dt>
                    <dd>{formatFieldValue(key, result.record[key])}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}

          <section className="card">
            <h3 className="section-title">Work permit card</h3>
            <div className="card-image-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="card-image"
                src={result.assets.card}
                alt="Work permit card"
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
