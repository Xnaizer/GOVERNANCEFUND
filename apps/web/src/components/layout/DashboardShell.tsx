import { Outlet, useLocation } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";

/**
 * Layout route: render DashboardLayout SEKALI, halaman anak masuk via Outlet (tak remount shell).
 * Transisi antar-halaman: FADE ringan via CSS (tw-animate-css), tanpa transform supaya tak merusak
 * `position: sticky`/`fixed` di dalam halaman.
 */
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
