"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDisabled?: () => void;
};

export function Disable2FADialog({
  open,
  onOpenChange,
  onDisabled,
}: Props) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function submit() {
    if (!password) {
      setError("Bitte gib dein Passwort ein.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Fehlgeschlagen");
      }

      setPassword("");
      onOpenChange(false);
      onDisabled?.();
    } catch (err: any) {
      setError(err.message || "Falsches Passwort");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">
            2FA deaktivieren
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600">
          Zur Sicherheit musst du dein Passwort bestätigen,
          um die Zwei-Faktor-Authentifizierung zu deaktivieren.
        </p>

        <div className="mt-4">
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Abbrechen
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? "Prüfe…" : "2FA deaktivieren"}
          </button>
        </div>
      </div>
    </div>
  );
}
