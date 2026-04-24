import api from "@/lib/axios";
import type { Verify, Login, Register } from "@/types";

// ─── Auth Functions ───────────────────────────────────────────────────────────

// POST /auth/register
// Registers a new employee + creates store if it doesn't exist
// Returns: { message: "OTP sent to your email..." }
export const register = (payload: Register) =>
  api.post("/auth/register", payload);

export const getMe = () => api.get("/auth/me");

// POST /auth/verify-register
// Verifies the OTP sent to email after registration
// Returns: { message: "Registration successful", employee_id: string }
export const verifyRegister = (payload: Verify) =>
  api.post("/auth/verify-register", payload);

// POST /auth/login
// Logs in an employee
// If 2FA enabled and no code provided → returns { twoFactorRequired: true }
// If 2FA enabled and code provided → returns { token: string }
// If 2FA disabled → returns { token: string }
export const login = (payload: Login) => api.post("/auth/login", payload);

// POST /auth/enable-2fa  (requires JWT)
// Step 1 of 2FA setup — generates QR code
// Returns: { qrCode: string } (base64 image)
export const enable2FA = () => api.post("/auth/enable-2fa");

// POST /auth/verify-2fa-setup  (requires JWT)
// Step 2 of 2FA setup — confirms the code scanned from QR
// Returns: { message: "2FA enabled successfully" }
export const verify2FASetup = (code: string) =>
  api.post("/auth/verify-2fa-setup", { code });

// DELETE /auth/disable-2fa  (requires JWT)
// Disables 2FA for the current employee
// Returns: { message: "2FA disabled successfully" }
export const disable2FA = () => api.delete("/auth/disable-2fa");
