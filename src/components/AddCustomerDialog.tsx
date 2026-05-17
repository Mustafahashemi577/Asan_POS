import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import type { Value as PhoneValue } from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneNumberInput } from "@/components/ui/phoneinput";

import { MapPin, User } from "lucide-react";

import type { Customer } from "@/types/customer";

// ─── Schema ───────────────────────────────────────────────────────────────────

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine((val) => isValidPhoneNumber(val), "Enter a valid phone number"),
  address: z.string().min(1, "Address is required"),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
  onSubmit: (values: CustomerFormValues, id?: string) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomerDialog({
  open,
  onOpenChange,
  customer,
  onSubmit,
}: CustomerDialogProps) {
  const isEditing = !!customer;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", phone: "", address: "" },
  });

  useEffect(() => {
    if (open) {
      reset(
        customer
          ? {
              name: customer.name,
              phone: customer.phone,
              address: customer.address,
            }
          : { name: "", phone: "", address: "" },
      );
    }
  }, [open, customer, reset]);

  const handleFormSubmit = async (values: CustomerFormValues) => {
    try {
      await onSubmit(values, customer?.id);
      onOpenChange(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        const message: string =
          err.response.data?.message ?? "Phone number already in use";
        setError("phone", { type: "server", message });
      } else {
        throw err;
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Customer" : "Add Customer"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 mt-2"
          noValidate
        >
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Customer Name</label>
            <div className="relative">
              <User
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <Input
                {...register("name")}
                placeholder="e.g. John"
                className="pl-9 h-11 rounded-xl border-gray-200"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneNumberInput
                  label="Phone Number"
                  value={field.value as PhoneValue}
                  onChange={(val) => field.onChange(val ?? "")}
                  error={!!errors.phone}
                />
              )}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Full Address</label>
            <div className="relative">
              <MapPin
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <Input
                {...register("address")}
                placeholder="e.g. Kabul"
                className="pl-9 h-11 rounded-xl border-gray-200"
              />
            </div>
            {errors.address && (
              <p className="text-xs text-red-500">{errors.address.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-black hover:bg-black/90"
          >
            {isSubmitting
              ? isEditing
                ? "Saving…"
                : "Adding…"
              : isEditing
                ? "Save Changes"
                : "Add Customer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
