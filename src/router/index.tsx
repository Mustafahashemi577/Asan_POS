import AppLayout from "@/components/layout/app-layout";

import Login from "@/pages/(auth)/login";
import Category from "@/pages/category";
import Dashboard from "@/pages/dashboard";
import Product from "@/pages/product";
import ProfilePage from "@/pages/profile";
import Report from "@/pages/report";
import Transaction from "@/pages/transaction";
import { createBrowserRouter } from "react-router-dom";
import { authRoutes } from "./auth";
import { PrivateRoute, PublicRoute } from "./guards";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ), // logged-in users can't go back here
  },

  ...authRoutes,

  {
    element: <AppLayout />, // all routes below require auth and share the same layout
    children: [
      {
        path: "/dashboard",
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        ),
      },
      {
        path: "/category",
        element: (
          <PrivateRoute>
            <Category />
          </PrivateRoute>
        ),
      },
      {
        path: "/product",
        element: (
          <PrivateRoute>
            <Product />
          </PrivateRoute>
        ),
      },
      {
        path: "/transaction",
        element: (
          <PrivateRoute>
            <Transaction />
          </PrivateRoute>
        ),
      },
      {
        path: "/report",
        element: (
          <PrivateRoute>
            <Report />
          </PrivateRoute>
        ),
      },
    ],
  },
]);
