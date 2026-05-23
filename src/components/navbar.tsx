import { useAuthStore } from "@/lib/store";
import type { EmployeeInfo } from "@/types/index";
import { getInitials } from "@/utils/profile.helpers";
import { Bell, ChevronDown, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavbarProps {
  profile: EmployeeInfo;
}

export const Navbar = ({ profile }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const items = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Categories", path: "/categories" },
    { label: "Products", path: "/products" },
    { label: "Transactions", path: "/transactions" },
    { label: "Reports", path: "/reports" },
    { label: "Inventories", path: "/inventories" },
    { label: "Purchases", path: "/Purchases" },
    { label: "Journals", path: "/journals" },
    { label: "Contacts", path: "/Contacts" },
  ];

  return (
    <header className="bg-white sm:rounded-t-xl sm:mt-2.5 sm:mx-2.5 sticky top-0 z-20">
      {/* ================= MOBILE ================= */}

      <div className="md:hidden px-4 py-3 flex flex-col gap-3">
        {/* ROW 1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/icons/logo.svg" className="w-6 h-6" alt="Logo" />
            <span className="font-bold text-gray-900">APOS</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="bg-white w-9 h-9 rounded-sm "
            >
              <Bell size={14} />
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-24">
                <div className="mt-6 flex flex-col gap-2">
                  {items.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                      <Button
                        key={item.label}
                        onClick={() => navigate(item.path)}
                        variant="ghost"
                        className={`justify-start px-3 py-2 rounded-lg text-sm ${
                          isActive
                            ? "bg-black text-white font-medium hover:bg-black"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* ROW 2 */}
        <div className="flex items-center justify-between">
          {/* <div className="flex items-center gap-2 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2">
            <CalendarDays size={13} />
            <span>
              {dateStr} at {timeStr}
            </span>
          </div> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 rounded-xl px-2 py-1.5"
              >
                <Avatar className="w-7 h-7">
                  <AvatarImage src={profile.imageUrl ?? undefined} />
                  <AvatarFallback>{getInitials(profile)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:flex items-center justify-between px-8 py-3">
        {/* LEFT: logo + nav */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <img src="/icons/logo.svg" className="w-6 h-6" alt="Logo" />
            <span className="font-bold text-gray-900">APOS</span>
          </div>

          <nav className="flex items-center gap-1">
            {items.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  onClick={() => navigate(item.path)}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-black text-white font-medium"
                      : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* RIGHT: date, bell, avatar */}
        <div className="flex items-center gap-3">
          {/* <div className="flex items-center gap-2 text-xs text-gray-600 border border-gray-200 rounded-sm px-3 py-2">
            <CalendarDays size={13} />
            <span>
              {dateStr} at {timeStr}
            </span>
          </div> */}

          {/* <Separator orientation="vertical" className="mt-1.5 h-6" /> */}

          <Button variant="outline" size="icon" className="w-9 h-9 bg-white">
            <Bell size={14} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="flex bg-white items-center gap-2 rounded-md px-3 py-1.5"
                variant="outline"
              >
                <Avatar className="w-7 h-7">
                  <AvatarImage src={profile.imageUrl ?? undefined} />
                  <AvatarFallback>{getInitials(profile)}</AvatarFallback>
                </Avatar>

                <ChevronDown size={13} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-45">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
