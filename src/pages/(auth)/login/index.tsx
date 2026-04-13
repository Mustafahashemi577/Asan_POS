import LoginForm from "@/components/layout/login-form";
import Navbar from "@/components/layout/navbar";
import StatsPanel from "@/components/layout/stats-panel";

export default function Login() {
  return (
    <>
      <div className="md:hidden">
        <Navbar
          userName="John Doe"
          avatarUrl="/photos/profile.jpeg"
          onMenuClick={() => console.log("menu")}
        />
      </div>

      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gray-100">
        <div className="flex items-center justify-center p-8">
          <LoginForm />
        </div>

        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-bg-dark to-bg-light text-white p-10">
          <StatsPanel />
        </div>
      </div>
    </>
  );
}
