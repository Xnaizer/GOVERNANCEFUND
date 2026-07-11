import { WifiOff } from "lucide-react";
import { useOnline } from "../hooks/useOnline";

export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-destructive px-4 py-1.5 text-sm text-destructive-foreground">
      <WifiOff className="h-4 w-4" />
      Anda sedang offline — beberapa data mungkin tidak diperbarui.
    </div>
  );
}
