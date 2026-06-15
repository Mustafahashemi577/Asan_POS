import { fetchDashboard } from "@/queries/dashboard";
import type { DashboardData } from "@/types/dashboard";
import { useEffect, useState } from "react";

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchDashboard()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load dashboard stats.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
