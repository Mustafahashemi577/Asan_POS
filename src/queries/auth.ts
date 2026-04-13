import api from "@/lib/axios";

interface LoginPayload {
  email: string;
  password: string;
}

export const login = (payload: LoginPayload) => {
  return api.post("/auth/login", payload);
};
