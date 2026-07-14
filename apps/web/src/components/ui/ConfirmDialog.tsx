import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";

type Color =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "secondary"
  | "default";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  warnings: ReactNode[];
  confirmLabel: string;
  confirmColor?: Color;
  confirmDisabled?: boolean;
  isLoading?: boolean;
  checkboxLabel?: string;
  children?: ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  warnings,
  confirmLabel,
  confirmColor = "primary",
  confirmDisabled = false,
  isLoading = false,
  checkboxLabel = "Saya memahami peringatan di atas dan setuju melanjutkan.",
  children,
}: Props) {
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (isOpen) setAgreed(false);
  }, [isOpen]);

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(o) => {
        if (!o && !isLoading) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {title}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <ul className="flex flex-col gap-2">
          {warnings.map((w, i) => (
            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
        {children && <div className="mt-1">{children}</div>}

        <label className="mt-2 flex items-start gap-2 text-sm">
          <Checkbox
            checked={agreed}
            onCheckedChange={(v) => setAgreed(v === true)}
            className="mt-0.5"
          />
          <span>{checkboxLabel}</span>
        </label>

        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            variant={confirmColor === "danger" ? "destructive" : "default"}
            disabled={!agreed || confirmDisabled || isLoading}
            onClick={() => onConfirm()}
          >
            {isLoading && <Spinner size={16} className="text-current" />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
