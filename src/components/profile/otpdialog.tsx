import { useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  pendingEmail: string;
  onSuccess: () => void;
}

export default function OtpDialog({
  open,
  onClose,
  pendingEmail,
  onSuccess,
}: Props) {
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/verify-updated-email", {
        email: pendingEmail,
        code: otpCode,
      });
      onSuccess();
      setOtpCode("");
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-base font-semibold">
            Verify New Email
          </DialogTitle>

          <p className="text-xs text-gray-400">
            We sent a verification code to{" "}
            <span className="text-gray-800 font-medium">{pendingEmail}</span>
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">
              Enter OTP Code
            </label>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="text-center text-lg tracking-[0.5em] h-11"
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <Button
            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white"
            onClick={handleVerify}
            disabled={loading || otpCode.length < 6}
          >
            {loading ? "Verifying..." : "Verify & Save"}
          </Button>
          <button
            onClick={() => {
              onClose();
              setOtpCode("");
            }}
            className="w-full text-xs text-gray-400 hover:text-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
