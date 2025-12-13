import { useState } from "react";

type Options = {
  onSuccess?: () => void;
};

export function use2FASetup({ onSuccess }: Options = {}) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startSetup() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/2fa", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setQrCode(data.qrCode);
      setSecret(data.secret);
    } catch {
      setError("2FA konnte nicht gestartet werden.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/2fa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) throw new Error(await res.text());

      // ✅ ERFOLG
      onSuccess?.();
    } catch {
      setError("Code ungültig.");
    } finally {
      setLoading(false);
    }
  }

  return {
    qrCode,
    secret,
    code,
    setCode,
    loading,
    error,
    startSetup,
    verifyCode,
  };
}
