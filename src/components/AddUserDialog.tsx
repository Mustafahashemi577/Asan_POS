import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import type { Value as PhoneValue } from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PhoneNumberInput } from "@/components/ui/phoneinput";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Eye, EyeOff, UserPlus } from "lucide-react";

import { Label } from "@/components/ui/label";
import type { UserRole } from "@/types/user";
// ─── Schema ───────────────────────────────────────────────────────────────────

const userSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    username: z.string().min(1, "Username is required"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .refine((val) => isValidPhoneNumber(val), "Enter a valid phone number"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    role: z.enum(["Admin", "Cashier", "Accountant"] as const),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UserFormValues = z.infer<typeof userSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const USER_ROLES: UserRole[] = ["Admin", "Cashier", "Accountant"];

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddUserDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddUserDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      phone: "",
      role: "Cashier",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset();
      setShowPassword(false);
      setShowConfirm(false);
    }
  }, [open, reset]);

  const handleFormSubmit = async (values: UserFormValues) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        const message: string =
          err.response.data?.message ?? "Username already in use";
        setError("username", { type: "server", message });
      } else {
        throw err;
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <span className="flex items-center justify-start gap-2 text-lg font-semibold">
            <UserPlus className="mb-2 h-5 w-5" />

            <DialogTitle>Add User</DialogTitle>
          </span>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 mt-2"
          noValidate
        >
          {/* First name + Last name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">First Name</Label>
              <div className="relative">
                <Input
                  {...register("firstName")}
                  placeholder="John"
                  className="pl-3 h-11 rounded-xl border-gray-200"
                />
              </div>
              {errors.firstName && (
                <p className="text-xs text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Last Name</Label>
              <div className="relative">
                <Input
                  {...register("lastName")}
                  placeholder="Doe"
                  className="pl-3 h-11 rounded-xl border-gray-200"
                />
              </div>
              {errors.lastName && (
                <p className="text-xs text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Username</Label>
            <Input
              placeholder="johndoe"
              className="h-11 rounded-xl border-gray-200"
            />
            {errors.username && (
              <p className="text-xs text-red-500">{errors.username.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Phone Number</Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneNumberInput
                  value={field.value as PhoneValue}
                  placeholder="700 000 000"
                  onChange={(val) => field.onChange(val ?? "")}
                  error={!!errors.phone}
                />
              )}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Email</Label>
            <Input
              {...register("email")}
              type="email"
              placeholder="john.doe@example.com"
              className="h-11 rounded-xl border-gray-200"
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Role</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11 rounded-xl border-gray-200">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                className="h-11 rounded-xl border-gray-200 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Confirm Password</Label>
            <div className="relative">
              <Input
                {...register("confirmPassword")}
                type={showConfirm ? "text" : "password"}
                placeholder="••••••"
                className={`h-11 rounded-xl border-gray-200 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-black hover:bg-black/90"
          >
            {isSubmitting ? "Adding…" : "Add User"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
