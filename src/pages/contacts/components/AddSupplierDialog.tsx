import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useState } from "react";

import { useSupplierStore } from "@/stores/supplierStore";

interface AddSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddSupplierDialog({
  open,
  onOpenChange,
}: AddSupplierDialogProps) {
  const addSupplier = useSupplierStore((s) => s.addSupplier);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const reset = () => {
    setName("");
    setPhone("");
    setAddress("");
  };

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      return;
    }
    addSupplier({
      id: crypto.randomUUID(),
      name,
      phone,
      address,
    });

    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Supplier</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Supplier Name</label>

            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Supplier name"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Phone Number</label>

            <Input
              value={phone}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9+]/g, "");

                setPhone(value);
              }}
              placeholder="+93 700 000 000"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Full Address</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full supplier address"
              className="h-11 rounded-xl"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-11 rounded-xl bg-black hover:bg-black/90"
          >
            Add Supplier
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
