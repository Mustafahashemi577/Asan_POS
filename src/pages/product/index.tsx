import { Navbar } from "@/components/navbar";
import { useProfile } from "@/hooks/useprofile";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Product() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { profile } = useProfile(); // ← get profile data for Navbar

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      {profile && (
        <Navbar
          profile={profile}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
        />
      )}
    </div>
  );
}
