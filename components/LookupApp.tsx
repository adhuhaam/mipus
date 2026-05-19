"use client";

import { FormEvent, useCallback, useState } from "react";
import { DocumentScan } from "@/components/DocumentScan";
import { EmployeeProfile } from "@/components/EmployeeProfile";
import type { WorkPermitRecord } from "@/types/work-permit";

interface LookupPayload {
  record: WorkPermitRecord;
  photoIds: { photoId: string; serviceId: string } | null;
  assets: {
    photo: string | null;
    card: string;
  };
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
          <EmployeeProfile
            record={result.record}
            photoUrl={result.assets.photo}
            cardImageUrl={result.assets.card}
          />
        </div>
      )}
    </div>
  );
}
