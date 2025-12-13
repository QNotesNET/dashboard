"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const rawNext = sp.get("next") || "/";
  const nextUrl = rawNext.startsWith("/") ? rawNext : "/";

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [show2FA, setShow2FA] = useState(false);

  // 🔐 OTP STATE
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    };

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setErr(data?.error || "Login fehlgeschlagen");
      return;
    }

    if (data?.twoFactorRequired) {
      setShow2FA(true);
      sessionStorage.setItem("2fa_user", data.userId);
      setTimeout(() => inputsRef.current[0]?.focus(), 0);
      return;
    }

    router.replace(nextUrl);
  }

  function onOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function onOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  async function verifyOtp() {
    const code = otp.join("");
    if (code.length !== 6) return;

    const userId = sessionStorage.getItem("2fa_user");
    if (!userId) return setErr("Session abgelaufen");

    const res = await fetch("/api/auth/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, code }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setErr(data?.error || "Code ungültig");
      return;
    }

    router.replace(nextUrl);
  }


  const step = sp.get("step");

  if (nextUrl.includes("/register-notebook") && step !== "login") {
    router.replace(`/login?next=${encodeURIComponent(nextUrl)}`);
    return null;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Linke Hälfte */}
      <div className="flex items-center justify-center px-6 py-12 lg:px-20">
        <div className="w-full max-w-sm">
          <Image
            alt="Powrbook"
            src="/images/logos/logo-new-black.png"
            width={160}
            height={80}
            priority
            className="h-20 w-auto"
          />

          {/* ================= LOGIN VIEW ================= */}
          {!show2FA && (
            <>
              <h1 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">
                Bei Powrbook anmelden
              </h1>

              <p className="mt-2 text-sm text-gray-600">
                Neu hier?{" "}
                <a
                  href={`/register?next=${encodeURIComponent(nextUrl)}`}
                  className="font-semibold text-black hover:text-black"
                >
                  Konto erstellen
                </a>
              </p>

              <form onSubmit={onSubmit} className="mt-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    E-Mail
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="max@mustermann.com"
                    className="mt-2 block w-full rounded-md border-0 bg-white px-3 py-2 ring-1 ring-inset ring-gray-300 focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Passwort
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="mt-2 block w-full rounded-md border-0 bg-white px-3 py-2 ring-1 ring-inset ring-gray-300 focus:ring-2"
                  />
                </div>

                {err && <p className="text-sm text-red-600">{err}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-black px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {loading ? "Lädt…" : "Einloggen"}
                </button>
              </form>
            </>
          )}

          {/* ================= 2FA VIEW ================= */}
          {show2FA && (
            <>
              <h1 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">
                Mit Authenticator-App anmelden
              </h1>

              <p className="mt-2 text-sm text-gray-600">
                Gib den 6-stelligen Code ein.
              </p>

              <div className="mt-8 flex gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputsRef.current[i] = el;
                    }}
                    value={digit}
                    onChange={(e) => onOtpChange(i, e.target.value)}
                    onKeyDown={(e) => onOtpKeyDown(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    className="h-12 w-12 rounded-md border border-gray-300 text-center text-lg font-medium focus:border-black focus:outline-none"
                  />
                ))}
              </div>

              {err && <p className="mt-4 text-sm text-red-600">{err}</p>}

              {/* ✅ NUR BUTTON HINZUGEFÜGT */}
              <button
                onClick={verifyOtp}
                disabled={loading}
                className="mt-6 w-full rounded-md bg-black px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {loading ? "Prüfe…" : "Code bestätigen"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Rechte Hälfte */}
      <div className="relative hidden lg:block">
        <Image
          alt=""
          src="/images/login-image.png"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
