import type { ReactNode } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { PublicHeader } from "./PublicHeader";
import { useMe } from "../../hooks/useAuth";
import { cn } from "../../utils/cn";

/**
 * Chrome bersama untuk halaman transparansi (list & detail).
 * Login → DashboardLayout (TIDAK keluar dari dashboard). Tamu → PublicHeader.
 */
export function ListShell({ children, max = "max-w-5xl" }: { children: ReactNode; max?: string }) {
  const { data: me } = useMe();
  if (me) {
    return <DashboardLayout><div className={cn("mx-auto flex w-full flex-col gap-5", max)}>{children}</div></DashboardLayout>;
  }
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className={cn("mx-auto flex flex-col gap-5 px-4 py-8", max)}>{children}</main>
    </div>
  );
}
