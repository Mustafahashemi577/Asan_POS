import type { EmployeeInfo } from "@/types/";
import type { DashboardData } from "@/types/dashboard";
import { getDisplayName } from "@/utils/profile.helpers";

interface Props {
  profile: EmployeeInfo;
  dashboard: DashboardData | null;
}

function pctLabel(val: number): string {
  if (val === 0) return "";
  return `${val > 0 ? "+" : ""}${val.toFixed(1)}%`;
}

export default function DashboardStatsCard({ profile, dashboard }: Props) {
  const displayName = getDisplayName(profile);

  const todaySales = dashboard?.todaySales.total ?? 0;
  const salesPct = dashboard?.todaySales.percentageChange ?? 0;
  const todayProfit = dashboard?.todayProfit.total ?? 0;
  const profitPct = dashboard?.todayProfit.percentageChange ?? 0;
  const lowStock = dashboard?.lowStockProducts ?? [];

  const stats = [
    {
      label: "Today's Sales",
      value: `${todaySales.toLocaleString()} AFN`,
      pct: pctLabel(salesPct),
      pctColor: salesPct >= 0 ? "text-green-400" : "text-red-400",
      pctBg: salesPct >= 0 ? "bg-green-400/10" : "bg-red-400/10",
      sub: `${salesPct >= 0 ? "▲" : "▼"} vs yesterday`,
    },
    {
      label: "Today's Profit",
      value: `${todayProfit.toLocaleString()} AFN`,
      pct: pctLabel(profitPct),
      pctColor: profitPct >= 0 ? "text-green-400" : "text-red-400",
      pctBg: profitPct >= 0 ? "bg-green-400/10" : "bg-red-400/10",
      sub: `${profitPct >= 0 ? "▲" : "▼"} vs yesterday`,
    },
    {
      label: "Low Stock Items",
      value: `${lowStock.length}`,
      pct: lowStock.length > 0 ? "!" : "",
      pctColor: "text-yellow-400",
      pctBg: "bg-yellow-400/10",
      sub:
        lowStock.length > 0
          ? lowStock[0].name // show the most critical item name
          : "All stocked",
    },
  ];

  return (
    <div className="bg-gradient-to-t from-bg-dark via-bg-dark to-bg-dark/90 w-full rounded-2xl p-4 sm:p-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-white text-xl sm:text-2xl font-semibold">
            Welcome {displayName}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Be a good and honest employee for everyone's happiness
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/10 border border-white/10 rounded-xl p-4"
          >
            <p className="text-gray-300 text-xs mb-2">{stat.label}</p>

            <div className="flex items-end justify-between mb-3">
              <p className="text-white text-lg sm:text-xl font-semibold leading-tight">
                {stat.value}
              </p>
              {stat.pct && (
                <span
                  className={`text-xs font-medium ${stat.pctColor} ${stat.pctBg} px-1.5 py-0.5 rounded`}
                >
                  {stat.pct}
                </span>
              )}
            </div>

            <hr className="border-white/10 mb-2" />

            <p className="text-gray-400 text-[10px]">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
