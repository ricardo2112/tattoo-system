import { Navigate, Outlet } from "react-router";
import { useAuthContext } from "@/app/contexts/auth/context";
import { Spinner } from "@/components/ui";

/**
 * AuthGuard middleware
 * Protects routes by verifying user authentication
 * Redirects to login if user is not authenticated
 */
export default function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner color="primary" variant="innerDot" className="size-16 border-4" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
