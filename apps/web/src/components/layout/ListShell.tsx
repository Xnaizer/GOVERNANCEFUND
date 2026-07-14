import type { ReactNode } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { LandingNav } from "../landing/LandingNav";
import { useMe } from "../../hooks/useAuth";
import { cn } from "../../utils/cn";

export function ListShell({
  children,
  max = "max-w-5xl",
}: {
  children: ReactNode;
  max?: string;
}) {
  const { data: me } = useMe();
  if (me) {
    return (
      <DashboardLayout>
        <div className={cn("mx-auto flex w-full flex-col gap-5", max)}>
          {children}
        </div>
      </DashboardLayout>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main className={cn("mx-auto flex flex-col gap-5 px-4 pt-28 pb-16", max)}>
        {children}
      </main>
    </div>
  );
}
