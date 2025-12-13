"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck } from "lucide-react";
import { use2FASetup } from "@/components/2fa/use2FASetup";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnabled?: () => void; // ✅ jetzt wirklich genutzt
};

export function Enable2FADialog({
  open,
  onOpenChange,
  onEnabled,
}: Props) {
  const {
    qrCode,
    secret,
    code,
    setCode,
    loading,
    error,
    startSetup,
    verifyCode,
  } = use2FASetup({
    onSuccess: () => {
      onEnabled?.();        // 🔥 Parent informieren
      onOpenChange(false); // Dialog schließen
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            Zwei-Faktor-Authentifizierung
          </DialogTitle>
          <DialogDescription>
            Scanne den QR-Code mit deiner Authenticator App.
          </DialogDescription>
        </DialogHeader>

        {!qrCode ? (
          <Button onClick={startSetup} disabled={loading}>
            Einrichtung starten
          </Button>
        ) : (
          <div className="space-y-4">
            <img
              src={qrCode}
              alt="2FA QR Code"
              className="mx-auto size-40 rounded-lg border"
            />

            <div className="break-all text-xs text-gray-500">
              Manuell: <span className="font-mono">{secret}</span>
            </div>

            <Input
              placeholder="6-stelliger Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              className="w-full"
              disabled={loading || code.length !== 6}
              onClick={verifyCode}
            >
              Bestätigen & aktivieren
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
