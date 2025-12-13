"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BackupCodesDialog({ open, onOpenChange }: Props) {
  const [codes, setCodes] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setCodes(null);
      setConfirmed(false);
      setError("");
    }
  }, [open]);

  async function generateCodes() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/2fa/backup-codes", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      setCodes(data.codes);
    } catch {
      setError("Backup-Codes konnten nicht generiert werden.");
    } finally {
      setLoading(false);
    }
  }

  function copyCodes() {
    if (!codes) return;
    navigator.clipboard.writeText(codes.join("\n"));
  }

  function downloadCodes() {
    if (!codes) return;

    const blob = new Blob([codes.join("\n")], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "powrbook-backup-codes.txt";
    a.click();

    URL.revokeObjectURL(url);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">
            Backup-Codes
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {!codes && (
          <>
            <p className="text-sm text-gray-600">
              Backup-Codes ermöglichen dir den Zugriff auf dein Konto,
              falls du keinen Zugriff auf deine Authenticator-App hast.
            </p>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              ⚠️ Diese Codes werden nur einmal angezeigt.
              Speichere sie an einem sicheren Ort.
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-5 flex justify-end">
              <button
                onClick={generateCodes}
                disabled={loading}
                className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50"
              >
                {loading ? "Erstelle…" : "Backup-Codes generieren"}
              </button>
            </div>
          </>
        )}

        {codes && (
          <>
            <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 font-mono text-sm">
              {codes.map((c) => (
                <div
                  key={c}
                  className="rounded-md bg-white px-2 py-1 text-center"
                >
                  {c}
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={copyCodes}
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
              >
                Kopieren
              </button>
              <button
                onClick={downloadCodes}
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
              >
                Download
              </button>
            </div>

            <label className="mt-4 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <span>
                Ich habe die Backup-Codes sicher gespeichert.
              </span>
            </label>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => onOpenChange(false)}
                disabled={!confirmed}
                className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-40"
              >
                Fertig
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
