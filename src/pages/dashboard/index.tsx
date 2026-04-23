import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { Shield, ShieldOff } from "lucide-react";
import { enable2FA, verify2FASetup, disable2FA } from "@/queries/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/store";
import { Navbar } from "@/components/navbar";
import { useProfile } from "@/hooks/useprofile";
import OtpDialog from "@/components/otp-dialog";

export default function Dashboard() {
  // const navigate = useNavigate();
  const { twoFAEnabled, setTwoFAEnabled, logout } = useAuthStore();
  // At the top of your Dashboard component, add:
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // If you have a profile edit modal, wire this up; otherwise a no-op is fine for now:
  const handleOpenEdit = () => {
    // open your edit profile modal here
  };
  const [loading, setLoading] = useState(false);
  // Enable 2FA flow — two steps
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  // const [enableStep, setEnableStep] = useState<"qr" | "otp">("qr");

  const { profile } = useProfile(); // ← get profile data for Navbar
  // Disable 2FA flow
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showVerifyOtp, setShowVerifyOtp] = useState(false);
  // Shared
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // const handleLogout = () => {
  //   logout();
  //   navigate("/", { replace: true });
  // };

  // Step 1: call POST /auth/enable-2fa to get the QR code
  const handleOpenEnable = async () => {
    setError("");
    setCode("");
    // setEnableStep("qr");
    try {
      const res = await enable2FA();
      setCode(res.data.qrCode || "");
      setShowEnableDialog(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to start 2FA setup.";
      setError(msg);
    }
  };

  // Step 2: call POST /auth/verify-2fa-setup with the code from authenticator app

  const handleDisable = async () => {
    setError("");
    setLoading(true);
    try {
      await disable2FA();
      setTwoFAEnabled(false); // ← correctly inside the function
      setShowDisableDialog(false);
      setSuccess("Two-factor authentication disabled.");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to disable 2FA.";
      setError(msg);
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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      {profile && (
        <Navbar
          profile={profile}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          openEdit={handleOpenEdit}
        />
      )}
      {/* Main content */}
      <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col items-center gap-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

        {success && (
          <div className="w-full bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm text-center">
            {success}
          </div>
        )}

        {error && !showEnableDialog && !showDisableDialog && (
          <div className="w-full bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm text-center">
            {error}
          </div>
        )}

        {/* 2FA Card */}
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center gap-5">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${twoFAEnabled ? "bg-green-50" : "bg-gray-100"}`}
          >
            {twoFAEnabled ? (
              <Shield className="w-8 h-8 text-green-600" />
            ) : (
              <ShieldOff className="w-8 h-8 text-gray-400" />
            )}
          </div>

          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Two-Factor Authentication
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {twoFAEnabled
                ? "Your account is protected with 2FA."
                : "Add an extra layer of security to your account."}
            </p>
          </div>

          <div
            className={`text-xs font-medium px-3 py-1 rounded-full ${twoFAEnabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
          >
            {twoFAEnabled ? "Enabled" : "Disabled"}
          </div>

          {twoFAEnabled ? (
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-500 hover:bg-red-50"
              onClick={() => {
                setError("");
                setShowDisableDialog(true);
              }}
            >
              Disable 2FA
            </Button>
          ) : (
            <Button className="w-full" onClick={handleOpenEnable}>
              Enable 2FA
            </Button>
          )}
        </div>
      </div>

      {/* Enable 2FA Dialog — QR step only */}
      <Dialog open={showEnableDialog} onOpenChange={closeEnableDialog}>
        <DialogContent className="max-w-sm rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              Scan QR Code
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {code ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-center text-muted-foreground">
                  Scan this QR code with <strong>Google Authenticator</strong>
                </p>
                <img
                  src={code}
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
              disabled={!code}
            >
              I've scanned it →
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* OTP step — uses global OtpDialog */}
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

      {/* Disable 2FA Dialog */}
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
    </div>
  );
}
