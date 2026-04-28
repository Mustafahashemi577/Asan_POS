import { Button } from "@/components/ui/button";
import DateInput from "@/components/ui/DateInput";
import GenderDropdown from "@/components/ui/GenderDropdown";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import type { EmployeeInfo } from "@/types/";
import { display, getInitials } from "@/utils/profile.helpers";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// ─── Schema ──────────────────────────────────────────────────────────────────
const schema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    role: z.string().optional(),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional(),
    gender: z.string().optional(),
    dob: z.string().optional(),
    storeName: z.string().optional(),
    oldPassword: z.string().optional(),
    password: z.string().optional(),
  })
  .refine(
    (data) =>
      !(data.password && !data.oldPassword) &&
      !(data.oldPassword && !data.password),
    {
      message: "Both old and new password are required",
      path: ["password"],
    },
  );

type FormValues = z.infer<typeof schema>;

// ─── Props ───────────────────────────────────────────────────────────────────
interface Props {
  profile: EmployeeInfo;
  onSaveSuccess: () => void;
  onEmailChange: (newEmail: string) => void;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function EditProfileForm({
  profile,
  onSaveSuccess,
  onEmailChange,
  onClose,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.imageUrl,
  );

  const [imageRemoved, setImageRemoved] = useState(false);
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  const [attachmentId, setAttachmentId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      role: profile.role ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      gender: profile.gender as FormValues["gender"],
      dob: profile.dob ? profile.dob.split("T")[0] : "",
      storeName: profile.storeName ?? "",
      oldPassword: "",
      password: "",
    },
  });

  console.log("ERRORS", errors);

  const currentEmail = watch("email");
  const currentGender = watch("gender");
  const currentDob = watch("dob");
  const currentFirstName = watch("firstName");

  const onUpload = async (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));
    setImageRemoved(false);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post("/attachments/employee/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAttachmentId(res.data.id); // ✅ store for later claim
    } catch (err) {
      setAttachmentId(null);
      setAvatarPreview(null);

      // 👉 replace with your toast system
      setServerError("Image upload failed");

      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsUploading(false);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (data: FormValues) => {
    setServerError("");
    setSuccess("");

    const formData = new FormData();

    const payload: Partial<FormValues> = {};

    Object.keys(dirtyFields).forEach((key) => {
      const k = key as keyof FormValues;

      if (k === "password" || k === "oldPassword") return;

      payload[k] = data[k];
    });

    if (attachmentId) {
      await api.post("/attachments/employee/claim", {
        id: attachmentId,
      });
    }
    if (imageRemoved) {
      await api.delete("/attachments/img");
    }

    if (data.password && data.oldPassword) {
      payload.oldPassword = data.oldPassword;
      payload.password = data.password;
    }

    const emailChanged = data.email !== profile.email;
    if (emailChanged) formData.append("email", data.email);

    try {
      await api.put("/employees/info", { ...payload, gender: data.gender });

      if (emailChanged) {
        onEmailChange(data.email);
        onClose();
        return;
      }

      setSuccess("Profile updated successfully!");
      // setTimeout(() => {
      onSaveSuccess();
      onClose();
      reset();
      // }, 1200);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError("Failed to save changes.");
      }
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ── Avatar ── */}
      <div className="flex items-center gap-5 mb-4">
        <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-2xl font-semibold">
              {getInitials(profile)}
            </span>
          )}
        </div>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => {
              setAvatarPreview(null);
              setImageRemoved(true);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="text-xs bg-red-50 text-red-400 border border-red-200 px-4 py-1.5 rounded-lg hover:bg-red-100 transition block"
          >
            Remove Image
          </button>
          <p className="text-xs text-gray-400">
            {currentFirstName || profile.name}-Profile.png
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              onUpload(e);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-blue-500 hover:underline"
          >
            Change photo
          </button>
        </div>
      </div>

      {/* ── Row 1: First Name | Last Name | Role ── */}
      <div className="grid grid-cols-3 gap-5 mb-3">
        <div>
          <label className="text-sm text-gray-600 mb-2 block">First Name</label>
          <Input
            {...register("firstName")}
            className="h-10 rounded-xl border-gray-200 text-sm"
          />
          {errors.firstName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Last Name</label>
          <Input
            {...register("lastName")}
            className="h-10 rounded-xl border-gray-200 text-sm"
          />
          {errors.lastName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Role</label>
          <Input
            {...register("role")}
            className="h-10 rounded-xl border-gray-200 text-sm"
          />
        </div>
      </div>

      {/* ── Row 2: Email | Phone | Gender ── */}
      <div className="grid grid-cols-3 gap-5 mb-3">
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Email</label>
          <Input
            type="email"
            {...register("email")}
            className="h-10 rounded-xl border-gray-200 text-sm"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
          {currentEmail !== profile.email && !errors.email && (
            <p className="text-xs text-amber-500 mt-1">
              ⚠ You'll need to verify your new email
            </p>
          )}
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Phone</label>
          <Input
            {...register("phone")}
            className="h-10 rounded-xl border-gray-200 text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Gender</label>
          <GenderDropdown
            value={currentGender ?? ""}
            onChange={(val) => setValue("gender", val as FormValues["gender"])}
          />
        </div>
      </div>

      {/* ── Row 3: Date of Birth | Store Name ── */}
      <div className="grid grid-cols-2 gap-5 mb-3">
        <div>
          <label className="text-sm text-gray-600 mb-2 block">
            Date of Birth
          </label>
          <DateInput
            value={currentDob ?? ""}
            onChange={(val) =>
              setValue("dob", val, {
                shouldDirty: true,
                shouldTouch: true,
              })
            }
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Store Name</label>
          <Input
            {...register("storeName")}
            placeholder={display(profile.storeName)}
            className="h-10 rounded-xl border-gray-200 text-sm"
          />
        </div>
      </div>

      <hr className="border-gray-100 mb-4" />

      {/* ── Change Password ── */}
      <div className="mb-4">
        <div className="mb-3">
          <span className="text-base font-semibold text-gray-800">
            Change Password
          </span>
          <p className="text-xs text-gray-400 mt-0.5">
            Leave blank to keep your current password
          </p>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Old Password
            </label>
            <div className="relative">
              <input
                type={showOldPass ? "text" : "password"}
                {...register("oldPassword")}
                placeholder="Old Password"
                className="w-full h-10 border border-gray-200 rounded-xl px-4 pr-10 text-sm bg-gray-50 outline-none hover:border-gray-300 focus:border-gray-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowOldPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOldPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPass ? "text" : "password"}
                {...register("password")}
                placeholder="New Password"
                className="w-full h-10 border border-gray-200 rounded-xl px-4 pr-10 text-sm bg-gray-50 outline-none hover:border-gray-300 focus:border-gray-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {serverError && (
        <p className="text-red-500 text-sm mb-4">{serverError}</p>
      )}
      {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

      {/* ── Actions ── */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="px-8 h-11 rounded-xl border-gray-200"
          onClick={() => {
            reset();
            onClose();
          }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="px-8 h-11 rounded-xl bg-gray-900 hover:bg-gray-800 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
