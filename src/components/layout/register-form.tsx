import api from "@/lib/axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(true);
  const [showConfirm, setShowConfirm] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (form.email !== form.confirmEmail) {
      setError("Emails do not match");
      return;
    }

    if (!form.name) {
      return setError("Please Enter your name!");
    }

    if (!form.email) {
      return setError("Please enter your email!");
    }

    if (!form.password) {
      return setError("Please enter your password!");
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setError("");

      setLoading(true);

      const res = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      console.log("REGISTER SUCCESS:", res.data);
      navigate("/login");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Sign Up Failed");
      } else {
        setError("Sign Up Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center">
        <img
          src="icons/logo.png"
          alt="Logo"
          className="mx-auto w-24 h-16 mb-0"
        />

        <h1 className="text-[32px] leading-tight font-semibold mb-2">
          Welcome!
        </h1>

        <p className="text-gray-500 text-[15px] leading-snug">
          Please enter your details to Create Your Account
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">{/* your inputs here */}</div>

      {/* Form */}

      <div className="flex gap-4">
        <Input
          name="email"
          type="email"
          className="flex-1 border p-2"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
        />
        <Input
          name="confirmEmail"
          type="email"
          value={form.confirmEmail}
          className="flex-1 border p-2"
          placeholder="Confirm Email"
          onChange={handleChange}
        />
      </div>

      <div className="space-y-4">
        <Input
          name="name"
          placeholder="Store Name"
          value={form.name}
          onChange={handleChange}
        />

        {/* Password */}
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? "password" : "text"}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Input
            name="confirmPassword"
            type={showConfirm ? "password" : "text"}
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
          />

          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button onClick={handleSubmit} disabled={loading} className="w-full">
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
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-400" />
        <span className="text-gray-400 text-sm">Or</span>
        <div className="flex-1 h-px bg-gray-400" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/*Google */}
        <button
          className="flex items-center justify-center gap-2 border rounded-xl py-3
            hover:bg-gray-50 transition"
        >
          <img src="icons/google_color.svg" alt="Google" className="w-5 h-5" />
          <span className="text-sm font-medium">Google</span>
        </button>
        {/*Apple*/}
        <button
          className="flex items-center justify-center gap-2 border rounded-xl py-3
                hover:bg-gray-50 transition"
        >
          <img src="/icons/apple_black.svg" alt="Apple" className="w-5 h-5" />
          <span className="text-sm font-medium">Apple</span>
        </button>
      </div>
    </div>
  );
}
