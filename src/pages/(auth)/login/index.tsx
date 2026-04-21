import AuthLayout from "@/components/layout/auth-layout";
import LoginForm from "@/components/layout/login-form";
import Navbar from "@/components/layout/navbar";
import StatsPanel from "@/components/layout/stats-panel";

export default function Login() {
  return (
    <>
      <div className="md:hidden">
        <Navbar userName="John Doe" onMenuClick={() => console.log("menu")} />
      </div>

      <AuthLayout left={<LoginForm />} right={<StatsPanel />} />
    </>
  );
}
