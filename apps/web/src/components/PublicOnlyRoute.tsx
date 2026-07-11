import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { useMe } from "../hooks/useAuth";

/** Hanya untuk tamu (belum login). Bila sudah login → lempar ke /dashboard. */
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { data: me, isLoading } = useMe();
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>;
  }
  if (me) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
