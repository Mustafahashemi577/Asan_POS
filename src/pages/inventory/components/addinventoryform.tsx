import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  createInventory,
  deleteInventory,
  updateInventory,
  type Inventory,
} from "@/queries/inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Building2, Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

type FormValues = z.infer<typeof formSchema>;

type ApiErrorResponse = {
  message?: string;
};

interface AddInventoryFormProps {
  /** Pass an existing inventory to switch into edit mode */
  inventory?: Inventory;
  onSuccess: (id: string) => void;
  onDeleted?: () => void;
  onCancel?: () => void;
}

export default function AddInventoryForm({
  inventory,
  onSuccess,
  onDeleted,
  onCancel,
}: AddInventoryFormProps) {
  const isEdit = !!inventory;

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: inventory?.name ?? "",
      address: inventory?.address ?? "",
    },
  });

  const { isSubmitting } = form.formState;

  // ── Submit: create or update
  async function onSubmit(values: FormValues) {
    try {
      if (isEdit) {
        await updateInventory(inventory.id, values);
        toast.success("Inventory updated successfully!");
        onSuccess(inventory.id);
      } else {
        const result = await createInventory(values);
        toast.success("Inventory created successfully!");
        onSuccess(result.id);
      }
    } catch (error: unknown) {
      let message = `Failed to ${isEdit ? "update" : "create"} inventory`;

      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        message = error.response?.data?.message ?? error.message ?? message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      toast.error(message);
    }
  }

  // ── Delete: two-step (click once to arm, click again to confirm)
  async function handleDelete() {
    if (!inventory) return;

    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }

    setDeleteLoading(true);

    try {
      await deleteInventory(inventory.id);
      toast.success("Inventory deleted successfully!");
      onDeleted?.();
    } catch (error: unknown) {
      let message = "Failed to delete inventory";

      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        message = error.response?.data?.message ?? error.message ?? message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      toast.error(message);
      setConfirmingDelete(false);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <Form {...form}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-11 h-11 rounded-sm">
          {isEdit ? (
            <Pencil size={20} className="text-gray-600" />
          ) : (
            <Building2 size={20} className="text-black-600" />
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-900">
            {isEdit ? "Edit inventory" : "Add inventory"}
          </p>

          <p className="text-xs text-gray-400 mt-0.5">
            {isEdit
              ? "Update the details for this inventory location"
              : "Create a new inventory location for your store"}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <Field>
          <FieldLabel
            htmlFor="inv-name"
            className="text-xs font-medium text-gray-500 uppercase tracking-wide"
          >
            Inventory name
          </FieldLabel>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <Building2 size={15} />
            </span>

            <Input
              id="inv-name"
              placeholder="e.g. Main Warehouse"
              className="pl-9 h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white text-sm"
              {...form.register("name")}
            />
          </div>

          <FieldError>{form.formState.errors.name?.message}</FieldError>
        </Field>

        {/* Address */}
        <Field>
          <FieldLabel
            htmlFor="inv-address"
            className="text-xs font-medium text-gray-500 uppercase tracking-wide"
          >
            Address
          </FieldLabel>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <MapPin size={15} />
            </span>

            <Input
              id="inv-address"
              placeholder="e.g. Kabul, Kart-e-4, Street No. 11"
              className="pl-9 h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white text-sm"
              {...form.register("address")}
            />
          </div>

          <p className="text-[11px] text-gray-400 mt-1">
            Enter the full street address of this inventory location
          </p>

          <FieldError>{form.formState.errors.address?.message}</FieldError>
        </Field>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-2" />

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          {/* Delete — only in edit mode */}
          {isEdit ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isSubmitting || deleteLoading}
              onClick={handleDelete}
              className={
                confirmingDelete
                  ? "text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-700"
                  : "text-gray-400 hover:text-red-500 hover:bg-red-50"
              }
            >
              {deleteLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 size={13} />
                  {confirmingDelete ? "Sure? Click to confirm" : "Delete"}
                </>
              )}
            </Button>
          ) : (
            <span />
          )}

          {/* Cancel + Save/Add */}
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setConfirmingDelete(false);
                  onCancel();
                }}
                disabled={isSubmitting || deleteLoading}
              >
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              size="sm"
              variant="default"
              disabled={isSubmitting || deleteLoading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  {isEdit ? "Saving…" : "Adding…"}
                </>
              ) : (
                <>
                  {isEdit ? <Pencil size={13} /> : <Plus size={13} />}

                  {isEdit ? "Save changes" : "Add inventory"}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
