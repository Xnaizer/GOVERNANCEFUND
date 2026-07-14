import { Outlet, useLocation } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";

export function DashboardShell() {
  const location = useLocation();
  return (
    <DashboardLayout>
      <div key={location.pathname} className="animate-in fade-in duration-200">
        <Outlet />
      </div>
    </DashboardLayout>
  );
}
