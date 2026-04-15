import ForgotPassword from "@/pages/(auth)/forgot-password/forgot-password";
import LoginPage from "@/pages/(auth)/login";
import Register from "@/pages/(auth)/register/register";
import ResetPassword from "@/pages/(auth)/reset-password/reset-password";
import Verify2FA from "@/pages/(auth)/verify-2fa/verify-2fa";
import type { RouteObject } from "react-router-dom";

export const authRoutes: RouteObject[] = [
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/verify-2fa",
    element: <Verify2FA />,
  },

];
