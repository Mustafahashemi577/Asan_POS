// components/dashboard/DashboardStatsCard.tsx
// Stats-only card for the dashboard — no avatar, name, or profile info.
// Profile info lives exclusively in components/profile/ProfileCard.tsx

import type { EmployeeInfo } from "@/types/";
import { getDisplayName } from "@/utils/profile.helpers";

const stats = [
  {
    label: "Order Process",
    value: "5",
    pct: "0,5%",
    pctColor: "text-green-400",
    date: "Saturday, 06 Sep 2024",
    sub: "1,300 AFN",
  },
  {
    label: "Order Done",
    value: "40",
    pct: "",
    pctColor: "",
    date: "Saturday, 06 Sep 2024",
    sub: "521 AFN",
  },
  {
    label: "Total Order",
    value: "120",
    pct: "",
    pctColor: "",
    date: "Saturday, 06 Sep 2024",
    sub: "521 AFN",
  },
  {
    label: "Total Income",
    value: "1.200 AFN",
    pct: "0,5%",
    pctColor: "text-green-400",
    date: "Saturday, 06 Sep 2024",
    sub: "1,234 AFN",
  },
];

interface Props {
  profile: EmployeeInfo;
  //onMakeOrder?: () => void;
}

export default function DashboardStatsCard({ profile }: Props) {
  const displayName = getDisplayName(profile);

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

        {/* <button
          onClick={onMakeOrder}
          className="shrink-0 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors text-white text-sm font-medium px-5 py-2.5 rounded-xl"
        >
          Make an order
        </button> */}
      </div>

      {/* Stats grid — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
                  className={`text-xs font-medium ${stat.pctColor} bg-green-400/10 px-1.5 py-0.5 rounded`}
                >
                  {stat.pct}
                </span>
              )}
            </div>

            <hr className="border-white/10 mb-2" />

            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[10px]">{stat.date}</span>
              <span className="text-gray-400 text-xs">{stat.sub}</span>
            </div>

            <button className="text-gray-500 text-[10px] mt-1.5 hover:text-gray-300 transition block">
              View all &rsaquo;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
