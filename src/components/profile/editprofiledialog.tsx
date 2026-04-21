import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EmployeeProfile } from "@/types/profile.types";
import EditProfileForm from "./editprofileform";

interface Props {
  open: boolean;
  onClose: () => void;
  profile: EmployeeProfile;
  onSaveSuccess: () => void;
  onEmailChange: (newEmail: string) => void;
}

export default function EditProfileDialog({
  open,
  onClose,
  profile,
  onSaveSuccess,
  onEmailChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="rounded-2xl p-0 overflow-hidden"
        style={{ maxWidth: "min(85vw, 1000px)", width: "85vw" }}
      >
        <div className="p-7">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-semibold">
              Edit Profile
            </DialogTitle>
            <p className="text-xs text-gray-400">Change Profile</p>
          </DialogHeader>

          <EditProfileForm
            profile={profile}
            onSaveSuccess={onSaveSuccess}
            onEmailChange={onEmailChange}
            onClose={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
