import { Loading } from "@/components/loading";
import OtpDialog from "@/components/otp-dialog";
import EditProfileDialog from "@/components/profile/editprofiledialog";
import ProfileCard from "@/components/profile/profilecard";
import TransactionTable from "@/components/transactiontable";
import { useEditProfile } from "@/hooks/useeditprofile";
import { useProfile } from "@/hooks/useprofile";
import api from "@/lib/axios";
import { useState } from "react";

export default function ProfilePage() {
  const { profile, isLoading, fetchError, mutate } = useProfile();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const {
    editOpen,
    closeEdit,
    openEdit,
    otpOpen,
    closeOtp,
    pendingEmail,
    // editForm,
    // setEditForm,
    handleEmailChange,
  } = useEditProfile(profile);

  // 12, Jan, 2025  ->     dd, MMM, yyyy

  if (isLoading) {
    return <Loading message={"Loading profile..."} />;
  }

  if (fetchError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-red-500">
          Failed to load profile. Please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <main>
      <div className="min-h-screen bg-gray-50">
        {dropdownOpen && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => setDropdownOpen(false)}
          />
        )}

        {/* ── Content ── */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-5">
            <h1 className="text-3xl font-semibold text-gray-900">
              Detail Profile
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Be a good and honest employee for everyone's happiness
            </p>
          </div>

          <ProfileCard profile={profile} onEditClick={openEdit} />
          <TransactionTable />
        </div>

        {/* ── Dialogs ── */}
        <EditProfileDialog
          open={editOpen}
          onClose={closeEdit}
          profile={profile}
          // editForm={editForm}
          // setEditForm={setEditForm}
          onSaveSuccess={() => mutate()}
          onEmailChange={handleEmailChange}
        />

        <OtpDialog
          open={otpOpen}
          onClose={closeOtp}
          title="Verify New Email"
          description={`We sent a verification code to ${pendingEmail}`}
          onVerify={async (code) => {
            await api.post("/employees/verify-updated-email", {
              email: pendingEmail,
              code,
            });
            await mutate();
          }}
        />
      </div>
    </main>
  );
}
