import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { BadgeCheck, TriangleAlert, IdCard, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { BrandLoader } from "@/components/ui/BrandLoader";
import { getAdminUser } from "../services/usersApi";
import { useVerifyUser } from "../hooks/useVerifyUser";
import { getErrorMessage } from "../utils/error";
import { formatShortenAddress, formatDate } from "../utils/format";

const FIELD_LABEL: Record<string, string> = {
  name: "Nama lengkap",
  nik: "NIK",
  nip: "NIP",
  institution: "Institusi",
  position: "Jabatan",
  phone: "Telepon",
  address: "Alamat",
  birthPlace: "Tempat lahir",
  birthDate: "Tanggal lahir",
  nationality: "Kewarganegaraan",
};

function initials(s: string): string {
  return s.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
}

function Row({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className={`mt-0.5 truncate text-sm ${mono ? "font-mono" : ""}`} title={value ?? undefined}>
        {value ? value : <span className="text-muted-foreground/50">—</span>}
      </p>
    </div>
  );
}

/**
 * Modal detail identitas user untuk ADMIN (privat — bukan profil publik).
 * Menampilkan field identitas lengkap; verifikasi hanya bisa dilakukan bila
 * seluruh field wajib sudah terisi. Satu-satunya dialog (tanpa nested popup).
 */
export function AdminUserDetailModal({
  userId,
  open,
  onOpenChange,
}: {
  userId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const verify = useVerifyUser();
  const [agreed, setAgreed] = useState(false);

  const { data: u, isLoading, isError, error } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => getAdminUser(userId!),
    enabled: open && !!userId,
  });

  const doVerify = async () => {
    if (!u) return;
    const pr = verify.mutateAsync(u.id);
    toast.promise(pr, {
      loading: "Memverifikasi…",
      success: "Identitas terverifikasi.",
      error: (e) => getErrorMessage(e),
    });
    try {
      await pr;
      setAgreed(false);
      onOpenChange(false);
    } catch {
      /* biarkan modal terbuka */
    }
  };

  const birth = u
    ? [u.birthPlace, u.birthDate ? formatDate(u.birthDate) : null].filter(Boolean).join(", ")
    : "";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setAgreed(false);
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0 [&>button]:text-white/70 [&>button:hover]:text-white">
        {/* Header gelap agar konsisten dengan hero brand + aman untuk teks panjang */}
        <div className="relative bg-[#0b1220] px-6 pb-5 pt-6 text-white">
          <span className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-brand-blue/25 blur-3xl" />
          <DialogHeader className="relative space-y-1 text-left">
            <DialogTitle className="flex items-center gap-2 font-display tracking-tight text-white">
              <IdCard className="h-4 w-4 shrink-0 text-brand-mint" /> Detail Identitas
            </DialogTitle>
            <DialogDescription className="text-white/55">
              Data privat untuk verifikasi admin — periksa kelengkapan sebelum memverifikasi.
            </DialogDescription>
          </DialogHeader>

          {u && (
            <div className="relative mt-4 flex items-center gap-3">
              <Avatar className="h-12 w-12 shrink-0 ring-2 ring-white/15">
                {u.profilePictureURL && <AvatarImage src={u.profilePictureURL} alt={u.username} />}
                <AvatarFallback className="bg-white/10 text-white">{initials(u.name ?? u.username)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-semibold tracking-tight" title={u.name ?? u.username}>
                  {u.name ?? u.username}
                </p>
                <p className="truncate text-xs text-white/55" title={`@${u.username} · ${u.email}`}>
                  @{u.username} · {u.email}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant="secondary" className="rounded-sm">{u.role}</Badge>
                {u.isVerified ? (
                  <Badge variant="success" className="rounded-sm">verified</Badge>
                ) : (
                  <Badge variant="warning" className="rounded-sm">unverified</Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-5 pt-4">
          {isLoading && <BrandLoader />}
          {isError && (
            <p className="text-sm text-destructive">{getErrorMessage(error) || "Gagal memuat detail."}</p>
          )}

          {u && (
            <div className="flex flex-col gap-4">
              {/* Field identitas */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-black/5 bg-muted/20 p-4">
                <Row label="NIK" value={u.nik} mono />
                <Row label="NIP" value={u.nip} mono />
                <Row label="Institusi" value={u.institution} />
                <Row label="Jabatan" value={u.position} />
                <Row label="Telepon" value={u.phone} mono />
                <Row label="Kewarganegaraan" value={u.nationality} />
                <Row label="Tempat & tgl lahir" value={birth || null} />
                <Row label="Wallet" value={u.walletAddress ? formatShortenAddress(u.walletAddress) : null} mono />
                <div className="col-span-2">
                  <Row label="Alamat" value={u.address} />
                </div>
              </div>

              {/* Kelengkapan field wajib */}
              {u.isVerified ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-300/60 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <BadgeCheck className="h-4 w-4 shrink-0" /> Identitas sudah terverifikasi.
                </div>
              ) : u.isProfileComplete ? (
                <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-black/5 bg-muted/20 p-3 text-sm">
                  <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} className="mt-0.5" />
                  <span className="text-muted-foreground">
                    Saya telah memeriksa data & dokumen legitimasi user ini dan menyatakan benar.
                  </span>
                </label>
              ) : (
                <div className="flex items-start gap-2 rounded-xl border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0">
                    Profil belum lengkap — verifikasi terkunci. Field wajib kosong:{" "}
                    <b>{u.missingFields.map((f) => FIELD_LABEL[f] ?? f).join(", ")}</b>.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-black/5 bg-muted/20 px-6 py-3">
          {u?.walletAddress ? (
            <span className="mr-auto hidden items-center gap-1.5 font-mono text-xs text-muted-foreground sm:flex">
              <Wallet className="h-3.5 w-3.5" /> {formatShortenAddress(u.walletAddress)}
            </span>
          ) : null}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Tutup</Button>
          {u && !u.isVerified && (
            <Button
              disabled={!u.isProfileComplete || !agreed || verify.isPending}
              onClick={doVerify}
            >
              {verify.isPending && <Spinner size={16} className="text-current" />}
              Verifikasi Identitas
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
