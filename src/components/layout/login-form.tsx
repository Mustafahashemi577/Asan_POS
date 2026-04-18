import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/axios";
import { useAuthStore } from "@/lib/store";
import { Eye, EyeOff, Shield } from "lucide-react";
import TwoFADialog from "@/pages/(auth)/two-fa-dialog/two-fa-dialog";
import TwoFASetupDialog from "@/pages/(auth)/two-fa-dialog/two-fa-setup-dialog";

export default function LoginForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [twoFAOpen, setTwoFAOpen] = useState(false);
  const [twoFASetupOpen, setTwoFASetupOpen] = useState(false);
  const [pendingAuth, setPendingAuth] = useState<{
    user: any;
    token: string;
  } | null>(null);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const [showPassword, setShowPassword] = useState(true);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const { setAuth } = useAuthStore();
  const handleSubmit = async () => {
    setError("");
    if (!form.email && !form.password) return setError("Email and password required");
    if (!form.email) return setError("Please enter your Email");
    if(!form.password) return setError("Please enter your password");

    try {
      setLoading(true);
      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      // Backend sends twoFactorRequired:true if 2FA is enabled
      if (res.data.twoFactorRequired) {
        setTwoFAOpen(true);
        return;
      }

      const { token } = res.data;
      setAuth({ id: "", email: form.email }, token);  // ← updates store so PrivateRoute re-renders
      navigate("/dashboard", { replace: true });
    } catch (err:unknown) {
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  const handleTwoFASuccess = (data: any) => {
    if (pendingAuth) {
      // Set auth with the pending user and token
      setAuth(pendingAuth.user, data.token || pendingAuth.token);
      localStorage.setItem("token", data.token || pendingAuth.token);
      setPendingAuth(null);
      navigate("/dashboard");
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center">
        <img src="/icons/logo.svg" alt="Logo" className="mx-auto w-8 h-8" />

        <h1 className="text-[32px] leading-tight font-semibold mb-2">
          Welcome Back!
        </h1>

        <p className="text-gray-500 text-[15px] leading-snug">
          Please enter your details to sign in
        </p>
      </div>


      {/* Form */}
      <div className="space-y-4">
        <Input
          name="email"
          type="email"
          classname="h-12"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
        />

        {/* Password */}
        <div className="relative">
          <Input
            name="password"
            className="h-12"
            type={showPassword ? "password" : "text"}
            placeholder="Your Password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
          />

          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.remember}
              onCheckedChange={(val) =>
                setForm((prev) => ({ ...prev, remember: !!val }))
              }
            />
            <label className="text-gray-600">Remember account</label>
          </div>
          <div>
            <span
              onClick={() => navigate("/forgot-password")}
              className="text-gray-400 cursor-pointer hover:underline"
            >
              Forgot Password
            </span>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-11"
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <span
          onClick={() => navigate("/register")}
          className="text-black font-medium cursor-pointer hover:underline"
        >
          Sign Up
        </span>
      </div>
      {/* Separator for "Or" */}
      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-gray-400 text-sm">Or</span>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/*Google */}
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center gap-2 rounded-sm py-3 h-12"
        >
          <img src="icons/google_color.svg" alt="Google" className="w-5 h-5" />
          <span className="text-sm font-medium">Google</span>
        </Button>
        {/*Apple*/}
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center gap-2 rounded-sm py-3 h-12"
        >
          <img src="/icons/apple_black.svg" alt="Apple" className="w-5 h-5" />
          <span className="text-sm font-medium">Apple</span>
        </Button>
      </div>

      <TwoFADialog
        open={twoFAOpen}
        onClose={() => setTwoFAOpen(false)}
        email={form.email}
        password={form.password}
      />

      <TwoFASetupDialog
        open={twoFASetupOpen}
        onClose={() => setTwoFASetupOpen(false)}
        email={form.email}
      />
    </div>
  );
}
