import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Menu, X, ChevronLeft, ChevronRight, Home, Folder, PlusSquare, RefreshCw,
  CheckSquare, Unlock, Shield, Users, SquarePen, LayoutGrid, Activity, Clipboard,
  CreditCard, Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useMe } from "../../hooks/useAuth";
import { useGatewayOwner } from "../../hooks/useGatewayOwner";
import { WalletConnectPopup } from "../WalletConnectPopup";
import { SidebarProfile } from "./SidebarProfile";
import { Breadcrumbs } from "../ui/Breadcrumbs";
import { cn } from "../../utils/cn";
import type { Role } from "../../types/auth";

interface NavItem { label: string; to: string; roles: Role[]; icon: ReactNode; end?: boolean; }
const ALL: Role[] = ["USER", "ADMIN", "VALIDATOR", "AUDITOR", "PIC"];

const NAV: NavItem[] = [
  { label: "Ringkasan", to: "/dashboard", roles: ALL, end: true, icon: <Home className="h-4.5 w-4.5" /> },
  { label: "Program Saya", to: "/dashboard/programs", roles: ["PIC"], icon: <Folder className="h-4.5 w-4.5" /> },
  { label: "Buat Program", to: "/dashboard/programs/new", roles: ["PIC"], icon: <PlusSquare className="h-4.5 w-4.5" /> },
  { label: "Tukar Token", to: "/dashboard/redeem", roles: ["PIC"], icon: <RefreshCw className="h-4.5 w-4.5" /> },
  { label: "Voting Proposal", to: "/dashboard/proposals", roles: ["VALIDATOR"], icon: <CheckSquare className="h-4.5 w-4.5" /> },
  { label: "Banding Unfreeze", to: "/dashboard/appeals", roles: ["VALIDATOR"], icon: <Unlock className="h-4.5 w-4.5" /> },
  { label: "Freeze / Audit", to: "/dashboard/audit", roles: ["AUDITOR"], icon: <Shield className="h-4.5 w-4.5" /> },
  { label: "Tata Kelola Peran", to: "/dashboard/governance", roles: ["ADMIN"], icon: <Users className="h-4.5 w-4.5" /> },
  { label: "Tanda Tangan Milestone", to: "/dashboard/sign", roles: ["ADMIN", "VALIDATOR", "AUDITOR"], icon: <SquarePen className="h-4.5 w-4.5" /> },
];

// Transparansi publik — untuk semua role.
const TRANSPARENCY: NavItem[] = [
  { label: "List Pengguna", to: "/users", roles: ALL, icon: <Users className="h-4.5 w-4.5" /> },
  { label: "List Program", to: "/programs", roles: ALL, icon: <LayoutGrid className="h-4.5 w-4.5" /> },
  { label: "Log Perubahan Peran", to: "/governance/roles", roles: ALL, icon: <Activity className="h-4.5 w-4.5" /> },
  { label: "Voting Berjalan", to: "/governance/votes", roles: ALL, icon: <Clipboard className="h-4.5 w-4.5" /> },
  { label: "Penukaran", to: "/gateway/redemptions", roles: ALL, icon: <CreditCard className="h-4.5 w-4.5" /> },
];

// Item operator gateway — hanya tampil bila wallet terhubung == gatewayOwner (bukan berbasis role).
const OPERATOR_ITEM: NavItem = { label: "Gateway (Operator)", to: "/dashboard/gateway", roles: ALL, icon: <Inbox className="h-4.5 w-4.5" /> };

function NavItemLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const link = (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
          collapsed && "justify-center px-0",
          isActive ? "bg-brand-blue/10 font-semibold text-brand-blue" : "text-muted-foreground hover:bg-muted",
        )
      }
    >
      <span className="relative z-10 shrink-0">{item.icon}</span>
      {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
    </NavLink>
  );
  return collapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  ) : (
    link
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: me } = useMe();
  const { isOperator } = useGatewayOwner();
  const loc = useLocation();
  const role: Role = me?.role ?? "USER";

  const items = [
    ...NAV.filter((n) => n.roles.includes(role)),
    ...(isOperator ? [OPERATOR_ITEM] : []),
  ];
  const transparency = TRANSPARENCY.filter((n) => n.roles.includes(role));

  const [open, setOpen] = useState(false); // drawer mobile
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebar-collapsed") === "1");
  useEffect(() => { localStorage.setItem("sidebar-collapsed", collapsed ? "1" : "0"); }, [collapsed]);
  useEffect(() => { setOpen(false); }, [loc.pathname]);

  const brand = (
    <Link to="/" className="block text-gradient font-display text-lg font-bold">GovernanceFund</Link>
  );

  const sidebarInner = (mobile = false) => {
    const isCollapsed = collapsed && !mobile;
    return (
      <div className="flex h-full flex-col">
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {items.map((n) => <NavItemLink key={n.to} item={n} collapsed={isCollapsed} />)}

          <div className={cn("mb-1 mt-4 px-3 text-xs font-semibold uppercase text-muted-foreground/70", isCollapsed && "px-0 text-center")}>
            {isCollapsed ? "···" : "Transparansi"}
          </div>
          {transparency.map((n) => <NavItemLink key={n.to} item={n} collapsed={isCollapsed} />)}
        </nav>

        <div className="border-t p-2">
          <SidebarProfile collapsed={isCollapsed} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ── Topbar: logo + connect wallet saja ── */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur">
        <Button size="icon" variant="ghost" aria-label="Buka menu" className="md:hidden" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        {brand}
        <div className="ml-auto">
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
        </div>
      </header>

      <WalletConnectPopup />

      <div className="flex">
        {/* ── Sidebar desktop ── */}
        <aside className={cn("sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 border-r bg-background transition-[width] md:flex md:flex-col", collapsed ? "w-16" : "w-60")}>
          <div className={cn("flex items-center border-b p-2", collapsed ? "justify-center" : "justify-end")}>
            <Button size="icon" variant="ghost" aria-label="Perkecil/lebarkan sidebar" onClick={() => setCollapsed((c) => !c)}>
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
          {sidebarInner()}
        </aside>

        {/* ── Sidebar mobile (off-canvas) ── */}
        {open && (
          <>
            <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
            <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-background shadow-xl md:hidden">
              <div className="flex items-center justify-between border-b p-3">
                {brand}
                <Button size="icon" variant="ghost" aria-label="Tutup menu" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {sidebarInner(true)}
            </aside>
          </>
        )}

        {/* ── Konten: breadcrumb (quick url) di atas, lalu halaman ── */}
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="mb-4"><Breadcrumbs /></div>
          {children}
        </main>
      </div>
    </div>
  );
}
