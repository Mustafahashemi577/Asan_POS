import api from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoginPayload {
  email: string;
  password: string;
  code?: string; // optional 2FA code from Google Authenticator
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  storeName: string;
  storeAddress?: string;
}

interface VerifyPayload {
  email: string;
  code: string;
}

interface UpdateEmployeePayload {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  storeName?: string;
}

// ─── Auth Functions ───────────────────────────────────────────────────────────

// POST /auth/register
// Registers a new employee + creates store if it doesn't exist
// Returns: { message: "OTP sent to your email..." }
export const register = (payload: RegisterPayload) =>
  api.post("/auth/register", payload);

// POST /auth/verify-register
// Verifies the OTP sent to email after registration
// Returns: { message: "Registration successful", employee_id: string }
export const verifyRegister = (payload: VerifyPayload) =>
  api.post("/auth/verify-register", payload);

// POST /auth/login
// Logs in an employee
// If 2FA enabled and no code provided → returns { twoFactorRequired: true }
// If 2FA enabled and code provided → returns { token: string }
// If 2FA disabled → returns { token: string }
export const login = (payload: LoginPayload) =>
  api.post("/auth/login", payload);

// POST /auth/enable-2fa  (requires JWT)
// Step 1 of 2FA setup — generates QR code
// Returns: { qrCode: string } (base64 image)
export const enable2FA = () =>
  api.post("/auth/enable-2fa");

// POST /auth/verify-2fa-setup  (requires JWT)
// Step 2 of 2FA setup — confirms the code scanned from QR
// Returns: { message: "2FA enabled successfully" }
export const verify2FASetup = (code: string) =>
  api.post("/auth/verify-2fa-setup", { code });

// DELETE /auth/disable-2fa  (requires JWT)
// Disables 2FA for the current employee
// Returns: { message: "2FA disabled successfully" }
export const disable2FA = () =>
  api.delete("/auth/disable-2fa");

// PUT /auth/update-employee-info  (requires JWT)
// Updates employee profile — only send fields that changed
// If email changes → backend sends OTP to new email + returns message
// Returns: { message: string }
export const updateEmployeeInfo = (payload: UpdateEmployeePayload) =>
  api.put("/auth/update-employee-info", payload);

// POST /auth/verify-updated-email  (requires JWT)
// Verifies OTP sent to new email after email change
// Returns: { message: string }
export const verifyUpdatedEmail = (payload: VerifyPayload) =>
  api.post("/auth/verify-updated-email", payload);