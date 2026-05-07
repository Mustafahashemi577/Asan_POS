import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createInventory } from "@/queries/inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddInventoryFormProps {
  /** Called with the new inventory's id after a successful POST */
  onSuccess: (newId: string) => void;
}

export default function AddInventoryForm({ onSuccess }: AddInventoryFormProps) {
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl mx-auto py-10"
      >
        <Field>
          <FieldLabel htmlFor="name">Inventory Name</FieldLabel>
          <Input
            id="name"
            placeholder="Inventory Name"
            {...form.register("name")}
          />
          <FieldError>{form.formState.errors.name?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <Input
            id="address"
            placeholder="Address"
            {...form.register("address")}
          />
          <FieldError>{form.formState.errors.address?.message}</FieldError>
        </Field>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding…" : "Add Inventory"}
        </Button>
      </form>
    </Form>
  );
}
