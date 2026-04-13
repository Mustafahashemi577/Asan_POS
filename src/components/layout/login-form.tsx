import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { login } from "@/queries/auth";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000:api/auth/google";
  };

  // const handleAppleLogin = () => {
  //   window.location.href = "http://localhost:5000/api/auth/apple";
  // };

  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.email) {
      return setError("Please enter your Email!");
    }

    if (!form.password) {
      return setError("Please enter your Password!");
    }

    try {
      setLoading(true);

      const res = await login({
        email: form.email,
        password: form.password,
      });

      if (res.data.requires2FA) {
        navigate("/verify-2fa", {
          state: { email: form.email },
        });
        return;
      }

      console.log("LOGIN SUCCESS:", res.data);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Login Failed");
      } else {
        setError("Login Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center">
        <img src="/icons/logo.png" alt="Logo" className="mx-auto w-24 h-16" />

        <h1 className="text-[32px] leading-tight font-semibold mb-2">
          Welcome Back!
        </h1>

        <p className="text-gray-500 text-[15px] leading-snug">
          Please enter your details to sign in
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">{/* your inputs here */}</div>

      {/* Form */}
      <div className="space-y-4">
        <Input
          name="email"
          type="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
        />

        {/* Password */}
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? "password" : "text"}
            placeholder="Your Password"
            value={form.password}
            onChange={handleChange}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
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

        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500">
        Don’t have an account?{" "}
        <span
          onClick={() => navigate("/register")}
          className="text-black font-medium cursor-pointer hover:underline"
        >
          Sign Up
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
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-2 border rounded-xl py-3
            hover:bg-gray-50 transition"
        >
          <img src="/icons/google_color.svg" alt="Google" className="w-5 h-5" />
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
