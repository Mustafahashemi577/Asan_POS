import type { EmployeeProfile } from "@/types/profile.types";
import {
  display,
  formatDate,
  getInitials,
  getDisplayName,
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
  profile: EmployeeProfile;
  onEditClick: () => void;
}

export default function ProfileCard({ profile, onEditClick }: Props) {
  const displayName = getDisplayName(profile);

  return (
    <div className="bg-[#0f1117] rounded-2xl p-6 mb-5">
      <div className="flex items-start justify-between mb-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-600 overflow-hidden flex items-center justify-center shrink-0">
            {profile.imageUrl ? (
              <img
                src={profile.imageUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-xl font-semibold">
                {getInitials(profile)}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-white font-semibold text-lg">
                {displayName}
              </span>
              {profile.gender && (
                <span className="text-xs bg-white/15 text-gray-300 px-2 py-0.5 rounded-full capitalize">
                  {profile.gender}
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-3">
              {display(profile.email)}
            </p>
            <button
              onClick={onEditClick}
              className="text-xs border border-white/25 text-gray-300 px-4 py-1.5 rounded-lg hover:bg-white/10 transition"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Right meta */}
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end mb-4">
            <span className="text-gray-500 text-xs">Birthday</span>
            <span className="text-white text-xs">
              {formatDate(profile.dob)}
            </span>
          </div>
          <div className="flex items-center gap-0 divide-x divide-white/15">
            <div className="text-center px-5">
              <p className="text-gray-500 text-[10px] mb-1">First seen</p>
              <p className="text-white text-xs">
                {formatDate(profile.createdAt)}
              </p>
            </div>
            <div className="text-center px-5">
              <p className="text-gray-500 text-[10px] mb-1">Position</p>
              <p className="text-white text-xs">{display(profile.role)}</p>
            </div>
            <div className="text-center px-5">
              <p className="text-gray-500 text-[10px] mb-1">Store</p>
              <p className="text-white text-xs">{display(profile.storeName)}</p>
            </div>
          </div>
          {/* {
            cardMetadata.map((meta) => {
                <CardMeta key={meta.label} label={meta.label} value={display(profile[meta.field])} />
            })
          } */}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#1a1d27] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-400 text-xs">{stat.label}</span>
            </div>
            <div className="flex items-end justify-between mb-3">
              <p className="text-white text-2xl font-semibold">{stat.value}</p>
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
