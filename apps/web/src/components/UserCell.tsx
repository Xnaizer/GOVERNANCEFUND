import { Link } from "react-router-dom";
import { UserX } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "../utils/cn";
import { formatShortenAddress } from "../utils/format";

interface CellUser {
  id: string;
  name: string | null;
  username: string;
  walletAddress?: string | null;
  profilePictureURL?: string | null;
  role?: string;
}

function initials(s: string): string {
  return (
    s.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?"
  );
}

/**
 * Template "user tidak dikenal" untuk proposal/banding tanpa PIC terdaftar
 * (orphan) atau yang sudah FRAUD_CONFIRMED — menandai anomali secara eksplisit.
 */
export function MissingUser({
  wallet,
  reason = "PIC tidak dikenal",
  size = "sm",
}: {
  wallet?: string | null;
  reason?: string;
  size?: "sm" | "md";
}) {
  const sz = size === "md" ? "h-10 w-10" : "h-8 w-8";
  return (
    <div className="flex items-center gap-2">
      <span className={cn("flex shrink-0 items-center justify-center rounded-full border border-dashed border-amber-400/70 text-amber-500", sz)}>
        <UserX className="h-4 w-4" />
      </span>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-medium text-amber-600">{reason}</span>
        <span className="truncate font-mono text-[11px] text-muted-foreground">
          {wallet ? formatShortenAddress(wallet) : "tanpa wallet"}
        </span>
      </div>
    </div>
  );
}

/** Avatar + nama (+ role) satu sel. Klik → profil publik. Fallback ke wallet bila user tak dikenal. */
export function UserCell({
  user,
  wallet,
  showRole = false,
  size = "sm",
}: {
  user?: CellUser | null;
  wallet?: string | null;
  showRole?: boolean;
  size?: "sm" | "md";
}) {
  const sz = size === "md" ? "h-10 w-10" : "h-8 w-8";

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Avatar className={cn("shrink-0", sz)}>
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
        <span className="font-mono text-xs text-muted-foreground">
          {wallet ? formatShortenAddress(wallet) : "—"}
        </span>
      </div>
    );
  }

  const label = user.name ?? user.username;
  return (
    <Link to={`/users/${user.id}`} className="group flex items-center gap-2">
      <Avatar className={cn("shrink-0", sz)}>
        {user.profilePictureURL && <AvatarImage src={user.profilePictureURL} alt={label} />}
        <AvatarFallback>{initials(label)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-medium text-foreground group-hover:text-brand-blue">{label}</span>
        {showRole && user.role ? (
          <Badge variant="secondary" className="mt-0.5 h-4 w-fit px-1 text-[10px]">{user.role}</Badge>
        ) : (
          <span className="truncate font-mono text-[11px] text-muted-foreground">
            {user.walletAddress ? formatShortenAddress(user.walletAddress) : ""}
          </span>
        )}
      </div>
    </Link>
  );
}
