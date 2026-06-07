import { useEffect, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import type { Value as PhoneValue } from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

import DateInput from "@/components/ui/DateInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneNumberInput } from "@/components/ui/phoneinput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { CheckCircle2, Copy, Eye, EyeOff, UserPlus } from "lucide-react";

import type { UserRole } from "@/types/user";

// ─── Schema ───────────────────────────────────────────────────────────────────

const userSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    name: z.string().min(3, "First Name is required"),
    lastName: z.string().min(3, "Last Name is required"),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || isValidPhoneNumber(val),
        "Enter a valid phone number",
      ),
    gender: z.enum(["male", "female", "Other"] as const).optional(),
    dob: z.string().optional(),
    role: z.enum(["Cashier"] as const).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UserFormValues = z.infer<typeof userSchema>;

// ─── Edit schema (password optional) ─────────────────────────────────────────

const editUserSchema = z.object({
  firstName: z.string().min(3, "First Name is required"),
  lastName: z.string().min(3, "Last Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || isValidPhoneNumber(val),
      "Enter a valid phone number",
    ),
  gender: z.enum(["male", "female", "Other"] as const).optional(),
  dob: z.string().optional(),
  role: z.enum(["Cashier"] as const).optional(),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;

const USER_ROLES: UserRole[] = ["Cashier"];

// ─── Credentials dialog ───────────────────────────────────────────────────────

interface CredentialsDialogProps {
  open: boolean;
  onClose: () => void;
  email: string;
  password: string;
}

function CredentialsDialog({
  open,
  onClose,
  email,
  password,
}: CredentialsDialogProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const copy = (text: string, which: "email" | "password") => {
    navigator.clipboard.writeText(text);
    if (which === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <span className="flex items-center gap-2 text-lg font-semibold">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <DialogTitle>User Created</DialogTitle>
          </span>
        </DialogHeader>

        <div className="space-y-4 mt-1">
          <p className="text-sm text-gray-500">
            User can login with the following credentials:
          </p>

          {(["email", "password"] as const).map((field) => {
            const isPassword = field === "password";
            const copied = isPassword ? copiedPassword : copiedEmail;
            const value = isPassword ? password : email;
            const display =
              isPassword && !showPassword ? "•".repeat(password.length) : value;

            return (
              <div key={field} className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {field}
                </Label>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                  <span
                    className={`flex-1 text-sm font-medium text-gray-800 break-all ${isPassword ? "font-mono tracking-widest" : ""}`}
                  >
                    {display}
                  </span>
                  {isPassword && (
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => copy(value, field)}
                    className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {copied ? (
                      <CheckCircle2 size={15} className="text-green-500" />
                    ) : (
                      <Copy size={15} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            Make sure to share these credentials with the user now. The password
            won't be shown again.
          </p>

          <Button
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-black hover:bg-black/90"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add User Dialog ──────────────────────────────────────────────────────────

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

export function AddUserDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddUserDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const nameEditedRef = useRef(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      lastName: "",
      phone: "",
      role: "Cashier",
      gender: "male",
      dob: "",
    },
  });

  const {
    handleSubmit,
    reset,
    control,
    setError,
    formState: { isSubmitting },
  } = form;

  useEffect(() => {
    if (open) {
      reset();
      setShowPassword(false);
      setShowConfirm(false);
      nameEditedRef.current = false;
    }
  }, [open, reset]);

  const handleFormSubmit = async (values: UserFormValues) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
      setCredentials({ email: values.email, password: values.password });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        const message: string =
          err.response.data?.message ?? "Email already in use";
        setError("email", { type: "server", message });
      } else {
        throw err;
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <span className="flex items-center justify-start gap-2 text-lg font-semibold">
              <UserPlus className="h-5 w-5" />
              <DialogTitle>Add User</DialogTitle>
            </span>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-4 mt-2"
              noValidate
            >
              {/* First + Last name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(["name", "lastName"] as const).map((field) => (
                  <FormField
                    key={field}
                    control={control}
                    name={field}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>
                          {field === "name" ? "First Name" : "Last Name"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...f}
                            placeholder={field === "name" ? "John" : "Doe"}
                            className="h-11 rounded-xl border-gray-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {/* Email */}
              <FormField
                control={control}
                name="email"
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...f}
                        type="email"
                        placeholder="john.doe@example.com"
                        className="h-11 rounded-xl border-gray-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date of Birth */}
              <FormField
                control={form.control}
                name="dob"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <DateInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={control}
                name="phone"
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <PhoneNumberInput
                        value={f.value as PhoneValue}
                        placeholder="700 000 000"
                        onChange={(val) => f.onChange(val ?? "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role + Gender */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={control}
                  name="role"
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select value={f.value} onValueChange={f.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl border-gray-200">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {USER_ROLES.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="gender"
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>
                        Gender{" "}
                        <span className="text-gray-500 font-normal">
                          (Optional)
                        </span>
                      </FormLabel>
                      <Select value={f.value} onValueChange={f.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl border-gray-200">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Password + Confirm */}
              {(
                [
                  {
                    name: "password",
                    label: "Password",
                    show: showPassword,
                    toggle: () => setShowPassword((v) => !v),
                  },
                  {
                    name: "confirmPassword",
                    label: "Confirm Password",
                    show: showConfirm,
                    toggle: () => setShowConfirm((v) => !v),
                  },
                ] as const
              ).map(({ name, label, show, toggle }) => (
                <FormField
                  key={name}
                  control={control}
                  name={name}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...f}
                            type={show ? "text" : "password"}
                            placeholder="••••••"
                            className="h-11 rounded-xl border-gray-200 pr-10"
                          />
                          <button
                            type="button"
                            onClick={toggle}
                            tabIndex={-1}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {show ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-black hover:bg-black/90"
              >
                {isSubmitting ? "Adding…" : "Add User"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {credentials && (
        <CredentialsDialog
          open={!!credentials}
          onClose={() => setCredentials(null)}
          email={credentials.email}
          password={credentials.password}
        />
      )}
    </>
  );
}

// ─── Edit User Dialog ─────────────────────────────────────────────────────────

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    name: string;
    lastName: string;
    email: string;
    phone?: string;
    role?: UserRole;
    gender?: "male" | "female" | "Other";
    dob?: string;
  } | null;
  isLoading?: boolean;
  onSubmit: (id: string, values: EditUserFormValues) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  isLoading = false,
  onSubmit,
  onDelete,
}: EditUserDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "Cashier",
      gender: "male",
      dob: "",
    },
  });

  const {
    handleSubmit,
    reset,
    control,
    setError,
    formState: { isSubmitting },
  } = form;

  // Populate form when a user is selected
  useEffect(() => {
    if (open && user) {
      reset({
        firstName: user.name ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        role: "Cashier",
        gender: user.gender ?? "male",
        dob: user.dob ?? "",
      });
    }
  }, [open, user, reset]);

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await onDelete(user.id);
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSubmit = async (values: EditUserFormValues) => {
    if (!user) return;
    try {
      await onSubmit(user.id, values);
      onOpenChange(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        const message: string =
          err.response.data?.message ?? "Email already in use";
        setError("email", { type: "server", message });
      } else {
        throw err;
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <span className="flex items-center justify-start gap-2 text-lg font-semibold">
            <UserPlus className="h-5 w-5" />
            <DialogTitle>Edit User</DialogTitle>
          </span>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 mt-2 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3.5 w-24 bg-gray-100 rounded" />
                <div className="h-11 w-full bg-gray-100 rounded-xl" />
              </div>
            ))}
            <div className="h-11 w-full bg-gray-100 rounded-xl mt-2" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-4 mt-2"
              noValidate
            >
              {/* First + Last name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(["firstName", "lastName"] as const).map((field) => (
                  <FormField
                    key={field}
                    control={control}
                    name={field}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>
                          {field === "firstName" ? "First Name" : "Last Name"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...f}
                            placeholder={field === "firstName" ? "John" : "Doe"}
                            className="h-11 rounded-xl border-gray-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {/* Email */}
              <FormField
                control={control}
                name="email"
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...f}
                        type="email"
                        placeholder="john.doe@example.com"
                        className="h-11 rounded-xl border-gray-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date of Birth */}
              <FormField
                control={form.control}
                name="dob"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <DateInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={control}
                name="phone"
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <PhoneNumberInput
                        value={f.value as PhoneValue}
                        placeholder="700 000 000"
                        onChange={(val) => f.onChange(val ?? "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role + Gender */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={control}
                  name="role"
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select value={f.value} onValueChange={f.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl border-gray-200">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {USER_ROLES.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="gender"
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>
                        Gender{" "}
                        <span className="text-gray-500 font-normal">
                          (Optional)
                        </span>
                      </FormLabel>
                      <Select value={f.value} onValueChange={f.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl border-gray-200">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={deleting || isSubmitting}
                  onClick={handleDelete}
                  className="flex-1 h-11 rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                >
                  {deleting ? "Deleting…" : "Delete User"}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || deleting}
                  className="flex-1 h-11 rounded-xl bg-black hover:bg-black/90"
                >
                  {isSubmitting ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Default export (Add) ─────────────────────────────────────────────────────

export default AddUserDialog;
