import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";

export default function UnauthorizedPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Cashiers only have POS, admins go to dashboard
    if (user?.role === "Cashier") {
      navigate("/pos");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
      <h1 className="text-4xl font-bold">403</h1>
      <p className="text-muted-foreground text-lg">
        You don't have permission to access this page.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleGoBack}>
          Go Back
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
