"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RegisterDecision({ next }: { next: string }) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <Image
        alt="Powrbook"
        src="/images/logos/logo-new-black.png"
        width={160}
        height={80}
        priority
        className="mb-8 h-20 w-auto"
      />
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        Hast du bereits ein Konto?
      </h1>
      <p className="text-gray-600 mb-8">Bitte wähle aus, um fortzufahren.</p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() =>
            router.replace(`/login?next=${encodeURIComponent(next)}&step=login`)
          }
          className="rounded-md bg-black text-white px-6 py-2 font-semibold hover:bg-black/90 transition"
        >
          Ja, anmelden
        </button>
        <button
          onClick={() =>
            router.replace(
              `/register?next=${encodeURIComponent(next)}&step=register`
            )
          }
          className="rounded-md border border-gray-300 text-gray-800 px-6 py-2 font-semibold hover:bg-gray-50 transition"
        >
          Nein, Konto erstellen
        </button>
      </div>
    </div>
  );
}
