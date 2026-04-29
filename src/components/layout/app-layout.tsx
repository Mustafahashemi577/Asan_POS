import { Navbar } from "@/components/navbar";
import { useProfile } from "@/hooks/useprofile";
import { Loader2 } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * AppLayout
 *
 * Wrap every authenticated page with this layout in your router.
 * It owns the profile fetch and renders <Navbar> + <main> consistently.
 * Pages receive their content area via <Outlet />.
 *
 * Usage in router (see router.tsx for full example):
 *   <Route element={<AppLayout />}>
 *     <Route path="/dashboard"   element={<Dashboard />} />
 *     <Route path="/product"     element={<Product />} />
 *     <Route path="/transaction" element={<Transaction />} />
 *     <Route path="/report"      element={<Report />} />
 *     <Route path="/profile"     element={<Profile />} />
 *     <Route path="/category"    element={<Category />} />
 *   </Route>
 */
export default function AppLayout() {
  const { profile, isLoading, error } = useProfile();

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // ── Auth guard — redirect to login if profile fetch failed ───────────────
  if (error || !profile) {
    return <Navigate to="/" replace />;
  }

  // ── Layout ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky top navbar — identical on every page */}
      <Navbar profile={profile} />

      {/* Page content injected here by React Router */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
