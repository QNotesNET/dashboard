"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const SESSION_KEY = "pw_mobile_app_hint_dismissed";

export default function MobileAppHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // bereits in dieser Session dismissed?
    if (sessionStorage.getItem(SESSION_KEY) === "true") return;

    // Mobile / small screens (Tailwind sm < 640px)
    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    if (isMobile) setVisible(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 mb-28 mr-8 md:hidden">
      <div className="relative rounded-2xl border bg-background shadow-xl p-4">
        {/* Close icon (optional nice touch) */}
        {/* <button
          onClick={dismiss}
          className="absolute right-3 top-3 text-muted-foreground"
        >
          <X size={18} />
        </button> */}

        <div className="flex flex-col gap-3">
          <p className="text-sm text-foreground">
            Nutze unsere <span className="font-semibold">Mobile App</span>, um
            Powrbook am Handy optimal verwenden zu können.
          </p>

          <div className="flex flex-col gap-2">
            <Link
              href="https://powrbook.com/mobile"
              className="flex-1 rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 text-center"
            >
              Download
            </Link>

            <button
              onClick={dismiss}
              className="flex-1 rounded-lg border text-sm py-2"
            >
              Nicht jetzt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
