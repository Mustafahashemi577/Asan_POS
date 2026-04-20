import GenderDropdown from "@/components/ui/GenderDropdown";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Bell, ChevronDown, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/axios";
import useSWR from "swr";
import DateInput from "@/components/ui/DateInput";

// ─── SWR fetcher ─────────────────────────────────────────────────────────────
const fetcher = (url: string) => api.get(url).then((res) => res.data);

// ─── Types ───────────────────────────────────────────────────────────────────
interface EmployeeProfile {
    id: string;
    email: string;
    name: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    title: string | null;
    imageUrl: string | null;
    dob: string | null;
    gender: string | null;
    storeName: string | null;
    createdAt: string | null;
}

interface EditForm {
    firstName: string;
    lastName: string;
    email: string;
    title: string;
    phone: string;
    imageUrl: string;
    gender: string;
    dob: string;
    storeName: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
// Shows "..." for null/empty values
const display = (val: string | null | undefined) =>
    val && val.trim() !== "" ? val : "...";

const formatDate = (val: string | null | undefined) => {
    if (!val) return "...";
    try {
        return new Date(val).toLocaleDateString("en-US", {
            month: "2-digit", day: "2-digit", year: "numeric",
        });
    } catch { return "..."; }
};

const getInitials = (profile: EmployeeProfile) => {
    if (profile.firstName && profile.lastName)
        return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    if (profile.name) return profile.name.slice(0, 2).toUpperCase();
    return "??";
};

// ─── Static mock data (replace with real API later) ──────────────────────────
const stats = [
    { label: "Order Process", value: "5", pct: "0,5%", pctColor: "text-green-400", date: "Yesterday, 26 Mar 2024", sub: "1,300" },
    { label: "Order Done", value: "40", pct: "", pctColor: "", date: "Yesterday, 26 Mar 2024", sub: "70" },
    { label: "Total Order", value: "120", pct: "", pctColor: "", date: "Yesterday, 26 Mar 2024", sub: "170" },
    { label: "Total Income", value: "$1.200,00", pct: "0,5%", pctColor: "text-green-400", date: "Yesterday, 26 Mar 2024", sub: "$1,234.00" },
];

const transactions = [
    { id: "21239172AKS231", customer: "Deni Setiawan", type: "Delivery", total: "Rp. 220,000.00", status: "Complited" },
    { id: "21239172AKS232", customer: "Nemaanestina", type: "Take Away", total: "Rp. 200,000.00", status: "Complited" },
    { id: "21239172AKS233", customer: "Dina Septiani", type: "Dine In", total: "Rp. 119,000.00", status: "Complited" },
    { id: "21239172AKS234", customer: "Relastini", type: "Dine In", total: "Rp. 98,000.00", status: "Complited" },
    { id: "21239172AKS234", customer: "Vikeski", type: "Dine In", total: "Rp. 88,000.00", status: "Declned" },
    { id: "21239172AKS234", customer: "Puree Adi", type: "Dine In", total: "Rp. 67,000.00", status: "Complited" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // ── Fetch employee data from GET /auth/me ──────────────────────────────────
    const { data: profile, isLoading, error: fetchError, mutate } = useSWR<EmployeeProfile>(
        "/auth/me",
        fetcher,
        { revalidateOnFocus: false }
    );

    // ── Edit modal state ───────────────────────────────────────────────────────
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState<EditForm>({
        firstName: "", lastName: "", title: "", email: "", phone: "",
        gender: "", dob: "", storeName: "", imageUrl: "",
    });
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ── Email OTP state ────────────────────────────────────────────────────────
    const [otpOpen, setOtpOpen] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [pendingEmail, setPendingEmail] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState("");

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    const openEdit = () => {
        if (!profile) return;
        setEditForm({
            firstName: profile.firstName ?? "",
            lastName: profile.lastName ?? "",
            title: profile.title ?? "",
            email: profile.email ?? "",
            phone: profile.phone ?? "",
            gender: profile.gender ?? "",
            dob: profile.dob ? profile.dob.split("T")[0] : "",
            storeName: profile.storeName ?? "",
            imageUrl: profile.imageUrl ?? "",
        });
        setPreviewAvatar(profile.imageUrl);
        setOldPassword("");
        setNewPassword("");
        setError("");
        setSuccess("");
        setEditOpen(true);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPreviewAvatar(URL.createObjectURL(file));
    };

    const handleRemoveAvatar = () => {
        setPreviewAvatar(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ── Save — calls PUT /auth/update-employee-info ────────────────────────────
    const handleSave = async () => {
        if (!profile) return;
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            // ← Use FormData instead of JSON because backend uses FileInterceptor
            const formData = new FormData();

            if (editForm.firstName !== (profile.firstName ?? "")) formData.append("firstName", editForm.firstName);
            if (editForm.lastName !== (profile.lastName ?? "")) formData.append("lastName", editForm.lastName);
            if (editForm.phone !== (profile.phone ?? "")) formData.append("phone", editForm.phone);
            if (editForm.title !== (profile.title ?? "")) formData.append("title", editForm.title);
            if (editForm.gender !== (profile.gender ?? "")) formData.append("gender", editForm.gender);
            if (editForm.dob !== (profile.dob ? profile.dob.split("T")[0] : "")) formData.append("dob", editForm.dob);
            if (editForm.storeName !== (profile.storeName ?? "")) formData.append("storeName", editForm.storeName);
            if (newPassword && oldPassword) formData.append("password", newPassword);

            // ← Append the actual image file if user selected one
            if (fileInputRef.current?.files?.[0]) {
                formData.append("image", fileInputRef.current.files[0]);
            }

            const emailChanged = editForm.email !== profile.email;
            if (emailChanged) formData.append("email", editForm.email);

            // ← Send as multipart/form-data — axios sets Content-Type automatically
            await api.put("/employees/info", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (emailChanged) {
                setPendingEmail(editForm.email);
                setEditOpen(false);
                setOtpCode("");
                setOtpError("");
                setOtpOpen(true);
                setSaving(false);
                return;
            }

            await mutate();
            setSuccess("Profile updated successfully!");
            setTimeout(() => { setEditOpen(false); setSuccess(""); }, 1200);
        } catch (err: any) {
            const msg = err?.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : msg || "Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    // ── Verify new email OTP ───────────────────────────────────────────────────
    const handleVerifyOtp = async () => {
        setOtpError("");
        setOtpLoading(true);
        try {
            await api.post("/employees/verify-updated-email", { email: pendingEmail, code: otpCode });
            await mutate(); // refresh profile from server
            setOtpOpen(false);
            setOtpCode("");
            setPendingEmail("");
        } catch (err: any) {
            const msg = err?.response?.data?.message;
            setOtpError(Array.isArray(msg) ? msg[0] : msg || "Invalid OTP code.");
        } finally {
            setOtpLoading(false);
        }
    };

    // ── Date/time for navbar ───────────────────────────────────────────────────
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
        weekday: "long", day: "2-digit", month: "short", year: "numeric",
    });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    // ── Display values (null → "...") ─────────────────────────────────────────
    const displayName = profile
        ? (profile.firstName && profile.lastName)
            ? `${profile.firstName} ${profile.lastName}`
            : display(profile.name)
        : "...";

    // ── Loading state ──────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    <p className="text-sm text-gray-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-sm text-red-500">Failed to load profile. Please refresh the page.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Top Navbar ── */}
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
                            <button key={item.label} onClick={() => navigate(item.path)}
                                className="text-sm text-gray-500 hover:text-gray-900 transition">
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2">
                        <Calendar size={13} className="text-gray-400" />
                        <span>{dateStr} at {timeStr}</span>
                    </div>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition">
                        <Bell size={14} className="text-gray-500" />
                    </button>

                    {/* User dropdown */}
                    <div className="relative">
                        <button onClick={() => setDropdownOpen((p) => !p)}
                            className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition">
                            <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-xs font-semibold text-white shrink-0 overflow-hidden">
                                {profile?.imageUrl
                                    ? <img src={profile.imageUrl} alt="" className="w-full h-full object-cover" />
                                    : profile ? getInitials(profile) : "??"}
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-medium text-gray-800 leading-none mb-0.5">{displayName}</p>
                                <p className="text-[10px] text-gray-400 leading-none">{display(profile?.email)}</p>
                            </div>
                            <ChevronDown size={13} className="text-gray-400" />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-gray-100 shadow-lg z-30 overflow-hidden">
                                <button onClick={() => { setDropdownOpen(false); navigate("/profile"); }}
                                    className="w-full text-left text-sm text-gray-700 px-4 py-2.5 hover:bg-gray-50 transition">
                                    View Profile
                                </button>
                                <button onClick={() => { setDropdownOpen(false); openEdit(); }}
                                    className="w-full text-left text-sm text-gray-700 px-4 py-2.5 hover:bg-gray-50 transition">
                                    Edit Profile
                                </button>
                                <hr className="border-gray-100" />
                                <button onClick={handleLogout}
                                    className="w-full text-left text-sm text-red-500 px-4 py-2.5 hover:bg-red-50 transition">
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {dropdownOpen && <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />}

            {/* ── Page Content ── */}
            <div className="max-w-7xl mx-auto px-6 py-8">

                <div className="mb-5">
                    <h1 className="text-3xl font-semibold text-gray-900">Detail Profile</h1>
                    <p className="text-sm text-gray-400 mt-1">Be a good and honest employee for everyone's happiness</p>
                </div>

                {/* ── Dark Profile Card ── */}
                <div className="bg-[#0f1117] rounded-2xl p-6 mb-5">
                    <div className="flex items-start justify-between mb-6">

                        {/* Avatar + name */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-600 overflow-hidden flex items-center justify-center shrink-0">
                                {profile?.imageUrl
                                    ? <img src={profile.imageUrl} alt={displayName} className="w-full h-full object-cover" />
                                    : <span className="text-white text-xl font-semibold">{profile ? getInitials(profile) : "??"}</span>}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-white font-semibold text-lg">{displayName}</span>
                                    {profile?.gender && (
                                        <span className="text-xs bg-white/15 text-gray-300 px-2 py-0.5 rounded-full capitalize">
                                            {profile.gender}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-400 text-sm mb-3">{display(profile?.email)}</p>
                                <button onClick={openEdit}
                                    className="text-xs border border-white/25 text-gray-300 px-4 py-1.5 rounded-lg hover:bg-white/10 transition">
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        {/* Right meta */}
                        <div className="text-right">
                            <div className="flex items-center gap-2 justify-end mb-4">
                                <span className="text-gray-500 text-xs">Birthday</span>
                                <span className="text-white text-xs">{formatDate(profile?.dob)}</span>
                            </div>
                            <div className="flex items-center gap-0 divide-x divide-white/15">
                                <div className="text-center px-5">
                                    <p className="text-gray-500 text-[10px] mb-1">First seen</p>
                                    <p className="text-white text-xs">{formatDate(profile?.createdAt)}</p>
                                </div>
                                <div className="text-center px-5">
                                    <p className="text-gray-500 text-[10px] mb-1">Position</p>
                                    <p className="text-white text-xs">{display(profile?.title)}</p>
                                </div>
                                <div className="text-center px-5">
                                    <p className="text-gray-500 text-[10px] mb-1">Store</p>
                                    <p className="text-white text-xs">{display(profile?.storeName)}</p>
                                </div>
                            </div>
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
                                        <span className={`text-xs font-medium ${stat.pctColor} bg-green-400/10 px-1.5 py-0.5 rounded`}>
                                            {stat.pct}
                                        </span>
                                    )}
                                </div>
                                <hr className="border-white/10 mb-2" />
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 text-[10px]">{stat.date}</span>
                                    <span className="text-gray-400 text-xs">{stat.sub}</span>
                                </div>
                                <button className="text-gray-500 text-[10px] mt-1.5 hover:text-gray-300 transition block">View all</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Recent Transaction ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 outline-none">
                                <option>All Transaction</option>
                            </select>
                            <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 outline-none">
                                <option>All Category</option>
                            </select>
                        </div>
                        <input placeholder="Cari Transaksi..."
                            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none w-44 text-gray-600" />
                    </div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">Recent Transaction</h3>
                        <button className="text-xs text-blue-500 hover:underline">View all</button>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {["Id Transaksi", "Customer", "Type Services", "Total Belanja", "Status", "Action"].map((h) => (
                                    <th key={h} className="text-left text-xs text-gray-400 font-medium py-2 pr-4">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((row, i) => (
                                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                    <td className="py-3 text-xs text-gray-600 pr-4">{row.id}</td>
                                    <td className="py-3 text-xs text-gray-800 pr-4">{row.customer}</td>
                                    <td className="py-3 text-xs text-gray-600 pr-4">{row.type}</td>
                                    <td className="py-3 text-xs text-gray-800 pr-4">{row.total}</td>
                                    <td className="py-3 pr-4">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.status === "Complited" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                                            }`}>{row.status}</span>
                                    </td>
                                    <td className="py-3">
                                        <button className="text-xs text-blue-500 hover:underline">View Receipt</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Edit Profile Dialog ── */}
            {/* ── Edit Profile Dialog ──
          Replace your existing <Dialog open={editOpen}> block with this
      */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent
                    className="rounded-2xl p-0 overflow-hidden"
                    style={{ maxWidth: "min(85vw, 1000px)", width: "85vw" }}                >
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
                                    : <span className="text-gray-500 text-2xl font-semibold">
                                        {profile ? getInitials(profile) : "??"}
                                    </span>}
                            </div>
                            <div className="space-y-1.5">
                                <button onClick={handleRemoveAvatar}
                                    className="text-xs bg-red-50 text-red-400 border border-red-200 px-4 py-1.5 rounded-lg hover:bg-red-100 transition block">
                                    Remove Image
                                </button>
                                <p className="text-xs text-gray-400">{editForm.firstName || profile?.name}-Profile.png</p>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                <button onClick={() => fileInputRef.current?.click()} className="text-xs text-blue-500 hover:underline">
                                    Change photo
                                </button>
                            </div>
                        </div>

                        {/* Row 1: First Name | Last Name | Gender */}
                        <div className="grid grid-cols-3 gap-5 mb-3">
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">Name</label>
                                <Input
                                    value={editForm.firstName}
                                    onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))}
                                    className="h-10 rounded-xl border-gray-200 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">Last Name</label>
                                <Input
                                    value={editForm.lastName}
                                    onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))}
                                    className="h-10 rounded-xl border-gray-200 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">Role</label>
                                <Input
                                    value={editForm.title}
                                    onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                                    className="h-10 rounded-xl border-gray-200 text-sm"
                                />
                            </div>
                        </div>

                        {/* Row 2: Email | Phone */}
                        <div className="grid grid-cols-3 gap-5 mb-3">
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">Email</label>
                                <Input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                                    className="h-10 rounded-xl border-gray-200 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">Phone</label>
                                <Input
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                                    className="h-10 rounded-xl border-gray-200 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">Gender</label>
                                <GenderDropdown
                                    value={editForm.gender}
                                    onChange={(val) => setEditForm((p) => ({ ...p, gender: val }))}
                                />
                            </div>
                        </div>

                        {/* Row 3: Date of Birth | Store Name */}
                        <div className="grid grid-cols-2 gap-5 mb-3">
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">Date of Birth</label>
                                {/*
                  Native date picker popup also cannot be fully styled with CSS.
                  We use a custom date input that matches the Input style.
                */}
                                <DateInput
                                    value={editForm.dob}
                                    onChange={(val) => setEditForm((p) => ({ ...p, dob: val }))}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">Store Name</label>
                                <Input
                                    value={editForm.storeName}
                                    placeholder={display(profile?.storeName)}
                                    onChange={(e) => setEditForm((p) => ({ ...p, storeName: e.target.value }))}
                                    className="h-10 rounded-xl border-gray-200 text-sm"
                                />
                            </div>
                        </div>

                        {/* Divider */}
                        <hr className="border-gray-100 mb-4" />

                        {/* Change Password */}
                        <div className="mb-4">
                            <div className="mb-4">
                                <span className="text-base font-semibold text-gray-800">Change Password</span>
                                <p className="text-xs text-gray-400 mt-0.5">Leave blank to keep your current password</p>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">Old Password</label>
                                    <div className="relative">
                                        <input
                                            type={showOldPass ? "text" : "password"}
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            placeholder="Old Password"
                                            className="w-full h-12 border border-gray-200 rounded-xl px-4 pr-10 text-sm bg-gray-50 outline-none hover:border-gray-300 focus:border-gray-400 transition-colors"
                                        />
                                        <button type="button" onClick={() => setShowOldPass((p) => !p)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showOldPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPass ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="New Password"
                                            className="w-full h-12 border border-gray-200 rounded-xl px-4 pr-10 text-sm bg-gray-50 outline-none hover:border-gray-300 focus:border-gray-400 transition-colors"
                                        />
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
                                onClick={() => setEditOpen(false)} disabled={saving}>
                                Cancel
                            </Button>
                            <Button className="px-8 h-11 rounded-xl bg-gray-900 hover:bg-gray-800 text-white"
                                onClick={handleSave} disabled={saving}>
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Email OTP Dialog ── */}
            <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
                <DialogContent className="max-w-sm rounded-2xl p-6">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-base font-semibold">Verify New Email</DialogTitle>
                        <p className="text-xs text-gray-400">
                            We sent a verification code to{" "}
                            <span className="text-gray-800 font-medium">{pendingEmail}</span>
                        </p>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-500 mb-1.5 block">Enter OTP Code</label>
                            <Input type="text" inputMode="numeric" maxLength={6} value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                                placeholder="123456" className="text-center text-lg tracking-[0.5em] h-11" autoFocus />
                        </div>
                        {otpError && <p className="text-red-500 text-xs">{otpError}</p>}
                        <Button className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white"
                            onClick={handleVerifyOtp} disabled={otpLoading || otpCode.length < 6}>
                            {otpLoading ? "Verifying..." : "Verify & Save"}
                        </Button>
                        <button onClick={() => { setOtpOpen(false); setOtpCode(""); }}
                            className="w-full text-xs text-gray-400 hover:text-gray-600 transition">
                            Cancel
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}