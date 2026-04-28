import OtpDialog from "@/components/otp-dialog";
import api from "@/lib/axios";
import { useAuthStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
  email: string;
  password: string;
}

export default function TwoFADialog({ open, onClose, email, password }: Props) {
  const { setAuth, setTwoFAEnabled } = useAuthStore();
  const navigate = useNavigate();

  return (
    <OtpDialog
      open={open}
      onClose={onClose}
      title="Two-Factor Authentication"
      description="Enter the 6-digit code from your authenticator app"
      onVerify={async (code) => {
        const res = await api.post("/auth/login", { email, password, code });
        setAuth({ id: "", email }, res.data.token);
        setTwoFAEnabled(true);
        navigate("/dashboard", { replace: true });
      }}
    />
  );
}
