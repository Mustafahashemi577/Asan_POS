import { useState, useEffect } from "react";
import api from "@/lib/axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  email: string;
};

export default function TwoFASetupDialog({ open, onClose, email }: Props) {
  const [qrCode, setQrCode] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);

  useEffect(() => {
    if (open && !qrCode) {
      generateQRCode();
    }
  }, [open, qrCode]);

  const generateQRCode = async () => {
    try {
      setError("");
      setLoading(true);
      setShowCodeInput(false);
      setCode("");

      const res = await api.post("/auth/setup-2fa", {
        email,
      });

      setQrCode(res.data.qrCode);
    } catch (err) {
      setError("Failed to generate 2FA QR code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setError("");
      setLoading(true);

      await api.post("/auth/verify", {
        email,
        code,
      });

      // Success - close dialog and reset
      setQrCode("");
      setCode("");
      setShowCodeInput(false);
      onClose();
    } catch (err: unknown) {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQrCode("");
    setCode("");
    setShowCodeInput(false);
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Enable Two-Factor Authentication
          </DialogTitle>
          <DialogDescription className="text-center">
            {!showCodeInput
              ? "Scan this QR code with your authenticator app"
              : "Enter the 6-digit code from your authenticator app"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!showCodeInput ? (
            <>
              {qrCode && (
                <>
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg border">
                      <img
                        src={qrCode}
                        alt="2FA QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 text-center">
                    Scanned the QR code? Tap the button below when ready.
                  </p>

                  <Button
                    onClick={() => setShowCodeInput(true)}
                    className="w-full"
                    disabled={loading}
                  >
                    I've Scanned the QR Code
                  </Button>
                </>
              )}

              {loading && !qrCode && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Generating QR code...</p>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Enter the 6-digit code from your authenticator app
              </p>

              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                minLength={6}
                placeholder="000000"
                className="text-center text-lg tracking-widest"
                autoFocus
              />

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCodeInput(false);
                    setCode("");
                    setError("");
                  }}
                  className="flex-1"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={code.length !== 6 || loading}
                  className="flex-1"
                >
                  {loading ? "Verifying..." : "Verify & Enable"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
