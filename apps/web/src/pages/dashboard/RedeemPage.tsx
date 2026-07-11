import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../../components/ui/PageHeader";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { ConfirmButton } from "../../components/ui/ConfirmButton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/utils/cn";
import { useRedeemToken, type RedemptionStatus } from "../../hooks/useRedeemToken";
import { formatIDR } from "../../utils/format";
import { getErrorMessage } from "../../utils/error";

const STATUS_VARIANT: Record<RedemptionStatus, "warning" | "success" | "secondary"> = {
  NONE: "secondary", PENDING: "warning", SETTLED: "success", CANCELLED: "secondary",
};
const STATUS_LABEL: Record<RedemptionStatus, string> = {
  NONE: "-", PENDING: "Menunggu bank", SETTLED: "Cair (burned)", CANCELLED: "Ditarik kembali",
};

function fmtDate(sec: bigint) {
  return new Date(Number(sec) * 1000).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

export function RedeemPage() {
  const { requestRedemption, reclaim, balance, requests, loadingRequests, reclaimTimeout, state, busy } = useRedeemToken();
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);

  const isValidNumber = /^\d+$/.test(amount) && BigInt(amount || "0") > 0n;
  const withinBalance = isValidNumber && BigInt(amount) <= balance;
  const canSubmit = isValidNumber && withinBalance;
  const timeoutDays = Number(reclaimTimeout) / 86400;

  const errorMsg =
    amount.length > 0 && !isValidNumber ? "Masukkan angka > 0"
      : amount.length > 0 && !withinBalance ? "Melebihi saldo"
        : undefined;

  const confirm = async () => {
    const pr = requestRedemption(BigInt(amount));
    toast.promise(pr, {
      loading: "Menitipkan token ke gateway…",
      success: "Permintaan penukaran diajukan. Menunggu operator bank mencairkan fiat.",
      error: (e) => getErrorMessage(e),
    });
    try {
      await pr;
      setAmount("");
      setOpen(false);
    } catch { /* biarkan dialog terbuka */ }
  };

  return (
    <>
      <div className="flex max-w-lg flex-col gap-6">
        <PageHeader
          title="Tukar Token ke Rupiah"
          subtitle="Ajukan penukaran e-IDR: token dititipkan ke Trusted Gateway (escrow). Operator bank membakar & mencairkan Rupiah setelah verifikasi. Bila tak diproses, token bisa Anda tarik kembali."
        />

        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Saldo e-IDR</p>
            <p className="text-2xl font-bold text-brand-blue">{formatIDR(balance.toString())}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 font-semibold">
            <span>Ajukan Penukaran</span>
            <Badge variant="secondary">escrow · non-transferable</Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Jumlah (Rupiah)</Label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-invalid={!!errorMsg || undefined}
                className={cn(errorMsg && "border-destructive focus-visible:ring-destructive")}
              />
              {errorMsg ? <p className="text-xs text-destructive">{errorMsg}</p> : <p className="text-xs text-muted-foreground">Angka saja, tanpa titik/koma.</p>}
            </div>
            <Button disabled={!canSubmit || busy} className="w-fit" onClick={() => setOpen(true)}>
              {busy && <Spinner size={16} className="text-current" />}
              Ajukan Penukaran {state === "approving" ? "(approve…)" : state === "requesting" ? "(escrow…)" : ""}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="font-semibold">Permintaan Penukaran Saya</CardHeader>
          <CardContent className="flex flex-col gap-2">
            {loadingRequests
              ? <Spinner size={16} />
              : requests.length === 0
                ? <p className="text-sm text-muted-foreground">Belum ada permintaan penukaran.</p>
                : requests.map((r) => (
                  <div key={r.id.toString()} className="flex flex-wrap items-center gap-2 border-b py-2 text-sm last:border-0">
                    <span className="font-mono text-muted-foreground">#{r.id.toString()}</span>
                    <span className="font-mono font-medium">{formatIDR(r.amount.toString())}</span>
                    <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                    <span className="text-xs text-muted-foreground">{fmtDate(r.createdAt)}</span>
                    {r.status === "PENDING" && (
                      <div className="ml-auto">
                        {r.canReclaim ? (
                          <ConfirmButton
                            triggerLabel="Tarik kembali"
                            triggerProps={{ size: "sm", color: "danger", variant: "flat" }}
                            title={`Tarik kembali escrow #${r.id.toString()}?`}
                            confirmLabel="Ya, tarik kembali"
                            confirmColor="danger"
                            toasts={{ loading: "Menarik…", success: "Escrow dikembalikan ke wallet Anda." }}
                            action={() => reclaim(r.id)}
                            warnings={[
                              "Token escrow akan dikembalikan ke wallet Anda dan permintaan dibatalkan.",
                              "Lakukan hanya bila operator bank tak kunjung mencairkan fiat.",
                            ]}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">bisa ditarik setelah {timeoutDays} hari</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        isLoading={busy}
        title="Konfirmasi pengajuan penukaran"
        confirmLabel="Ya, ajukan penukaran"
        warnings={[
          `Token senilai ${isValidNumber ? formatIDR(amount) : ""} akan DITITIPKAN ke gateway (escrow), belum dibakar.`,
          "Operator bank akan membakar token & mencairkan Rupiah setelah verifikasi fiat.",
          `Bila belum diproses, Anda bisa menarik kembali token setelah ${timeoutDays} hari.`,
          "Pengajuan hanya setelah melewati jendela clawback 72 jam sejak token dicetak (kebijakan Web2).",
        ]}
      />
    </>
  );
}
