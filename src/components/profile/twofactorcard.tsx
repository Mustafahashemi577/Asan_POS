// components/profile/TwoFactorCard.tsx
import OtpDialog from "@/components/otp-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/store";
import { disable2FA, enable2FA, verify2FASetup } from "@/queries/auth";
import { Shield, ShieldOff } from "lucide-react";
import { useState } from "react";

export default function TwoFactorCard() {
  const { twoFAEnabled, setTwoFAEnabled } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Enable flow
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [showVerifyOtp, setShowVerifyOtp] = useState(false);
  const [qrCode, setQrCode] = useState("");

  // Disable flow
  const [showDisableDialog, setShowDisableDialog] = useState(false);

  // Shared
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleOpenEnable = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await enable2FA();
      setQrCode(res.data.qrCode || "");
      setShowEnableDialog(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to start 2FA setup.");
    }
  };

  const handleDisable = async () => {
    setError("");
    setLoading(true);
    try {
      await disable2FA();
      setTwoFAEnabled(false);
      setShowDisableDialog(false);
      setSuccess("Two-factor authentication disabled.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to disable 2FA.");
    } finally {
      setLoading(false);
    }
  };

  const closeEnableDialog = () => {
    setShowEnableDialog(false);
    setError("");
  };

  const closeDisableDialog = () => {
    setShowDisableDialog(false);
    setError("");
  };

  return (
    <>
      {/* ── Card ── */}
      <div className="bg-bg-dark w-full rounded-2xl p-4 sm:p-6">
        {/* Section heading */}
        <div className="mb-4">
          <h2 className="text-white text-base font-semibold">Security</h2>
          <p className="text-gray-400 text-xs mt-0.5">
            Manage your account security settings
          </p>
        </div>

        {/* 2FA row */}
        <div className="bg-white/10 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left — icon + text */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                twoFAEnabled ? "bg-green-400/20" : "bg-white/10"
              }`}
            >
              {twoFAEnabled ? (
                <Shield className="w-5 h-5 text-green-400" />
              ) : (
                <ShieldOff className="w-5 h-5 text-gray-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="text-white text-sm font-medium">
                  Two-Factor Authentication
                </p>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    twoFAEnabled
                      ? "bg-green-400/20 text-green-400"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  {twoFAEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-0.5">
                {twoFAEnabled
                  ? "Your account is protected with 2FA."
                  : "Add an extra layer of security to your account."}
              </p>
            </div>
          </div>

          {/* Right — action button */}
          {twoFAEnabled ? (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-red-400/40 text-red-400 hover:bg-red-400/10 hover:text-red-300 bg-transparent"
              onClick={() => {
                setError("");
                setSuccess("");
                setShowDisableDialog(true);
              }}
            >
              Disable 2FA
            </Button>
          ) : (
            <Button
              size="sm"
              className="shrink-0 bg-blue-500 hover:bg-blue-600 text-white border-0"
              onClick={handleOpenEnable}
            >
              Enable 2FA
            </Button>
          )}
        </div>

        {/* Feedback messages */}
        {success && <p className="text-green-400 text-xs mt-3">{success}</p>}
        {error && !showEnableDialog && !showDisableDialog && (
          <p className="text-red-400 text-xs mt-3">{error}</p>
        )}
      </div>

      {/* ── Enable: QR step ── */}
      <Dialog open={showEnableDialog} onOpenChange={closeEnableDialog}>
        <DialogContent className="max-w-sm rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              Scan QR Code
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {qrCode ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-center text-muted-foreground">
                  Scan this QR code with <strong>Google Authenticator</strong>
                </p>
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="w-44 h-44 rounded-xl border border-gray-100"
                />
                <p className="text-xs text-center text-gray-400">
                  The QR code expires in 5 minutes
                </p>
              </div>
            ) : (
              <p className="text-center text-sm text-red-500">
                Failed to load QR code.
              </p>
            )}
            <Button
              className="w-full"
              onClick={() => {
                setShowEnableDialog(false);
                setShowVerifyOtp(true);
              }}
              disabled={!qrCode}
            >
              I've scanned it →
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Enable: OTP verification step ── */}
      <OtpDialog
        open={showVerifyOtp}
        onClose={() => setShowVerifyOtp(false)}
        title="Confirm 2FA Setup"
        description="Enter the 6-digit code from your authenticator app"
        onVerify={async (code) => {
          await verify2FASetup(code);
          setTwoFAEnabled(true);
          setShowVerifyOtp(false);
          setSuccess("Two-factor authentication enabled!");
        }}
      />

      {/* ── Disable: confirmation dialog ── */}
      <Dialog open={showDisableDialog} onOpenChange={closeDisableDialog}>
        <DialogContent className="max-w-sm rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              Disable 2FA
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Are you sure you want to disable two-factor authentication? Your
              account will be less secure.
            </p>
            {error && (
              <p className="text-center text-sm text-red-500">{error}</p>
            )}
            <Button
              onClick={handleDisable}
              disabled={loading}
              variant="outline"
              className="w-full border-red-200 text-red-500 hover:bg-red-50"
            >
              {loading ? "Disabling..." : "Yes, disable 2FA"}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={closeDisableDialog}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
