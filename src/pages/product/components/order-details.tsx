"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderFood } from '@/queries/products';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { CartItemCard } from './cart-item';

export interface CartItemType {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderDetailsProps {
  cart: CartItemType[];
  onRemoveItem: (itemId: number) => void;
  subtotal: number;
  tax: number;
  total: number;
}

const formSchema = z.object({
  name: z.string().min(1).optional(),
  quantity: z.coerce.number().optional(),
  description: z.string().min(1).optional(),
  serviceType: z.string().optional(),
});

export function OrderDetails({
  cart,
  onRemoveItem,
  subtotal,
  tax,
  total,
}: OrderDetailsProps) {
  const form = useForm<
    z.input<typeof formSchema>,
    unknown,
    z.output<typeof formSchema>
  >({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = orderFood({
        serviceType: values.serviceType,
        name: values.name,
        quantity: values.quantity,
        description: values.description,
      });
      toast.success(response.message);
      toast.success(<code>{JSON.stringify(response.payload)}</code>);
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <div className="p-2 bg-neutral-100 rounded-xl h-[calc(100vh-90px)]">
      <div className="flex h-full flex-col rounded-lg bg-white p-2">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg text-foreground">Order Details</h2>
          <button className="text-sm text-muted-foreground hover:text-foreground">
            See Order
          </button>
        </div>

        {/* Order Type */}
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-w-3xl mx-auto space-y-2 bg-gray-100 mb-6 p-1 rounded-lg"
            >
              <Field>
                <Select>
                  <SelectTrigger
                    className="w-full bg-white"
                    {...form.register("serviceType")}
                  >
                    <SelectValue placeholder="Select Service Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Dine In</SelectLabel>
                      <SelectItem value="Take Away">Take Away</SelectItem>
                      <SelectItem value="Delivery">Delivery</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <FieldError>
                  {form.formState.errors.serviceType?.message}
                </FieldError>
              </Field>

              <Field>
                <Input
                  id="name"
                  placeholder="Qabli Palaw"
                  {...form.register("name")}
                />

                <FieldError>{form.formState.errors.name?.message}</FieldError>
              </Field>

              <Field>
                <Input
                  id="quantity"
                  placeholder="Quantity"
                  type="number"
                  {...form.register("quantity")}
                  onChange={(e) => {
                    form.setValue("quantity", parseInt(e.target.value));
                    console.log(form.getValues("quantity"));
                  }}
                />

                <FieldError>
                  {form.formState.errors.quantity?.message}
                </FieldError>
              </Field>

              <Field>
                <Input
                  id="description"
                  placeholder="Description"
                  {...form.register("description")}
                />

                <FieldError>
                  {form.formState.errors.description?.message}
                </FieldError>
              </Field>

              {/* Confirmation Button */}
              <Button
                type="submit"
                className="w-full bg-foreground text-background hover:bg-foreground/90"
              >
                Confirmation
              </Button>
            </form>
          </Form>
        </div>

        {/* Cart Items */}
        <div className="flex-1 space-y-3 overflow-auto">
          {cart.map((item) => (
            <CartItemCard key={item.id} item={item} onRemoveItem={onRemoveItem} />
          ))}
        </div>

        {/* Totals */}
        <div className="mt-auto space-y-2 border-t border-border pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sub Total</span>
            <span className="font-medium text-foreground">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tax/10%</span>
            <span className="font-medium text-foreground">
              ${tax.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Pay Button */}
        <Button className="mt-4 w-full bg-foreground text-background hover:bg-foreground/90">
          Pay ${total.toFixed(2)}
        </Button>
      </div>
    </div>
  );
}
