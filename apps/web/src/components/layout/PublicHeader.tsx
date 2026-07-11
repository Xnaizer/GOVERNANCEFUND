import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMe } from "../../hooks/useAuth";
import { cn } from "../../utils/cn";

const NAV = [
  { to: "/programs", label: "Program" },
  { to: "/users", label: "Pengguna" },
  { to: "/governance/votes", label: "Voting" },
  { to: "/governance/roles", label: "Log Peran" },
  { to: "/gateway/redemptions", label: "Penukaran" },
];

export function PublicHeader() {
  const { data: me } = useMe();
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gradient text-xl font-bold">GovernanceFund</Link>
          <nav className="hidden items-center gap-5 text-sm md:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cn("transition-colors", isActive ? "font-semibold text-brand-blue" : "text-muted-foreground hover:text-brand-blue")
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <Button asChild size="sm">
          <Link to={me ? "/dashboard" : "/login"}>{me ? "Dashboard" : "Masuk"}</Link>
        </Button>
      </div>
    </header>
  );
}
