import { useAuthStore } from "@/lib/store";
import type { EmployeeInfo } from "@/types/index";
import { getInitials } from "@/utils/profile.helpers";
import { Bell, ChevronDown, LogOut, Menu, UserCircle } from "lucide-react";
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
    { label: "Reports", path: "/reports" },
    { label: "Inventories", path: "/inventories" },
    { label: "Purchases", path: "/Purchases" },
    { label: "Journals", path: "/journals" },
    { label: "Users", path: "/users" },
    { label: "Contacts", path: "/Contacts" },
    { label: "POS", path: "/pos" },
  ];

  return (
    <header className="bg-white sm:rounded-t-xl sm:mt-2.5 sm:mx-2.5 sticky top-0 z-20">
      {/* ================= MOBILE ================= */}

      {/* ================= MOBILE + TABLET ================= */}
      <div className="xl:hidden px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/icons/logo.svg" className="w-6 h-6" alt="Logo" />
          <span className="font-bold text-gray-900">APOS</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="bg-white w-9 h-9">
            <Bell size={14} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profile.imageUrl ?? undefined} />
                  <AvatarFallback>{getInitials(profile)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => navigate("/profile")}
                className="cursor-pointer"
              >
                <UserCircle size={14} className="mr-2" />
                View Profile
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-500 cursor-pointer"
              >
                <LogOut size={14} className="mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size={20} />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[280px]">
              <div className="mt-6 flex flex-col gap-1">
                {items.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);

                  return (
                    <Button
                      key={item.label}
                      variant="ghost"
                      onClick={() => navigate(item.path)}
                      className={`justify-start ${
                        isActive
                          ? "bg-black text-white hover:bg-black"
                          : "text-gray-600 hover:bg-gray-50"
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

      {/* DESKTOP */}
      <div className="hidden xl:flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <img src="/icons/logo.svg" className="w-6 h-6" alt="Logo" />
            <span className="font-bold text-gray-900">APOS</span>
          </div>

          <div className="overflow-x-auto">
            <nav className="flex items-center gap-1 min-w-max">
              {items.map((item) => {
                const isActive = location.pathname.startsWith(item.path);

                return (
                  <Button
                    key={item.label}
                    variant="ghost"
                    onClick={() => navigate(item.path)}
                    className={`text-sm px-3 py-1.5 rounded-lg ${
                      isActive
                        ? "bg-black text-white"
                        : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
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

            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <UserCircle size={14} className="mr-2" />
                View Profile
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                <LogOut size={14} className="mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
