"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";


const STEPS = [
  {
    title: "Willkommen in Powrbook!",
    text: "Powrbook ist dein persönlicher Workspace für Struktur, Wissen und Fortschritt.",
  },
  {
    title: "Alles beginnt mit Powrbooks",
    text: "Organisiere Arbeit, Ideen oder Planung in Powrbooks – so behältst du den Überblick.",
  },
  {
    title: "Inhalte frei strukturieren",
    text: "Erstelle Inhalte so, wie du arbeitest. Powrbook passt sich dir an – nicht umgekehrt.",
  },
  {
    title: "Dein Workspace",
    text: "Starte einfach. Erweitere deinen Workspace, wann immer du bereit bist.",
  },
  {
    title: "Bereit loszulegen?",
    text: "Tauche ein in Powrbook und entdecke, wie einfach Produktivität sein kann!",
  },
];

export default function OnboardingModal() {
  const params = useSearchParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const shouldShow =
      params.get("onboarding") === "1" &&
      !localStorage.getItem("powrbook:onboarding_done");

    if (!shouldShow) return;

    setOpen(true);

    // URL sauber machen (wichtig!)
    const url = new URL(window.location.href);
    url.searchParams.delete("onboarding");
    router.replace(url.pathname + url.search, { scroll: false });
  }, [params, router]);

  function finish() {
    localStorage.setItem("powrbook:onboarding_done", "1");
    setOpen(false);
  }

  function next() {
    if (step === STEPS.length - 1) finish();
    else setStep((s) => s + 1);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && finish()}>
      <DialogContent className="max-w-md">
        <VisuallyHidden>
          <DialogTitle>{STEPS[step].title}</DialogTitle>
        </VisuallyHidden>

        <div className="space-y-4">
          <div className="text-xs text-muted-foreground">
            Schritt {step + 1} / {STEPS.length}
          </div>

          <h2 className="text-xl font-semibold">{STEPS[step].title}</h2>

          <p className="text-sm text-muted-foreground">{STEPS[step].text}</p>

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={finish}>
              Überspringen
            </Button>

            <Button onClick={next}>
              {step === STEPS.length - 1 ? "Fertig" : "Weiter"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
