import { Link, useNavigate } from "react-router-dom";
import { Settings, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useMe, useLogout } from "../../hooks/useAuth";

function initials(s: string): string {
  return s.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
}

/** Profil di pojok kiri-bawah sidebar. Klik → menu Pengaturan Profil + Keluar. */
export function SidebarProfile({ collapsed = false }: { collapsed?: boolean }) {
  const { data: me } = useMe();
  const { mutateAsync: logout } = useLogout();
  const navigate = useNavigate();
  if (!me) return null;

  const label = me.name ?? me.username;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-muted">
          <Avatar className="h-8 w-8 shrink-0 text-[10px]">
            {me.profilePictureURL && <AvatarImage src={me.profilePictureURL} alt={label} />}
            <AvatarFallback>{initials(label)}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{label}</span>
              <span className="block truncate text-xs text-muted-foreground">{me.role}</span>
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-44">
        <DropdownMenuItem asChild>
          <Link to="/profile"><Settings className="h-4 w-4" /> Pengaturan Profil</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={async () => { await logout(); navigate("/"); }}
        >
          <LogOut className="h-4 w-4" /> Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
