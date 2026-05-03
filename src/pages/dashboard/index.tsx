// pages/Dashboard/index.tsx
import { Loading } from "@/components/loading";
import TransactionTable from "@/components/transactiontable";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile } from "@/hooks/useprofile";
import DashboardStatsCard from "@/pages/dashboard/dashboardStatsCard";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  { day: "Sun", income: 130 },
  { day: "Mon", income: 130 },
  { day: "Tue", income: 150 },
  { day: "Wed", income: 130 },
  { day: "Thu", income: 170 },
  { day: "Fri", income: 185 },
  { day: "Sat", income: 200 },
];

const monthlyData = [
  { day: "W1", income: 520 },
  { day: "W2", income: 610 },
  { day: "W3", income: 480 },
  { day: "W4", income: 700 },
];

const mockEmployees = [
  {
    id: "1",
    name: "Mangcoding",
    email: "hello@mangcoding.com",
    initials: "MI",
    color: "bg-violet-600",
  },
  {
    id: "2",
    name: "Purwa Adi W",
    email: "purwaadi361@gmail.com",
    initials: "PA",
    color: "bg-pink-500",
  },
  {
    id: "3",
    name: "Deni Setiawan",
    email: "deni.s@gmail.com",
    initials: "DS",
    color: "bg-amber-500",
  },
  {
    id: "4",
    name: "Relastini",
    email: "relastini@gmail.com",
    initials: "RL",
    color: "bg-teal-500",
  },
];

// ─── Custom tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
        <p className="font-medium">{label}</p>
        <p className="text-green-400">${payload[0].value}</p>
      </div>
    );
  }
  return null;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  // SWR deduplicates — reuses AppLayout's cached /auth/me, no extra request
  const { profile, isLoading, fetchError } = useProfile();

  const [chartRange, setChartRange] = useState<"weekly" | "monthly">("weekly");
  const chartData = chartRange === "weekly" ? weeklyData : monthlyData;
  const totalIncome = chartData.reduce((sum, d) => sum + d.income, 0);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (isLoading) return <Loading message="Loading dashboard..." />;

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
    // Outer wrapper: fills viewport, scrollable on mobile
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* ── Stats card (welcome + 4 stat tiles) — NO profile info ── */}
        <DashboardStatsCard
          profile={profile}
          onMakeOrder={() => navigate("/transaction/new")}
        />

        {/* ── Main content: stacks on mobile, side-by-side on xl ── */}
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
          {/* LEFT — Transaction table (full width on mobile) */}
          <div className="flex-1 min-w-0">
            <TransactionTable />
          </div>

          {/* RIGHT — chart + employees (full width on mobile, fixed 300px on xl) */}
          <div className="flex flex-col gap-4 sm:gap-6 xl:w-[300px] xl:shrink-0">
            {/* ── Income Chart ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Total Income
              </h3>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Balance</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    ${totalIncome.toLocaleString()},00
                  </p>
                </div>

                <Select
                  value={chartRange}
                  onValueChange={(v) =>
                    setChartRange(v as "weekly" | "monthly")
                  }
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

              {/* Chart is horizontally scrollable on very small screens */}
              <div className="overflow-x-auto">
                <div className="min-w-[260px]">
                  <ResponsiveContainer width="100%" height={180}>
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

            {/* ── Employee List ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  User/Employee
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-500 hover:text-blue-600 px-2 h-7"
                >
                  View all →
                </Button>
              </div>

              <div className="space-y-3">
                {mockEmployees.map((emp) => (
                  <div key={emp.id} className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarFallback
                        className={`${emp.color} text-white text-xs font-semibold`}
                      >
                        {emp.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {emp.name}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {emp.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
