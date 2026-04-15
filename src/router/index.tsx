import Login from "@/pages/(auth)/login";
import Dashboard from "@/pages/dashboard";
import { createBrowserRouter } from "react-router-dom";
import { authRoutes } from "./auth";

export const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/dashboard", element: <Dashboard /> },
  ...authRoutes,
]);