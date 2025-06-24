import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import type { Role } from "../types/userAuth";

interface ProtectedRouteProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export const ProtectedRoute = ({
  allowedRoles,
  children,
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <></>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // console.log('allowedRoles:', allowedRoles);
  // console.log('user.roles:', user.roles);

  const hasAccess = user.roles.some((role) => allowedRoles.includes(role));

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
