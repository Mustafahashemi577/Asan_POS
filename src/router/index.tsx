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
import UnauthorizedPage from "@/pages/unauthorized";
import UsersPage from "@/pages/users";
import { createBrowserRouter } from "react-router-dom";
import { authRoutes } from "./auth";
import { PrivateRoute, PublicRoute, RoleRoute } from "./guards";

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
        path: "/unauthorized",
        element: (
          <PrivateRoute>
            <UnauthorizedPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <RoleRoute allowed={["Admin"]}>
            <Dashboard />
          </RoleRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <RoleRoute allowed={["Admin"]}>
            <ProfilePage />
          </RoleRoute>
        ),
      },
      {
        path: "/categories",
        element: (
          <RoleRoute allowed={["Admin"]}>
            <Category />
          </RoleRoute>
        ),
      },
      {
        path: "/products",
        element: (
          <RoleRoute allowed={["Admin"]}>
            <Products />
          </RoleRoute>
        ),
      },
      {
        path: "/reports",
        element: (
          <RoleRoute allowed={["Admin"]}>
            <Report />
          </RoleRoute>
        ),
      },
      {
        path: "/inventories",
        element: (
          <RoleRoute allowed={["Admin"]}>
            <Inventory />
          </RoleRoute>
        ),
      },
      {
        path: "/Purchases",
        element: (
          <RoleRoute allowed={["Admin"]}>
            <Purchases />
          </RoleRoute>
        ),
      },
      {
        path: "/Purchases/new",
        element: (
          <RoleRoute allowed={["Admin"]}>
            <NewPurchasePage />
          </RoleRoute>
        ),
      },
      {
        path: "/Purchases/:id",
        element: (
          <RoleRoute allowed={["Admin"]}>
            <ViewPurchase />
          </RoleRoute>
        ),
      },
      {
        path: "/journals",
        element: (
          <RoleRoute allowed={["Admin"]}>
            <Journals />
          </RoleRoute>
        ),
      },
      {
        path: "/contacts",
        element: (
          <RoleRoute allowed={["Admin"]}>
            <Contacts />
          </RoleRoute>
        ),
      },
      {
        path: "/users",
        element: (
          <RoleRoute allowed={["Admin"]}>
            <UsersPage />
          </RoleRoute>
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
