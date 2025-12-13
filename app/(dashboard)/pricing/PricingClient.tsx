"use client";

import { useEffect, useState } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { getSession } from "@/lib/session";
import Link from "next/link";

type Billing = "monthly" | "yearly";
type PlanId = "free" | "plus" | "pro";

const UPGRADE_URL = "/billing/upgrade";
const SHOP_URL = "/shop";

function Check() {
  return <CheckIcon className="h-5 w-5 text-black mx-auto" />;
}

function X() {
  return <XMarkIcon className="h-5 w-5 text-gray-300 mx-auto" />;
}

export default function PricingClient({ userId }: { userId: string }) {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");
  const [loadingPlan, setLoadingPlan] = useState(true);

  async function handlePlanAction(targetPlan: PlanId, productId?: string) {
    // Hat bereits ein Abo? → immer Portal
    if (currentPlan !== "free") {
      await handleManage();
      return;
    }

    // Free → Checkout
    if (productId) {
      window.location.href = getSubscribeUrl({
        userId,
        productId,
      });
    }
  }

  useEffect(() => {
    async function loadBilling() {
      try {
        const res = await fetch("/api/billing/status");
        const data = await res.json();

        if (data?.plan === "prod_TQfUQ2VcepgPYh") {
          setCurrentPlan("plus");
        } else if (data?.plan === "prod_TQfUgamp77Sjbz") {
          setCurrentPlan("pro");
        } else {
          setCurrentPlan("free");
        }
      } catch (e) {
        console.error("Failed to load billing status", e);
        setCurrentPlan("free");
      } finally {
        setLoadingPlan(false);
      }
    }

    loadBilling();
  }, [userId]);

  // DEMO – später aus Backend
  const BILLING_BASE_URL = "https://billing.powrbook.com/subscribe";

  function getSubscribeUrl(params: { userId: string; productId: string }) {
    const { userId, productId } = params;

    return `${BILLING_BASE_URL}?userId=${encodeURIComponent(
      userId
    )}&product=${encodeURIComponent(productId)}&success=${encodeURIComponent(
      "https://my.powerbook.at/pricing"
    )}`;
  }

async function handleManage() {
  const res = await fetch("/api/billing/portal");
  const data = await res.json();

  if (data?.url) {
    window.location.href = data.url;
  } else {
    alert("Abo-Verwaltung konnte nicht geöffnet werden.");
  }
}


  return (
    <div className="mx-auto max-w-7xl px-4 pb-20">
      {/* HEADER */}
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Faire Preise</h1>
        <p className="mt-2 text-sm text-gray-500">
          Das physische Powrbook ist optional im Shop erhältlich.
        </p>

        {/* BILLING TOGGLE */}
        <div className="mt-6 inline-flex items-center rounded-full border bg-white p-1 shadow-sm">
          <button
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              billing === "monthly"
                ? "bg-black text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Monatlich
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              billing === "yearly"
                ? "bg-black text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Jährlich (~20 % günstiger)
          </button>
        </div>

        <p className="mt-2 text-xs text-gray-400">
          {billing === "monthly"
            ? "Monatlich, jederzeit kündbar"
            : "Jahresabo – spare ~20 %"}
        </p>
      </header>

      {/* PLANS */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* FREE */}
        <PlanCard
          title="Free"
          subtitle="Für den Einstieg"
          price="0 €"
          priceNote="/ Monat"
          features={[
            "2 Powrbooks, 10 Seiten / Powrbook",
            "120 Scans / Monat (Basis-OCR)",
            "1 Gerät + Web",
            "EU-Cloud-Sync: 500 MB",
            "Export: PDF & PNG",
            "Basis-Suche, Tags & Ordner",
          ]}
          current={currentPlan === "free"}
          cta={currentPlan === "free" ? "Aktueller Plan" : "Abo kündigen →"}
          onClick={currentPlan !== "free" ? handleManage : undefined}
        />

        {/* PLUS */}
        <PlanCard
          title="Plus"
          subtitle="Die beliebteste Wahl"
          price={billing === "monthly" ? "€6.99" : "€59"}
          priceNote={billing === "monthly" ? "/ Monat" : "/ Jahr"}
          subPrice={
            billing === "yearly" ? "Entspricht ~€4.92 / Monat" : undefined
          }
          features={[
            "Unbegrenzte Powrbooks",
            "1.500 Scans / Monat mit Smart-Scan",
            "3 Geräte + Web",
            "EU-Cloud-Sync: 10 GB",
            "OCR DE/EN + Volltextsuche",
            "Versionierung (30 Tage)",
            "Vorlagen & Erinnerungen",
            "E-Mail-to-Powrbook",
          ]}
          current={currentPlan === "plus"}
          badge={currentPlan === "plus" ? "Aktueller Plan" : "Beliebt"}
          highlight={currentPlan === "plus"}
          cta={
            currentPlan === "plus"
              ? "Plan verwalten →"
              : currentPlan === "free"
              ? "Jetzt starten →"
              : "Upgrade →"
          }
          onClick={() => handlePlanAction("plus", "prod_TQfUQ2VcepgPYh")}
        />

        {/* PRO */}
        <PlanCard
          title="Pro"
          subtitle="Für Power-User"
          price={billing === "monthly" ? "€11.99" : "€99"}
          priceNote={billing === "monthly" ? "/ Monat" : "/ Jahr"}
          subPrice={
            billing === "yearly" ? "Entspricht ~€8.25 / Monat" : undefined
          }
          features={[
            "Unbegrenzt, Fair-Use Scans",
            "5 Geräte + Web",
            "EU-Cloud-Sync: 100 GB",
            "Erweitertes OCR (mehrsprachig, Handschrift*)",
            "AI-Assist: Zusammenfassen & To-dos",
            "Autom. Backups (90 Tage)",
            "PDF-Import & Auto-Aufteilung",
            "Passcode / Face- / Touch-Sperre",
          ]}
          current={currentPlan === "pro"}
          badge={currentPlan === "pro" ? "Aktueller Plan" : undefined}
          highlight={currentPlan === "pro"}
          cta={
            currentPlan === "pro"
              ? "Plan verwalten →"
              : currentPlan === "free"
              ? "Jetzt starten →"
              : "Upgrade →"
          }
          onClick={() => handlePlanAction("pro", "prod_TQfUgamp77Sjbz")}
        />
      </div>

      {/* PRICING COMPARISON */}
      <section className="mt-20">
        <h2 className="text-center text-xl font-semibold">
          Pläne im Vergleich
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Alle Features auf einen Blick – fair & transparent
        </p>

        <div className="mt-8 overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-4 text-left font-medium">Feature</th>
                <th className="px-4 py-4 text-center font-medium">Free</th>
                <th className="px-4 py-4 text-center font-medium">
                  Plus
                  <span className="ml-2 rounded-full bg-black px-2 py-0.5 text-xs text-white">
                    Beliebt
                  </span>
                </th>
                <th className="px-4 py-4 text-center font-medium">Pro</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {/* BASICS */}
              <tr className="bg-gray-50/50">
                <td colSpan={4} className="px-4 py-3 font-medium text-gray-700">
                  Grundlagen
                </td>
              </tr>

              <Row
                label="Powrbooks"
                free="2"
                plus="Unbegrenzt"
                pro="Unbegrenzt"
              />
              <Row
                label="Seiten / Powrbook"
                free="10"
                plus="Unbegrenzt"
                pro="Unbegrenzt"
              />
              <Row label="Geräte + Web" free="1" plus="3" pro="5" />
              <Row
                label="Cloud-Speicher"
                free="500 MB"
                plus="10 GB"
                pro="100 GB"
              />

              {/* SCANS & OCR */}
              <tr className="bg-gray-50/50">
                <td colSpan={4} className="px-4 py-3 font-medium text-gray-700">
                  Scans & OCR
                </td>
              </tr>

              <Row
                label="Scans / Monat"
                free="120"
                plus="1.500"
                pro="Fair-Use"
              />
              <Row
                label="Smart-Scan"
                free={<X />}
                plus={<Check />}
                pro={<Check />}
              />
              <Row
                label="OCR DE / EN"
                free={<Check />}
                plus={<Check />}
                pro={<Check />}
              />
              <Row
                label="Mehrsprachig & Handschrift"
                free={<X />}
                plus={<X />}
                pro={<Check />}
              />

              {/* EXPORT & FLOW */}
              <tr className="bg-gray-50/50">
                <td colSpan={4} className="px-4 py-3 font-medium text-gray-700">
                  Export & Workflow
                </td>
              </tr>

              <Row
                label="PDF Export"
                free={<Check />}
                plus={<Check />}
                pro={<Check />}
              />
              <Row
                label="PNG Export"
                free={<Check />}
                plus={<Check />}
                pro={<Check />}
              />
              <Row
                label="PDF Import"
                free={<X />}
                plus={<X />}
                pro={<Check />}
              />
              <Row
                label="Auto-Aufteilung"
                free={<X />}
                plus={<X />}
                pro={<Check />}
              />
              <Row
                label="E-Mail-to-Powrbook"
                free={<X />}
                plus={<Check />}
                pro={<Check />}
              />

              {/* VERSIONIERUNG & BACKUP */}
              <tr className="bg-gray-50/50">
                <td colSpan={4} className="px-4 py-3 font-medium text-gray-700">
                  Sicherheit & Historie
                </td>
              </tr>

              <Row
                label="Versionierung"
                free={<X />}
                plus="30 Tage"
                pro="90 Tage"
              />
              <Row
                label="Automatische Backups"
                free={<X />}
                plus={<X />}
                pro="90 Tage"
              />
              <Row
                label="Passcode / Face / Touch"
                free={<X />}
                plus={<X />}
                pro={<Check />}
              />

              {/* AI */}
              <tr className="bg-gray-50/50">
                <td colSpan={4} className="px-4 py-3 font-medium text-gray-700">
                  KI-Features
                </td>
              </tr>

              <Row
                label="AI-Zusammenfassungen"
                free={<X />}
                plus={<X />}
                pro={<Check />}
              />
              <Row
                label="AI-To-dos"
                free={<X />}
                plus={<X />}
                pro={<Check />}
              />
            </tbody>
          </table>
        </div>
      </section>

      {/* PHYSICAL PRODUCT */}
      <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <span className="inline-flex items-center rounded-full bg-black px-3 py-1 text-xs text-white">
            Empfehlung
          </span>
          <h3 className="mt-2 text-lg font-semibold">
            Physisches Powrbook dazu kaufen – für den besten Flow
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Hard- oder Soft-Cover, A5/A4. Perfekt kombiniert mit
            Online-Powrbooks: scannen, synchronisieren und überall
            weiterarbeiten.
          </p>
        </div>
        <a
          href={SHOP_URL}
          className="rounded-xl bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-900"
        >
          Zum Shop →
        </a>
      </div>

      {/* STUDENT NOTE */}
      <div className="mt-6 rounded-xl border bg-white p-4 text-sm text-gray-600">
        🎓 Studierende und Schüler:innen erhalten <strong>20 % Rabatt</strong>{" "}
        auf Plus & Pro. <Link href="mailto:info@powrbook.com" className="underline">Bitte kontaktiert uns mit einem gültigen Nachweis.</Link>
      </div>
    </div>
  );
}

