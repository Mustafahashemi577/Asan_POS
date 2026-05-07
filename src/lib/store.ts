import { create } from "zustand";
import {createJSONStorage, persist} from "zustand/middleware"

// function getValidToken(token: string | null): string | null {
//   if (!token) return null;
//   try {
//     // const payload = JSON.parse(atob(token.split(".")[1]));
//     // if (payload.exp * 1000 < Date.now()) {
//     //   useAuthStore.getState().clearAuth();
//     //   return null;
//     // }
//     return token;
//   } catch {
//     useAuthStore.getState().clearAuth();
//     return null;
//   }
// }

type User = {
  id: string;
  email: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  twoFAEnabled: boolean;
  setAuth: (user: User, token: string) => void;
  setTwoFAEnabled: (enabled: boolean) => void;
  clearAuth: () => void;
  logout: () => void;
};

// export const useAuthStore = create<AuthState>((set) => ({
//   user: null,
//   token: getValidToken(), // ← reads localStorage but validates expiry
//   twoFAEnabled: localStorage.getItem("2fa_enabled") === "true",

//   setAuth: (user, token) => {
//     localStorage.setItem("token", token);
//     set({ user, token });
//   },

//   setTwoFAEnabled: (enabled) => {
//     if (enabled) localStorage.setItem("2fa_enabled", "true");
//     else localStorage.removeItem("2fa_enabled");
//     set({ twoFAEnabled: enabled });
//   },

//   clearAuth: () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("2fa_enabled");
//     set({ user: null, token: null, twoFAEnabled: false });
//   },

//   logout: () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("2fa_enabled");
//     set({ user: null, token: null, twoFAEnabled: false });
//   },
// }));

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      twoFAEnabled: false,

      setAuth: (user, token) => {
        set({
          user,
          token,
        });
      },

      setTwoFAEnabled: (enabled) => {
        set({
          twoFAEnabled: enabled,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          twoFAEnabled: false,
        });
      },

      logout: () => {
        get().clearAuth();
      }
    }),
    {
      name: "auth-storage",

      storage: createJSONStorage(() => localStorage),
    }
  )
);
