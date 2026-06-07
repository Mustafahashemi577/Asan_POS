import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import type { Value as PhoneValue } from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import useSWR from "swr";
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

import { Eye, EyeOff, UserCog } from "lucide-react";

import { getUser } from "@/queries/user";
import type { User } from "@/types/user";

// ─── Schema ───────────────────────────────────────────────────────────────────

const MIN_AGE = 16;

const editUserSchema = z
  .object({
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
    dob: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true;
        const birth = new Date(val);
        const today = new Date();
        const age =
          today.getFullYear() -
          birth.getFullYear() -
          (today <
          new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
            ? 1
            : 0);
        return age >= MIN_AGE;
      }, `User must be at least ${MIN_AGE} years old`),
    // Password fields — all optional, but if any is filled, all are required
    oldPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      const any =
        data.oldPassword || data.newPassword || data.confirmNewPassword;
      if (!any) return true;
      return !!data.oldPassword && data.oldPassword.length >= 1;
    },
    {
      message: "Current password is required to change password",
      path: ["oldPassword"],
    },
  )
  .refine(
    (data) => {
      const any =
        data.oldPassword || data.newPassword || data.confirmNewPassword;
      if (!any) return true;
      return !!data.newPassword && data.newPassword.length >= 6;
    },
    {
      message: "New password must be at least 6 characters",
      path: ["newPassword"],
    },
  )
  .refine(
    (data) => {
      const any =
        data.oldPassword || data.newPassword || data.confirmNewPassword;
      if (!any) return true;
      return data.newPassword === data.confirmNewPassword;
    },
    { message: "Passwords do not match", path: ["confirmNewPassword"] },
  );

export type EditUserFormValues = z.infer<typeof editUserSchema>;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FormSkeleton() {
  return (
    <div className="space-y-3 mt-2 animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-3.5 w-24 bg-gray-100 rounded" />
          <div className="h-11 w-full bg-gray-100 rounded-xl" />
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <div className="h-11 flex-1 bg-gray-100 rounded-xl" />
        <div className="h-11 flex-1 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  onSubmit: (id: string, values: EditUserFormValues) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditUserDialog({
  open,
  onOpenChange,
  userId,
  onSubmit,
}: EditUserDialogProps) {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch user from backend when dialog opens
  const { data: user, isLoading } = useSWR<User>(
    open && userId ? `/employees/${userId}` : null,
    () => getUser(userId!),
  );

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      lastName: "",
      phone: "",
      gender: "male",
      dob: "",
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const {
    handleSubmit,
    reset,
    control,
    setError,
    formState: { isSubmitting },
  } = form;

  // Populate form once user data is fetched
  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? "",
        gender: user.gender ?? "male",
        dob: user.dob ?? "",
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [user, reset]);

  // Reset form and visibility on close
  const handleOpenChange = (o: boolean) => {
    if (!o) {
      reset();
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
    }
    onOpenChange(o);
  };

  const handleFormSubmit = async (values: EditUserFormValues) => {
    if (!userId || !user) return;
    try {
      // Build diff — only send changed fields
      const initial = {
        name: user.name ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? "",
        gender: user.gender ?? "male",
        dob: user.dob ?? "",
      };
      const changed: Partial<EditUserFormValues> = {};
      (["name", "lastName", "phone", "gender", "dob"] as const).forEach(
        (key) => {
          if (values[key] !== initial[key]) changed[key] = values[key] as never;
        },
      );
      // Include password fields only if the admin filled them in
      if (values.oldPassword || values.newPassword) {
        changed.oldPassword = values.oldPassword;
        changed.newPassword = values.newPassword;
      }
      await onSubmit(userId, changed as EditUserFormValues);
      handleOpenChange(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        const message: string =
          err.response.data?.message ?? "Something went wrong";
        // Map backend password error to the oldPassword field
        if (message.toLowerCase().includes("password")) {
          setError("oldPassword", { type: "server", message });
        } else {
          setError("name", { type: "server", message });
        }
      } else {
        throw err;
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <span className="flex items-center justify-start gap-2 text-lg font-semibold">
            <UserCog className="h-5 w-5" />
            <DialogTitle>Edit User</DialogTitle>
          </span>
        </DialogHeader>

        {isLoading ? (
          <FormSkeleton />
        ) : (
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

              {/* Email — read only */}
              <FormItem>
                <FormLabel>Email</FormLabel>
                <Input
                  value={user?.email ?? ""}
                  disabled
                  className="h-11 rounded-xl border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </FormItem>

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
                {/* Role — read only */}
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select value={user?.role ?? "Cashier"} disabled>
                    <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cashier">Cashier</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>

                {/* Gender */}
                <FormField
                  control={control}
                  name="gender"
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>Gender </FormLabel>
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

              {/* Password section */}
              {[
                {
                  name: "oldPassword" as const,
                  label: "Current Password",
                  show: showOld,
                  toggle: () => setShowOld((v) => !v),
                  placeholder: "••••••••",
                },
                {
                  name: "newPassword" as const,
                  label: "New Password",
                  show: showNew,
                  toggle: () => setShowNew((v) => !v),
                  placeholder: "••••••",
                },
                {
                  name: "confirmNewPassword" as const,
                  label: "Confirm New Password",
                  show: showConfirm,
                  toggle: () => setShowConfirm((v) => !v),
                  placeholder: "••••••",
                },
              ].map(({ name, label, show, toggle, placeholder }) => (
                <FormField
                  key={name}
                  control={control}
                  name={name}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>{label} </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...f}
                            type={show ? "text" : "password"}
                            placeholder={placeholder}
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

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => handleOpenChange(false)}
                  className="flex-1 h-11 rounded-xl border-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
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