function Row({
  label,
  free,
  plus,
  pro,
}: {
  label: string;
  free: React.ReactNode;
  plus: React.ReactNode;
  pro: React.ReactNode;
}) {
  return (
    <tr>
      <td className="px-4 py-3 text-gray-700">{label}</td>
      <td className="px-4 py-3 text-center">{free}</td>
      <td className="px-4 py-3 text-center font-medium">{plus}</td>
      <td className="px-4 py-3 text-center">{pro}</td>
    </tr>
  );
}

/* -------------------------------------------------- */
/* COMPONENTS                                         */
/* -------------------------------------------------- */

function PlanCard(props: {
  title: string;
  subtitle: string;
  price: string;
  priceNote: string;
  subPrice?: string;
  features: string[];
  cta: string;
  href?: string;
  onClick?: () => void;
  current?: boolean;
  highlight?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border bg-white p-6 shadow-sm ${
        props.highlight ? "border-black ring-1 ring-black" : "border-gray-200"
      }`}
    >
      {props.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-black px-3 py-1 text-xs text-white">
          {props.badge}
        </div>
      )}

      <h3 className="text-lg font-semibold">{props.title}</h3>
      <p className="text-sm text-gray-500">{props.subtitle}</p>

      <div className="mt-4">
        <span className="text-3xl font-bold">{props.price}</span>{" "}
        <span className="text-sm text-gray-500">{props.priceNote}</span>
        {props.subPrice && (
          <div className="mt-1 text-xs text-gray-400">{props.subPrice}</div>
        )}
      </div>

      <ul className="mt-4 space-y-2">
        {props.features.map((f) => (
          <li key={f} className="flex gap-2 text-sm text-gray-700">
            <CheckIcon className="mt-0.5 h-4 w-4 text-black" />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      {props.onClick ? (
        <button
          onClick={props.onClick}
          className={`mt-6 w-full rounded-xl px-4 py-2 text-sm font-medium transition ${
            props.current
              ? "border border-black text-black hover:bg-gray-50"
              : "bg-black text-white hover:bg-gray-900"
          }`}
        >
          {props.cta}
        </button>
      ) : props.href ? (
        <a
          href={props.href}
          className="mt-6 block w-full rounded-xl bg-black px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-900"
        >
          {props.cta}
        </a>
      ) : null}
    </div>
  );
}
