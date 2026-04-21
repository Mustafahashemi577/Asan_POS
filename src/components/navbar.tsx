import { useAuthStore } from "@/lib/store";
import type { EmployeeProfile } from "@/types/profile.types";
import { display, getDisplayName, getInitials } from "@/utils/profile.helpers";
import { Bell, Calendar, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  profile: EmployeeProfile;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openEdit: () => void;
}

export const Navbar = ({
  profile,
  dropdownOpen,
  setDropdownOpen,
  openEdit,
}: NavbarProps) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <img src="/icons/logo.svg" alt="Logo" className="w-6 h-6" />
          <span className="font-bold text-base text-gray-900">Mpos</span>
        </div>
        <nav className="flex items-center gap-6">
          {[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Product", path: "/products" },
            { label: "Transaction", path: "/transactions" },
            { label: "Report", path: "/reports" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="text-sm text-gray-500 hover:text-gray-900 transition"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2">
          <Calendar size={13} className="text-gray-400" />
          <span>
            {dateStr} at {timeStr}
          </span>
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition">
          <Bell size={14} className="text-gray-500" />
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition"
          >
            <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-xs font-semibold text-white shrink-0 overflow-hidden">
              {profile.imageUrl ? (
                <img
                  src={profile.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(profile)
              )}
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-gray-800 leading-none mb-0.5">
                {getDisplayName(profile)}
              </p>
              <p className="text-[10px] text-gray-400 leading-none">
                {display(profile.email)}
              </p>
            </div>
            <ChevronDown size={13} className="text-gray-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-gray-100 shadow-lg z-30 overflow-hidden">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/profile");
                }}
                className="w-full text-left text-sm text-gray-700 px-4 py-2.5 hover:bg-gray-50 transition"
              >
                View Profile
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  openEdit();
                }}
                className="w-full text-left text-sm text-gray-700 px-4 py-2.5 hover:bg-gray-50 transition"
              >
                Edit Profile
              </button>
              <hr className="border-gray-100" />
              <button
                onClick={handleLogout}
                className="w-full text-left text-sm text-red-500 px-4 py-2.5 hover:bg-red-50 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
