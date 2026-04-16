import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/lib/store";

// Logged-in users only — others go to login
export function PrivateRoute({ children }: { children: React.ReactNode }) {
    const token = useAuthStore((s) => s.token);
    return token ? <>{children}</> : <Navigate to="/" replace />;
}

// Logged-out users only — logged-in users go to dashboard
export function PublicRoute({ children }: { children: React.ReactNode }) {
    const token = useAuthStore((s) => s.token);
    return !token ? <>{children}</> : <Navigate to="/dashboard" replace />;
}