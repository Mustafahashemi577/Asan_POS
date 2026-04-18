import api from "@/lib/axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { Eye, EyeOff } from "lucide-react";

export default function RegisterForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    storeName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(true);
  const [showConfirm, setShowConfirm] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name) {
      return setError("Please Enter name");
    }

    if (!form.storeName) {
      return setError("Please Enter Store name");
    }

    if (!form.email) {
      return setError("Please enter your email!");
    }

    if (!form.phone) {
      return setError("Please enter your Phone number");
    }

    if (!form.password) {
      return setError("Please enter your password!");
    }

    if (!form.confirmPassword) {
      return setError("Please confirm you password");
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setLoading(true);

      await api.post("/auth/register", {
        name: form.name,
        storeName: form.storeName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      // ✅ SAVE EMAIL + OPEN OTP MODAL
      setUserEmail(form.email);
      setShowOtpModal(true);
    } catch (err:unknown) {
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);

      await api.post("/auth/verify-register", {
        email: userEmail,
        code: String(otp),
      });

      // ✅ success → go to login
      navigate("/login");
    } catch (err) {
      setError("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center">
        <img src="/icons/logo.svg" alt="Logo" className="mx-auto w-8 h-8" />

        <h1 className="text-[32px] leading-tight font-semibold mb-2">
          Welcome!
        </h1>

        <p className="text-gray-500 text-[15px] leading-snug">
          Please enter your details to Create Your Account
        </p>
      </div>

      {/* Form */}

      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          name="name"
          type="text"
          className="flex-1 border p-2 h-12"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
        />
        <Input
          name="storeName"
          type="text"
          value={form.storeName}
          className="flex-1 border p-2 h-12"
          placeholder="Store Name"
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          name="email"
          type="email"
          className="flex-1 border p-2 h-12"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
        />
        <Input
          name="phone"
          type="text"
          value={form.phone}
          className="flex-1 border p-2 h-12"
          placeholder="Phone number"
          onChange={handleChange}
        />
      </div>

      <div className="space-y-4">
        {/* Password */}
        <div className="relative h-12">
          <Input
            name="password"
            type={showPassword ? "password" : "text"}
            placeholder="Password"
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
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        </div>

        {/* Confirm Password */}
        <div className="relative h-12">
          <Input
            name="confirmPassword"
            type={showConfirm ? "password" : "text"}
            placeholder="Confirm Password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
          />

          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setShowConfirm((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button onClick={handleSubmit} disabled={loading} className="w-full h-12">
          {loading ? "Creating..." : "Sign Up"}
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          className="cursor-pointer text-black font-medium hover:underline"
        >
          Sign In
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
          className="flex items-center justify-center gap-2 rounded-sm h-12 py-3"
        >
          <img src="icons/google_color.svg" alt="Google" className="w-5 h-5" />
          <span className="text-sm font-medium">Google</span>
        </Button>
        {/*Apple*/}
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center gap-2 rounded-sm h-12 py-3"
        >
          <img src="/icons/apple_black.svg" alt="Apple" className="w-5 h-5" />
          <span className="text-sm font-medium">Apple</span>
        </Button>
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-2xl w-[90%] max-w-sm space-y-4">
            <h2 className="text-xl font-semibold text-center">Verify Email</h2>

            <p className="text-sm text-gray-500 text-center">
              Enter the OTP sent to your email
            </p>

            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <Button
              onClick={handleVerifyOtp}
              className="w-full"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>

            <Button
              type="button"
              variant="link"
              className="text-sm text-gray-400 w-full text-center p-0"
              onClick={() => setShowOtpModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
