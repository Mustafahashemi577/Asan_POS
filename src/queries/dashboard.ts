import api from "@/lib/axios";
import type { DashboardData } from "@/types/dashboard";

export async function fetchDashboard(): Promise<DashboardData> {
  const res = await api.get<DashboardData>("/sales/dashboard");
  return res.data;
}
