import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Shield, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store";

export default function Dashboard() {
    const navigate = useNavigate();
    const { twoFAEnabled, setTwoFAEnabled, logout } = useAuthStore();

    // Enable 2FA flow — two steps
    const [showEnableDialog, setShowEnableDialog] = useState(false);
    const [enableStep, setEnableStep] = useState<"qr" | "verify">("qr");
    const [qrCode, setQrCode] = useState("");

    // Disable 2FA flow
    const [showDisableDialog, setShowDisableDialog] = useState(false);

    // Shared
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    // Step 1: call POST /auth/enable-2fa to get the QR code
    const handleOpenEnable = async () => {
        setError("");
        setCode("");
        setEnableStep("qr");
        try {
            const res = await api.post("/auth/enable-2fa");
            setQrCode(res.data.qrCode || "");
            setShowEnableDialog(true);
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Failed to start 2FA setup.";
            setError(msg);
        }
    };

    // Step 2: call POST /auth/verify-2fa-setup with the code from authenticator app
    const handleConfirmEnable = async () => {
        setError("");
        setLoading(true);
        try {
            await api.post("/auth/verify-2fa-setup", { code });
            setTwoFAEnabled(true);   // ← correctly inside the function
            setShowEnableDialog(false);
            setCode("");
            setSuccess("Two-factor authentication enabled!");
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Invalid code. Please try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        setError("");
        setLoading(true);
        try {
            await api.delete("/auth/disable-2fa");
            setTwoFAEnabled(false);  // ← correctly inside the function
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
        setCode("");
        setError("");
        setEnableStep("qr");
    };

    const closeDisableDialog = () => {
        setShowDisableDialog(false);
        setError("");
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <div className="bg-[#0f1117] text-white px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src="/icons/logo.svg" alt="Logo" className="w-7 h-7" />
                    <span className="font-semibold text-lg">MPOS</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-sm text-gray-400 hover:text-white transition"
                >
                    Logout
                </button>
            </div>

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
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${twoFAEnabled ? "bg-green-50" : "bg-gray-100"}`}>
                        {twoFAEnabled
                            ? <Shield className="w-8 h-8 text-green-600" />
                            : <ShieldOff className="w-8 h-8 text-gray-400" />
                        }
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

                    <div className={`text-xs font-medium px-3 py-1 rounded-full ${twoFAEnabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {twoFAEnabled ? "Enabled" : "Disabled"}
                    </div>

                    {twoFAEnabled ? (
                        <Button
                            variant="outline"
                            className="w-full border-red-200 text-red-500 hover:bg-red-50"
                            onClick={() => { setError(""); setShowDisableDialog(true); }}
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

            {/* Enable 2FA Dialog */}
            <Dialog open={showEnableDialog} onOpenChange={closeEnableDialog}>
                <DialogContent className="max-w-sm rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-semibold">
                            {enableStep === "qr" ? "Scan QR Code" : "Confirm Code"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                        {enableStep === "qr" && (
                            <>
                                {qrCode ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-sm text-center text-muted-foreground">
                                            Scan this QR code with <strong>Google Authenticator</strong>
                                        </p>
                                        <img src={qrCode} alt="QR Code" className="w-44 h-44 rounded-xl border border-gray-100" />
                                        <p className="text-xs text-center text-gray-400">
                                            The QR code expires in 5 minutes
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-center text-sm text-red-500">Failed to load QR code.</p>
                                )}
                                <Button
                                    className="w-full"
                                    onClick={() => { setError(""); setEnableStep("verify"); }}
                                    disabled={!qrCode}
                                >
                                    I've scanned it →
                                </Button>
                            </>
                        )}
                        {enableStep === "verify" && (
                            <>
                                <p className="text-sm text-center text-muted-foreground">
                                    Enter the 6-digit code from your authenticator app
                                </p>
                                <Input
                                    autoFocus
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                                    maxLength={6}
                                    placeholder="123456"
                                    className="text-center text-lg tracking-[0.5em]"
                                />
                                {error && <p className="text-center text-sm text-red-500">{error}</p>}
                                <Button
                                    onClick={handleConfirmEnable}
                                    disabled={loading || code.length !== 6}
                                    className="w-full"
                                >
                                    {loading ? "Confirming..." : "Confirm & Enable"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full text-sm text-gray-400"
                                    onClick={() => { setError(""); setEnableStep("qr"); }}
                                >
                                    ← Back to QR code
                                </Button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

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
                            Are you sure you want to disable two-factor authentication? Your account will be less secure.
                        </p>
                        {error && <p className="text-center text-sm text-red-500">{error}</p>}
                        <Button
                            onClick={handleDisable}
                            disabled={loading}
                            variant="outline"
                            className="w-full border-red-200 text-red-500 hover:bg-red-50"
                        >
                            {loading ? "Disabling..." : "Yes, disable 2FA"}
                        </Button>
                        <Button variant="ghost" className="w-full" onClick={closeDisableDialog}>
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}