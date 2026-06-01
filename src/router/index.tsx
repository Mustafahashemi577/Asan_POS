import AppLayout from "@/components/layout/app-layout";

import Login from "@/pages/(auth)/login";
import Category from "@/pages/category";
import Contacts from "@/pages/contacts";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Journals from "@/pages/journals";
import Pos from "@/pages/pos";
import Products from "@/pages/product";
import ProfilePage from "@/pages/profile";
import Purchases from "@/pages/Purchases";
import NewPurchasePage from "@/pages/Purchases/new";
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
            <Products />
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
        path: "/journals",
        element: (
          <PrivateRoute>
            <Journals />
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
      {
        path: "/pos",
        element: (
          <PrivateRoute>
            <Pos />
          </PrivateRoute>
        ),
      },
    ],
  },
]);
