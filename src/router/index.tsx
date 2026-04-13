import Login from "@/pages/(auth)/login";
import { createBrowserRouter } from "react-router-dom";
import { authRoutes } from "./auth";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  ...authRoutes,
]);
