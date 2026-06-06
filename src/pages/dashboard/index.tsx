// pages/Dashboard/index.tsx
import { Loading } from "@/components/loading";
import type { Transaction } from "@/components/transactiontable";
import TransactionTable from "@/components/transactiontable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useJournals } from "@/hooks/use-journal";
import { useProfile } from "@/hooks/use-profile";
import DashboardStatsCard from "@/pages/dashboard/dashboardStatsCard";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Mock data ────────────────────────────────────────────────────────────────

const weeklyData = [
  { day: "Sun", income: 840 },
  { day: "Mon", income: 760 },
  { day: "Tue", income: 820 },
  { day: "Wed", income: 980 },
  { day: "Thu", income: 1700 },
  { day: "Fri", income: 2000 },
  { day: "Sat", income: 900 },
];

const monthlyData = [
  { day: "W1", income: 6400 },
  { day: "W2", income: 12000 },
  { day: "W3", income: 8200 },
  { day: "W4", income: 7000 },
];

// ─── Custom tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
        <p className="font-medium">{label}</p>
        <p className="text-green-400">{payload[0].value} AFN</p>
      </div>
    );
  }
  return null;
};

// ─── Status mapper ────────────────────────────────────────────────────────────

function toTransactionStatus(
  status: string | undefined,
): Transaction["status"] {
  switch ((status ?? "").toLowerCase()) {
    case "pending":
      return "Pending";
    case "posted":
    case "approved":
    case "done":
      return "Completed";
    case "rejected":
    case "cancelled":
      return "Declined";
    default:
      return "Completed";
  }
}

// ─── Extract customer name from account name ──────────────────────────────────

function extractCustomerName(accountName: string | undefined): string {
  if (!accountName) return "—";
  // e.g. "Walk-in Customer - Accounts Payable" → "Walk-in Customer"
  // e.g. "Hedayat  - Accounts Payable"         → "Hedayat"
  // e.g. "Abdullah - Accounts Payable"          → "Abdullah"
  return (
    accountName
      .replace(/\s*-\s*Accounts\s*(Payable|Receivable)\s*$/i, "")
      .trim() || "—"
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { profile, isLoading: profileLoading, fetchError } = useProfile();
  const j = useJournals();

  const [chartRange, setChartRange] = useState<"weekly" | "monthly">("weekly");
  const chartData = chartRange === "weekly" ? weeklyData : monthlyData;
  const totalIncome = chartData.reduce((sum, d) => sum + d.income, 0);

  // Map journal entries → Transaction rows
  const rows = useMemo<Transaction[]>(() => {
    if (!j.journals?.length) return [];

    return j.journals.map((je) => {
      const dr = je.items.find((i) => i.debit != null);
      const amount = dr?.debit ?? 0;
      const accountName = dr?.account?.name;

      return {
        id: `${je.sequence.prefix}-${String(je.sequence.lastIndex).padStart(4, "0")}`,
        customer: extractCustomerName(accountName),
        date: je.createdAt
          ? new Date(je.createdAt).toISOString().split("T")[0]
          : "",
        typeService: accountName ?? "—",
        total: amount,
        status: toTransactionStatus(je.status),
      };
    });
  }, [j.journals]);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (j.loading || profileLoading)
    return <Loading message="Loading dashboard..." />;

  if (fetchError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-red-500">
          Failed to load dashboard. Please refresh.
        </p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1401px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <DashboardStatsCard profile={profile} />

      <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
        {/* LEFT — Transaction table */}
        <div className="flex-1 min-w-0">
          {j.error ? (
            <div className="bg-white rounded-2xl border border-gray-100 px-5 py-12 text-center text-sm text-red-500">
              {j.error}
            </div>
          ) : (
            <TransactionTable rows={rows} />
          )}
        </div>

        {/* RIGHT — chart */}
        <div className="xl:w-[300px] xl:shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Total Income
            </h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Balance</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {totalIncome.toLocaleString()} AFN
                </p>
              </div>
              <Select
                value={chartRange}
                onValueChange={(v) => setChartRange(v as "weekly" | "monthly")}
              >
                <SelectTrigger className="w-24 h-8 text-xs rounded-lg border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[260px]">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={chartData}
                    barSize={22}
                    margin={{ top: 4, right: 0, left: -28, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="#f0f0f0"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(0,0,0,0.04)", radius: 6 }}
                    />
                    <Bar
                      dataKey="income"
                      fill="#111827"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
