import ForgotPassword from "@/pages/(auth)/forgot-password";
import LoginPage from "@/pages/(auth)/login";
import Register from "@/pages/(auth)/register";
import ResetPassword from "@/pages/(auth)/reset-password";
import Verify2FA from "@/pages/(auth)/verify-2fa";
import type { RouteObject } from "react-router-dom";

export const authRoutes: RouteObject[] = [
  {
    path: "",
    element: <LoginPage />,
  },
  {
    path: "",
    element: <Register />,
  },
  {
    path: "",
    element: <ForgotPassword />,
  },
  {
    path: "",
    element: <ResetPassword />,
  },
  {
    path: "",
    element: <Verify2FA />,
  },
];
