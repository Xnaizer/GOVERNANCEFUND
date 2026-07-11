import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Tampilkan tombol "Kembali". `true` = history back; string = navigate ke path itu. */
  back?: boolean | string;
}

export function PageHeader({ title, subtitle, actions, back }: Props) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-2">
        {back && (
          <Button
            size="icon"
            variant="ghost"
            aria-label="Kembali"
            className="mt-1"
            onClick={() => (typeof back === "string" ? navigate(back) : navigate(-1))}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
