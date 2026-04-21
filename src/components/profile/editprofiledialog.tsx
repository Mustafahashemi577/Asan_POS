import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import GenderDropdown from "@/components/ui/GenderDropdown";
import DateInput from "@/components/ui/DateInput";
import api from "@/lib/axios";
import type { EmployeeProfile, EditForm } from "@/types/profile.types";
import { display, getInitials } from "@/utils/profile.helpers";

interface Props {
    open: boolean;
    onClose: () => void;
    profile: EmployeeProfile;
    editForm: EditForm;
    setEditForm: React.Dispatch<React.SetStateAction<EditForm>>;
    onSaveSuccess: () => void;
    onEmailChange: (newEmail: string) => void;
}

export default function EditProfileDialog({
    open, onClose, profile, editForm, setEditForm, onSaveSuccess, onEmailChange,
}: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(profile.imageUrl);
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPreviewAvatar(URL.createObjectURL(file));
    };

    const handleRemoveAvatar = () => {
        setPreviewAvatar(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSave = async () => {
        setError("");
        setSuccess("");
        setSaving(true);
        try {
            const formData = new FormData();

            if (editForm.firstName !== (profile.firstName ?? "")) formData.append("firstName", editForm.firstName);
            if (editForm.lastName !== (profile.lastName ?? "")) formData.append("lastName", editForm.lastName);
            if (editForm.phone !== (profile.phone ?? "")) formData.append("phone", editForm.phone);
            if (editForm.title !== (profile.title ?? "")) formData.append("title", editForm.title);
            if (editForm.gender !== (profile.gender ?? "")) formData.append("gender", editForm.gender);
            if (editForm.dob !== (profile.dob ? profile.dob.split("T")[0] : "")) formData.append("dob", editForm.dob);
            if (editForm.storeName !== (profile.storeName ?? "")) formData.append("storeName", editForm.storeName);
            if (newPassword && oldPassword) formData.append("password", newPassword);
            if (fileInputRef.current?.files?.[0]) formData.append("image", fileInputRef.current.files[0]);

            const emailChanged = editForm.email !== profile.email;
            if (emailChanged) formData.append("email", editForm.email);

            await api.put("/auth/update-employee-info", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (emailChanged) {
                onEmailChange(editForm.email);
                setSaving(false);
                onClose();
                return;
            }

            setSuccess("Profile updated successfully!");
            setTimeout(() => { onSaveSuccess(); onClose(); setSuccess(""); }, 1200);
        } catch (err: any) {
            const msg = err?.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : msg || "Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent
                className="rounded-2xl p-0 overflow-hidden"
                style={{ maxWidth: "min(85vw, 1000px)", width: "85vw" }}
            >
                <div className="p-7">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-lg font-semibold">Edit Profile</DialogTitle>
                        <p className="text-xs text-gray-400">Change Profile</p>
                    </DialogHeader>

                    {/* Avatar */}
                    <div className="flex items-center gap-5 mb-4">
                        <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                            {previewAvatar
                                ? <img src={previewAvatar} alt="avatar" className="w-full h-full object-cover" />
                                : <span className="text-gray-500 text-2xl font-semibold">{getInitials(profile)}</span>}
                        </div>
                        <div className="space-y-1.5">
                            <button onClick={handleRemoveAvatar}
                                className="text-xs bg-red-50 text-red-400 border border-red-200 px-4 py-1.5 rounded-lg hover:bg-red-100 transition block">
                                Remove Image
                            </button>
                            <p className="text-xs text-gray-400">{editForm.firstName || profile.name}-Profile.png</p>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            <button onClick={() => fileInputRef.current?.click()} className="text-xs text-blue-500 hover:underline">
                                Change photo
                            </button>
                        </div>
                    </div>

                    {/* Row 1: Name | Last Name | Role */}
                    <div className="grid grid-cols-3 gap-5 mb-3">
                        <div>
                            <label className="text-sm text-gray-600 mb-2 block">First Name</label>
                            <Input value={editForm.firstName} className="h-10 rounded-xl border-gray-200 text-sm"
                                onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-2 block">Last Name</label>
                            <Input value={editForm.lastName} className="h-10 rounded-xl border-gray-200 text-sm"
                                onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-2 block">Role</label>
                            <Input value={editForm.title} className="h-10 rounded-xl border-gray-200 text-sm"
                                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} />
                        </div>
                    </div>

                    {/* Row 2: Email | Phone | Gender */}
                    <div className="grid grid-cols-3 gap-5 mb-3">
                        <div>
                            <label className="text-sm text-gray-600 mb-2 block">Email</label>
                            <Input type="email" value={editForm.email} className="h-10 rounded-xl border-gray-200 text-sm"
                                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
                            {editForm.email !== profile.email && (
                                <p className="text-xs text-amber-500 mt-1">⚠ You'll need to verify your new email</p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-2 block">Phone</label>
                            <Input value={editForm.phone} className="h-10 rounded-xl border-gray-200 text-sm"
                                placeholder={display(profile.phone)}
                                onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-2 block">Gender</label>
                            <GenderDropdown value={editForm.gender} onChange={(val) => setEditForm((p) => ({ ...p, gender: val }))} />
                        </div>
                    </div>

                    {/* Row 3: DOB | Store */}
                    <div className="grid grid-cols-2 gap-5 mb-3">
                        <div>
                            <label className="text-sm text-gray-600 mb-2 block">Date of Birth</label>
                            <DateInput value={editForm.dob} onChange={(val) => setEditForm((p) => ({ ...p, dob: val }))} />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-2 block">Store Name</label>
                            <Input value={editForm.storeName} className="h-10 rounded-xl border-gray-200 text-sm"
                                placeholder={display(profile.storeName)}
                                onChange={(e) => setEditForm((p) => ({ ...p, storeName: e.target.value }))} />
                        </div>
                    </div>

                    <hr className="border-gray-100 mb-4" />

                    {/* Password */}
                    <div className="mb-4">
                        <div className="mb-3">
                            <span className="text-base font-semibold text-gray-800">Change Password</span>
                            <p className="text-xs text-gray-400 mt-0.5">Leave blank to keep your current password</p>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">Old Password</label>
                                <div className="relative">
                                    <input type={showOldPass ? "text" : "password"} value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)} placeholder="Old Password"
                                        className="w-full h-10 border border-gray-200 rounded-xl px-4 pr-10 text-sm bg-gray-50 outline-none hover:border-gray-300 focus:border-gray-400 transition-colors" />
                                    <button type="button" onClick={() => setShowOldPass((p) => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showOldPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">New Password</label>
                                <div className="relative">
                                    <input type={showNewPass ? "text" : "password"} value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password"
                                        className="w-full h-10 border border-gray-200 rounded-xl px-4 pr-10 text-sm bg-gray-50 outline-none hover:border-gray-300 focus:border-gray-400 transition-colors" />
                                    <button type="button" onClick={() => setShowNewPass((p) => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

                    <div className="flex gap-3">
                        <Button variant="outline" className="px-8 h-11 rounded-xl border-gray-200"
                            onClick={onClose} disabled={saving}>Cancel</Button>
                        <Button className="px-8 h-11 rounded-xl bg-gray-900 hover:bg-gray-800 text-white"
                            onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}