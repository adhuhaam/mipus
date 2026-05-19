"use client";

import { useRef, useState } from "react";
import { scanDocumentForPermitFields } from "@/lib/ocr-scan-browser";

type DocumentScanProps = {
  disabled?: boolean;
  onExtracted: (fields: {
    workPermitNumber: string;
    passportNumber: string;
  }) => void;
  onPartial?: (fields: {
    workPermitNumber?: string;
    passportNumber?: string;
  }) => void;
  onError: (message: string) => void;
};

export function DocumentScan({
  disabled,
  onExtracted,
  onPartial,
  onError,
}: DocumentScanProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  async function handleFile(file: File | undefined) {
    if (!file || disabled || scanning) return;

    if (!file.type.startsWith("image/")) {
      onError("Please choose a photo (JPG or PNG).");
      return;
    }

    setScanning(true);
    setScanStatus("Starting…");
    setProgress(0);

    try {
      const fields = await scanDocumentForPermitFields(file, (p) => {
        setScanStatus(p.status);
        setProgress(p.progress);
      });

      const wp = fields.workPermitNumber?.trim() ?? "";
      const pass = fields.passportNumber?.trim() ?? "";

      if (wp && pass) {
        onExtracted({ workPermitNumber: wp, passportNumber: pass });
        setScanStatus("Found both numbers — searching…");
      } else if (wp || pass) {
        onPartial?.({
          ...(wp ? { workPermitNumber: wp } : {}),
          ...(pass ? { passportNumber: pass } : {}),
        });
        onError(
          "Could only read part of the document. Check the fields and try again, or use a clearer photo.",
        );
        setScanStatus(null);
      } else {
        onError(
          "Could not find a work permit (WP…) or passport number. Try a clearer, well-lit photo.",
        );
        setScanStatus(null);
      }
    } catch (err) {
      const fallback = "Scan failed. Try again or enter numbers manually.";
      if (err instanceof Error && err.message && err.message !== fallback) {
        onError(err.message);
      } else {
        onError(fallback);
      }
      setScanStatus(null);
    } finally {
      setScanning(false);
      if (cameraRef.current) cameraRef.current.value = "";
      if (uploadRef.current) uploadRef.current.value = "";
    }
  }

  return (
    <div className="scan-block">
      <p className="scan-label">Scan document</p>
      <p className="scan-hint">
        Photo of permit card, passport, or any document showing both numbers
      </p>

      <div className="scan-actions" role="group" aria-label="Scan document">
        <button
          type="button"
          className="scan-btn"
          disabled={disabled || scanning}
          onClick={() => cameraRef.current?.click()}
          aria-label="Take photo with camera"
        >
          <CameraIcon />
          <span>Camera</span>
        </button>
        <button
          type="button"
          className="scan-btn"
          disabled={disabled || scanning}
          onClick={() => uploadRef.current?.click()}
          aria-label="Upload image from gallery"
        >
          <UploadIcon />
          <span>Upload</span>
        </button>
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="scan-input-hidden"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        className="scan-input-hidden"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      {scanning && (
        <div className="scan-progress" role="status" aria-live="polite">
          <div className="scan-progress-bar">
            <div
              className="scan-progress-fill"
              style={{ width: `${Math.max(progress, 8)}%` }}
            />
          </div>
          <span className="scan-progress-text">
            {scanStatus ?? "Scanning…"}
            {progress > 0 ? ` ${progress}%` : ""}
          </span>
        </div>
      )}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
