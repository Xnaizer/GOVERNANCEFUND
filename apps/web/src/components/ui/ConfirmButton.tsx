import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/utils/cn";
import { ConfirmDialog } from "./ConfirmDialog";

type Color = "primary" | "success" | "warning" | "danger" | "secondary" | "default";
type ShadcnVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";

// API triggerProps dipertahankan (bentuk HeroUI-ish) lalu diterjemahkan ke shadcn Button —
// supaya halaman pemanggil tak perlu diubah.
type ButtonTriggerProps = {
  size?: "sm" | "md" | "lg";
  color?: Color;
  variant?: "solid" | "faded" | "bordered" | "light" | "flat" | "ghost" | "shadow";
  className?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  isIconOnly?: boolean;
  fullWidth?: boolean;
  startContent?: ReactNode;
  endContent?: ReactNode;
  "aria-label"?: string;
};

function translate(color: Color = "primary", variant?: ButtonTriggerProps["variant"]): { variant: ShadcnVariant; extra: string } {
  let v: ShadcnVariant;
  if (variant === "light") v = "ghost";
  else if (variant === "bordered" || variant === "ghost") v = "outline";
  else if (variant === "flat" || variant === "faded") v = "secondary";
  else v = "default"; // solid / shadow / undefined

  let extra = "";
  if (color === "danger") {
    if (v === "default") v = "destructive";
    else extra = "text-destructive";
  } else if (color === "success") {
    extra = v === "default" ? "bg-emerald-600 text-white hover:bg-emerald-600/90" : "text-emerald-600";
  } else if (color === "secondary" && v === "default") {
    v = "secondary";
  }
  return { variant: v, extra };
}

const SIZE: Record<NonNullable<ButtonTriggerProps["size"]>, "sm" | "default" | "lg"> = {
  sm: "sm", md: "default", lg: "lg",
};

interface Props {
  triggerLabel: ReactNode;
  triggerProps?: ButtonTriggerProps;
  title: string;
  warnings: ReactNode[];
  confirmLabel: string;
  confirmColor?: Color;
  checkboxLabel?: string;
  dialogChildren?: ReactNode;
  confirmDisabled?: boolean;
  action: () => unknown | Promise<unknown>;
  toasts?: { loading?: string; success?: string };
}

/**
 * Tombol + ConfirmDialog terintegrasi: klik → dialog peringatan → centang setuju → jalankan aksi
 * (dibungkus toast.promise). Dialog tertutup otomatis saat sukses, tetap terbuka bila gagal.
 */
export function ConfirmButton({
  triggerLabel, triggerProps, title, warnings, confirmLabel, confirmColor = "primary",
  checkboxLabel, dialogChildren, confirmDisabled, action, toasts,
}: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const tp = triggerProps ?? {};
  const { variant, extra } = translate(tp.color, tp.variant);

  const confirm = async () => {
    setBusy(true);
    // action() dijalankan SEKALI; promise yang sama dipakai untuk toast & alur kontrol.
    const p = Promise.resolve(action());
    toast.promise(p, {
      loading: toasts?.loading ?? "Memproses…",
      success: toasts?.success ?? "Berhasil.",
      error: (e) => (e as Error)?.message ?? "Gagal",
    });
    try {
      await p;
      setOpen(false);
    } catch {
      /* toast sudah menampilkan error; dialog dibiarkan terbuka */
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={tp.isIconOnly ? "icon" : tp.size ? SIZE[tp.size] : "default"}
        disabled={tp.isDisabled || tp.isLoading}
        aria-label={tp["aria-label"]}
        className={cn(tp.fullWidth && "w-full", extra, tp.className)}
        onClick={() => setOpen(true)}
      >
        {tp.isLoading && <Spinner size={16} className="text-current" />}
        {tp.startContent}
        {triggerLabel}
        {tp.endContent}
      </Button>
      <ConfirmDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        isLoading={busy}
        title={title}
        warnings={warnings}
        confirmLabel={confirmLabel}
        confirmColor={confirmColor}
        confirmDisabled={confirmDisabled}
        checkboxLabel={checkboxLabel}
      >
        {dialogChildren}
      </ConfirmDialog>
    </>
  );
}
