import { Navbar } from "@/components/navbar";
import { useProfile } from "@/hooks/useprofile";
import { Loader2 } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";

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
    <div className="min-h-screen rounded-xl bg-gray-200 p-2.5 flex flex-col h-calc(100vh-57px)">
      {/* Sticky top navbar — identical on every page */}
      <Navbar profile={profile} />

      {/* Page content injected here by React Router */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
