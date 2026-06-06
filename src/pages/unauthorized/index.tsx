import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";
import { ArrowLeft, Lock, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UnauthorizedPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(user?.role === "Cashier" ? "/pos" : "/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-0 py-16">
      <div className="w-18 h-18 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <Lock className="w-8 h-8 text-red-500" />
      </div>

      <h1 className="text-2xl font-medium text-foreground mb-2">
        Access restricted
      </h1>

      <p className="text-muted-foreground text-[15px] leading-relaxed max-w-sm mb-8">
        You don't have permission to view this page. If you think this is a
        mistake, please contact your administrator.
      </p>

      <div className="flex gap-2 flex-wrap justify-center">
        <Button onClick={handleGoBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Go back
        </Button>
        <Button
          variant="destructive"
          className="gap-2"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
