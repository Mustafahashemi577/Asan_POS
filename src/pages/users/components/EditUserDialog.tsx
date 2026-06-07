import { useEffect, useState } from "react";

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

import { UserPlus } from "lucide-react";

import type { User } from "@/types/user";

// ─── Schema ───────────────────────────────────────────────────────────────────
// email and role are not updatable; name replaces firstName in the payload

const MIN_AGE = 16;

const editUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
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
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  isLoading?: boolean;
  onSubmit: (id: string, values: EditUserFormValues) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditUserDialog({
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
      name: "",
      lastName: "",
      phone: "",
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
        name: user.name ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? "",
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
      // Only send fields that differ from the original user data
      const initial: EditUserFormValues = {
        name: user.name ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? "",
        gender: user.gender ?? "male",
        dob: user.dob ?? "",
      };
      const changed = (
        Object.keys(values) as (keyof EditUserFormValues)[]
      ).reduce((acc, key) => {
        if (values[key] !== initial[key]) acc[key] = values[key] as never;
        return acc;
      }, {} as Partial<EditUserFormValues>);
      if (Object.keys(changed).length === 0) {
        onOpenChange(false);
        return;
      }
      await onSubmit(user.id, changed as EditUserFormValues);
      onOpenChange(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        const message: string =
          err.response.data?.message ?? "Something went wrong";
        setError("name", { type: "server", message });
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
              {/* Name + Last name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={control}
                  name="name"
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...f}
                          placeholder="John"
                          className="h-11 rounded-xl border-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="lastName"
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          {...f}
                          placeholder="Doe"
                          className="h-11 rounded-xl border-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email — read only, not updatable */}
              <div className="space-y-1.5">
                <FormLabel>Email</FormLabel>
                <Input
                  value={user?.email ?? ""}
                  disabled
                  className="h-11 rounded-xl border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400">
                  Email cannot be changed.
                </p>
              </div>

              {/* Role — read only, always Cashier */}
              <div className="space-y-1.5">
                <FormLabel>Role</FormLabel>
                <Select value="Cashier" disabled>
                  <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cashier">Cashier</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400">Role cannot be changed.</p>
              </div>

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

              {/* Gender */}
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
