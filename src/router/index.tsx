import AppLayout from "@/components/layout/app-layout";

import Login from "@/pages/(auth)/login";
import Category from "@/pages/category";
import Contacts from "@/pages/contacts";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Product from "@/pages/product";
import ProfilePage from "@/pages/profile";
import Purchases from "@/pages/Purchases";
import NewPurchasePage from "@/pages/Purchases/new";
import StockInPage from "@/pages/Purchases/stock-in";
import ViewPurchase from "@/pages/Purchases/view-purchase";
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
    ),
  },

  ...authRoutes,

  {
    element: <AppLayout />,
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
        path: "/categories",
        element: (
          <PrivateRoute>
            <Category />
          </PrivateRoute>
        ),
      },
      {
        path: "/products",
        element: (
          <PrivateRoute>
            <Product />
          </PrivateRoute>
        ),
      },
      {
        path: "/transactions",
        element: (
          <PrivateRoute>
            <Transaction />
          </PrivateRoute>
        ),
      },
      {
        path: "/reports",
        element: (
          <PrivateRoute>
            <Report />
          </PrivateRoute>
        ),
      },
      {
        path: "/inventories",
        element: (
          <PrivateRoute>
            <Inventory />
          </PrivateRoute>
        ),
      },
      {
        path: "/Purchases",
        element: (
          <PrivateRoute>
            <Purchases />
          </PrivateRoute>
        ),
      },
      {
        path: "/Purchases/new",
        element: (
          <PrivateRoute>
            <NewPurchasePage />
          </PrivateRoute>
        ),
      },
      {
        path: "/Purchases/:id",
        element: (
          <PrivateRoute>
            <ViewPurchase />
          </PrivateRoute>
        ),
      },
      {
        path: "/Purchases/:id/stock-in",
        element: (
          <PrivateRoute>
            <StockInPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/contacts",
        element: (
          <PrivateRoute>
            <Contacts />
          </PrivateRoute>
        ),
      },
    ],
  },
]);
