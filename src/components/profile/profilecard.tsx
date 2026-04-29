import { Button } from "@/components/ui/button";
import type { EmployeeInfo } from "@/types/";
import {
  display,
  formatDate,
  getDisplayName,
  getInitials,
} from "@/utils/profile.helpers";

const stats = [
  {
    label: "Order Process",
    value: "5",
    pct: "0,5%",
    pctColor: "text-green-400",
    date: "Yesterday, 26 Mar 2024",
    sub: "1,300",
  },
  {
    label: "Order Done",
    value: "40",
    pct: "",
    pctColor: "",
    date: "Yesterday, 26 Mar 2024",
    sub: "70",
  },
  {
    label: "Total Order",
    value: "120",
    pct: "",
    pctColor: "",
    date: "Yesterday, 26 Mar 2024",
    sub: "170",
  },
  {
    label: "Total Income",
    value: "$1.200,00",
    pct: "0,5%",
    pctColor: "text-green-400",
    date: "Yesterday, 26 Mar 2024",
    sub: "$1,234.00",
  },
];

interface Props {
  profile: EmployeeInfo;
  onEditClick: () => void;
}

export default function ProfileCard({ profile, onEditClick }: Props) {
  const displayName = getDisplayName(profile);

  return (
    <div className="bg-gradient-to-t from-bg-dark via-bg-dark to-bg-dark/90 w-full rounded-2xl p-4 sm:p-6 mb-5">
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
        {/* LEFT — Avatar + name + email + edit button (desktop only) */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-600 overflow-hidden flex items-center justify-center shrink-0">
            {profile.imageUrl ? (
              <img
                src={profile.imageUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-lg font-semibold">
                {getInitials(profile)}
              </span>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-white font-semibold text-base sm:text-lg">
                {displayName}
              </span>
              {profile.gender && (
                <span className="text-xs bg-white/15 text-gray-300 px-2 py-0.5 rounded-full capitalize">
                  {profile.gender}
                </span>
              )}
            </div>

            <p className="text-gray-400 text-xs sm:text-sm mb-2">
              {display(profile.email)}
            </p>

            {/* Edit Profile button — desktop only */}
            <Button
              variant="ghost-dark"
              size="sm"
              onClick={onEditClick}
              className="hidden lg:inline-flex"
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* RIGHT — Birthday + meta blocks */}
        <div className="flex flex-col items-center lg:items-end gap-4">
          {/* Birthday */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">Birthday</span>
            <span className="text-white text-xs font-medium">
              {formatDate(profile.dob)}
            </span>
          </div>

          {/* Extra gap then First seen / Position / Store */}
          <div className="flex w-full sm:w-auto justify-center lg:justify-end divide-x divide-white/15 mt-1">
            {[
              { label: "First seen", value: formatDate(profile.createdAt) },
              { label: "Position", value: display(profile.role) },
              { label: "Store", value: display(profile.storeName) },
            ].map((item, i) => (
              <div key={i} className="text-center px-4 sm:px-5">
                <p className="text-gray-500 text-[10px] mb-1">{item.label}</p>
                <p className="text-white text-xs">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile button — mobile only, full width */}
      <div className="lg:hidden w-full mb-4">
        <Button
          variant="ghost-dark"
          size="sm"
          onClick={onEditClick}
          className="w-full"
        >
          Edit Profile
        </Button>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-bg-profile border border-white/10 rounded-xl p-4"
          >
            <p className="text-gray-300 text-xs mb-2">{stat.label}</p>

            <div className="flex items-end justify-between mb-3">
              <p className="text-white text-xl sm:text-2xl font-semibold">
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
              View all
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
