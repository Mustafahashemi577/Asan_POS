import Login from "@/pages/(auth)/login";
import Dashboard from "@/pages/dashboard";
import { createBrowserRouter } from "react-router-dom";
import { authRoutes } from "./auth";
import { PrivateRoute, PublicRoute } from "./guards";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicRoute><Login /></PublicRoute>,   // logged-in users can't go back here
  },
  {
    path: "/dashboard",
    element: <PrivateRoute><Dashboard /></PrivateRoute>,  // logged-out users can't access
  },
  ...authRoutes,
]);