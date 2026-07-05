import { Link, useNavigate } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@heroui/react";
import { useMe, useLogout } from "../../hooks/useAuth";

export function PublicHeader() {
  const { data: me } = useMe();
  const { mutateAsync: logout } = useLogout();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-default-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="bg-gradient-to-br from-brand-mint to-brand-blue bg-clip-text text-xl font-bold text-transparent">
          GovernanceFund
        </Link>
        <div className="flex items-center gap-3">
          <ConnectButton showBalance={false} chainStatus="icon" />
          {me ? (
            <>
              <span className="text-sm text-default-600">{me.username}</span>
              <Button size="sm" variant="flat" onPress={async () => { await logout(); navigate("/"); }}>Keluar</Button>
            </>
          ) : (
            <Button as={Link} to="/login" size="sm" color="primary">Masuk</Button>
          )}
        </div>
      </div>
    </header>
  );
}
