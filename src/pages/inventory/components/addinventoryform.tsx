import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createInventory } from "@/queries/inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, MapPin, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddInventoryFormProps {
  onSuccess: (newId: string) => void;
  onCancel?: () => void;
}

export default function AddInventoryForm({
  onSuccess,
  onCancel,
}: AddInventoryFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", address: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: FormValues) {
    try {
      const result = await createInventory(values);
      toast.success("Inventory created successfully!");
      onSuccess(result.id);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error.message ??
        "Failed to create inventory";
      toast.error(message);
    }
  }

  return (
    <Form {...form}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-11 h-11 rounded-sm">
          <Building2 size={20} className="text-black-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Add inventory</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Create a new inventory location for your store
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

        {/* Actions — centred */}
        <div className="flex items-center justify-center gap-4.5">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            variant="default"
            disabled={isSubmitting}
          >
            <Plus size={13} />
            {isSubmitting ? "Adding…" : "Add inventory"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
