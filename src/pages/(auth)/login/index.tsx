import LoginForm from "@/components/layout/login-form";
import Navbar from "@/components/layout/navbar";
import StatsPanel from "@/components/layout/stats-panel";
import AuthLayout from "@/components/layout/auth-layout";

export default function Login() {
  return (
    <>
      <div className="md:hidden">
        <Navbar
          onMenuClick={() => console.log("menu")}
        />
      </div>


      <AuthLayout left={<LoginForm />} right={<StatsPanel />} />
    </>
  );
}
