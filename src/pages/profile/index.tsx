import { Loading } from "@/components/loading";
import OtpDialog from "@/components/otp-dialog";
import EditProfileDialog from "@/components/profile/editprofiledialog";
import ProfileCard from "@/components/profile/profilecard";
import TwoFactorCard from "@/components/profile/twofactorcard";
import type { Transaction } from "@/components/transactiontable";
import TransactionTable from "@/components/transactiontable";
import { useEditProfile } from "@/hooks/use-editprofile";
import { useJournals } from "@/hooks/use-journal";
import { useProfile } from "@/hooks/use-profile";
import api from "@/lib/axios";
import { useMemo, useState } from "react";

// ─── Status mapper ────────────────────────────────────────────────────────────

function toTransactionStatus(
  status: string | undefined,
): Transaction["status"] {
  switch ((status ?? "").toLowerCase()) {
    case "pending":
      return "Pending";
    case "posted":
    case "approved":
    case "done":
      return "Completed";
    case "rejected":
    case "cancelled":
      return "Declined";
    default:
      return "Completed";
  }
}

// ─── Extract customer name from account name ──────────────────────────────────

function extractCustomerName(accountName: string | undefined): string {
  if (!accountName) return "—";
  return (
    accountName
      .replace(/\s*-\s*Accounts\s*(Payable|Receivable)\s*$/i, "")
      .trim() || "—"
  );
}

export default function ProfilePage() {
  const {
    profile,
    isLoading: profileLoading,
    fetchError,
    mutate,
  } = useProfile();
  const j = useJournals();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const {
    editOpen,
    closeEdit,
    openEdit,
    otpOpen,
    closeOtp,
    pendingEmail,
    handleEmailChange,
  } = useEditProfile(profile);

  // Map journal entries → Transaction rows
  const rows = useMemo<Transaction[]>(() => {
    if (!j.journals?.length) return [];

    return j.journals.map((je) => {
      const dr = je.items.find((i) => i.debit != null);
      const amount = dr?.debit ?? 0;
      const accountName = dr?.account?.name;

      return {
        id: `${je.sequence.prefix}-${String(je.sequence.lastIndex).padStart(4, "0")}`,
        customer: extractCustomerName(accountName),
        date: je.createdAt
          ? new Date(je.createdAt).toISOString().split("T")[0]
          : "",
        typeService: accountName ?? "—",
        total: amount,
        status: toTransactionStatus(je.status),
      };
    });
  }, [j.journals]);

  if (j.loading || profileLoading) {
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
    <>
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setDropdownOpen(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-5">
        <div className="mb-5">
          <h1 className="text-3xl font-semibold text-gray-900">
            Profile Details
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Be a good and honest employee for everyone's happiness
          </p>
        </div>

        <ProfileCard profile={profile} onEditClick={openEdit} />
        <TwoFactorCard />
        {j.error ? (
          <div className="bg-white rounded-2xl border border-gray-150 px-5 py-12 text-center text-sm text-red-500">
            {j.error}
          </div>
        ) : (
          <TransactionTable rows={rows} />
        )}
      </div>

      <EditProfileDialog
        open={editOpen}
        onClose={closeEdit}
        profile={profile}
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
    </>
  );
}
