import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  email: string;
  password: string;
};

export default function TwoFADialog({ open, onClose, email, password }: Props) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    try {
      setLoading(true);
      setError("");

      // Send login again with the 2FA code included
      const res = await api.post("/auth/login", { email, password, code });

      localStorage.setItem("token", res.data.token);
      onClose();
      navigate("/dashboard");
    } catch {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Two-Factor Authentication
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app
          </p>
          <Input
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            maxLength={6}
            placeholder="123456"
            className="text-center text-lg tracking-[0.5em]"
          />
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          <Button onClick={handleVerify} disabled={loading || code.length !== 6} className="w-full">
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}