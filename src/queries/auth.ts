import api from "@/lib/axios";

// --- Types ---
interface LoginPayload {
  email: string;
  password: string;
  code?: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  phone: string;
  storeName: string;
}

interface VerifyRegisterPayload {
  email: string;
  code: string;
}

interface Enable2FAPayload {
  code: string;
}

// --- Auth Functions ---

// POST /auth/login
export const login = (payload: LoginPayload) => {
  return api.post("/auth/login", payload);
};

// POST /auth/register
export const register = (payload: RegisterPayload) => {
  return api.post("/auth/register", payload);
};

// POST /auth/verify-register
export const verifyRegister = (payload: VerifyRegisterPayload) => {
  return api.post("/auth/verify-register", payload);
};

// POST /auth/enable-2fa
export const enable2FA = (payload: Enable2FAPayload) => {
  return api.post("/auth/enable-2fa", payload);
};

// DELETE /auth/disable-2fa
export const disable2FA = () => {
  return api.delete("/auth/disable-2fa");
};