import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { useMe } from "../hooks/useAuth";
import type { Role } from "../types/auth";

export function RoleRoute({
  roles,
  children,
}: {
  roles: Role[];
  children: ReactNode;
}) {
  const { data: me, isLoading } = useMe();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (!me) return <Navigate to="/login" replace />;
  if (!roles.includes(me.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
