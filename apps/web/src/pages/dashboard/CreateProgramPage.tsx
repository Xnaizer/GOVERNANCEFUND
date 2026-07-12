import type { ReactNode } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Info, FileText, MapPin, Wallet, Flag, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../components/ui/PageHeader";
import { FormInput, FormTextarea, FormDatePicker } from "../../components/ui/FormField";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { createProgramSchema, type CreateProgramForm } from "../../schemas/program";
import { useCreateProgram } from "../../hooks/useCreateProgram";
import { getErrorMessage } from "../../utils/error";
import { formatIDR } from "../../utils/format";

function bigintSafe(v: string): bigint {
  try { return /^\d+$/.test(v) ? BigInt(v) : 0n; } catch { return 0n; }
}

/** Kepala section dengan ikon berwarna (tanpa bg shadow). */
function SectionTitle({ icon, step, children }: { icon: ReactNode; step: number; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 font-display font-semibold tracking-tight">
      <span className="text-brand-blue">{icon}</span>
      <span className="text-muted-foreground">{step} ·</span> {children}
    </div>
  );
}

/** Kotak bantuan kontekstual. */
function HelpNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-brand-blue/5 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-blue" />
      <span>{children}</span>
    </div>
  );
}

export function CreateProgramPage() {
  const navigate = useNavigate();
  const create = useCreateProgram();
  const { control, handleSubmit, watch, formState: { errors, isSubmitted } } = useForm<CreateProgramForm>({
    resolver: zodResolver(createProgramSchema),
    mode: "onTouched",
    defaultValues: { milestones: [{ title: "", description: "", milestoneBudget: "" }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "milestones" });
  const errorCount = Object.keys(errors).length;

  // Ringkasan anggaran live.
  const totalBudget = bigintSafe(watch("totalBudget") ?? "");
  const sumMs = (watch("milestones") ?? []).reduce((a, m) => a + bigintSafe(m?.milestoneBudget ?? ""), 0n);
  const budgetMatch = totalBudget > 0n && sumMs === totalBudget;

  const onSubmit = handleSubmit(async (v) => {
    try {
      const res = await create.mutateAsync({
        ...v,
        milestoneCount: v.milestones.length,
        plannedStartDate: v.plannedStartDate ? new Date(v.plannedStartDate).toISOString() : undefined,
        plannedEndDate: v.plannedEndDate ? new Date(v.plannedEndDate).toISOString() : undefined,
      });
      toast.success(`Draft dibuat (#${res.programId}). Submit on-chain dari "Program Saya".`);
      navigate("/dashboard/programs");
    } catch (e) { toast.error(getErrorMessage(e)); }
  });

  return (
    <>
      <form onSubmit={onSubmit} className="mx-auto flex max-w-3xl flex-col gap-6 pb-24">
        <PageHeader back="/dashboard/programs" eyebrow="PIC" title="Buat Program" gradient subtitle="Lengkapi data program (draft). Tanda * wajib. Setelah tersimpan, submit on-chain dari Program Saya." />

        {/* Panduan alur — konteks sebelum mengisi */}
        <Card className="rounded-2xl border-brand-blue/20 bg-brand-blue/3 shadow-none">
          <CardContent className="flex gap-3 p-4 text-sm">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
            <div className="flex flex-col gap-1.5 text-muted-foreground">
              <p className="font-medium text-foreground">Cara kerja pembuatan program</p>
              <p>
                Data ini <b>disegel</b> (di-hash) begitu program disubmit on-chain — 15 field
                inti tidak bisa diubah lagi. Isi dengan benar; kesalahan setelah submit akan
                terdeteksi sebagai <i>hash mismatch</i>.
              </p>
              <p>
                Sekarang Anda menyimpan <b>draft</b> dulu. Pengajuan ke blockchain (bayar gas)
                dilakukan dari <b>Program Saya</b>. Total budget harus sama dengan jumlah seluruh
                milestone.
              </p>
            </div>
          </CardContent>
        </Card>

        {isSubmitted && errorCount > 0 && (
          <Card className="rounded-2xl border-destructive/40 bg-destructive/5 shadow-none">
            <CardContent className="p-4 text-sm text-destructive">
              ⚠️ Ada {errorCount} isian yang belum benar — periksa kolom bertanda merah di bawah.
            </CardContent>
          </Card>
        )}

        <Card className="rounded-2xl border-black/5 shadow-none">
          <CardHeader><SectionTitle icon={<FileText className="h-4 w-4" />} step={1}>Informasi Umum</SectionTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><HelpNote>Judul & deskripsi adalah <b>janji ruang lingkup</b> program dan ikut disegel. Tulis deskripsi yang menjelaskan tujuan dan cakupan kegiatan secara jelas.</HelpNote></div>
            <FormInput control={control} name="title" isRequired label="Judul" placeholder="mis. Pembangunan Jembatan Desa Sukamaju" className="sm:col-span-2" />
            <FormTextarea control={control} name="description" isRequired label="Deskripsi (ruang lingkup)" placeholder="Jelaskan tujuan, cakupan, dan hasil yang diharapkan." minRows={3} className="sm:col-span-2" inputClassName="shadow-none" />
            <FormInput control={control} name="category" isRequired label="Kategori" placeholder="mis. Infrastruktur" />
            <FormInput control={control} name="institutionName" isRequired label="Institusi" placeholder="mis. Dinas PU Kab. X" />
            <FormInput control={control} name="executorName" isRequired label="Pelaksana" placeholder="Nama kontraktor/pelaksana" />
            <FormInput control={control} name="executorRegistration" isRequired label="No. Registrasi Pelaksana" placeholder="No. izin/registrasi" />
            <FormInput control={control} name="fiscalYear" isRequired type="number" label="Tahun Fiskal" placeholder="2026" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-none">
          <CardHeader><SectionTitle icon={<MapPin className="h-4 w-4" />} step={2}>Lokasi &amp; Jadwal</SectionTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput control={control} name="province" isRequired label="Provinsi" />
            <FormInput control={control} name="regency" isRequired label="Kabupaten/Kota" />
            <FormInput control={control} name="district" label="Kecamatan" placeholder="opsional" />
            <FormInput control={control} name="locationAddress" isRequired label="Alamat" />
            <FormDatePicker control={control} name="plannedStartDate" label="Mulai" placeholder="Pilih tanggal mulai" inputClassName="shadow-none" />
            <FormDatePicker control={control} name="plannedEndDate" label="Selesai" placeholder="Pilih tanggal selesai" inputClassName="shadow-none" />
            <div className="sm:col-span-2"><HelpNote>Jadwal mulai/selesai <b>tidak disegel</b> — proyek boleh dijadwal ulang tanpa memicu peringatan fraud.</HelpNote></div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-none">
          <CardHeader><SectionTitle icon={<Wallet className="h-4 w-4" />} step={3}>Anggaran</SectionTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            <HelpNote>Nominal dalam <b>Rupiah utuh</b>: 1 Rupiah = 1 token eIDR di blockchain. Ketik angka saja tanpa titik/koma (mis. <code>1000000</code> untuk sejuta).</HelpNote>
            <FormInput control={control} name="totalBudget" isRequired label="Total Budget (Rupiah)" description="Angka saja, tanpa titik/koma." className="sm:max-w-xs" />
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-muted-foreground">Σ milestone: <b className="font-mono">{formatIDR(sumMs.toString())}</b></span>
              <span className="text-muted-foreground/70">/</span>
              <span className="text-muted-foreground">Total: <b className="font-mono">{formatIDR(totalBudget.toString())}</b></span>
              <Badge variant={budgetMatch ? "success" : "warning"} className="rounded-sm">{budgetMatch ? "cocok ✓" : "harus sama"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-none">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <SectionTitle icon={<Flag className="h-4 w-4" />} step={4}>Milestones ({fields.length})</SectionTitle>
            <Button type="button" size="sm" variant="secondary" onClick={() => append({ title: "", description: "", milestoneBudget: "" })}>
              <Plus className="h-4 w-4" /> Tambah
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <HelpNote>Dana cair <b>bertahap per milestone</b> secara berurutan. Tiap milestone butuh 3 tanda tangan (admin + validator + auditor) sebelum bisa ditarik. Jumlah budget seluruh milestone harus = total budget.</HelpNote>
            {errors.milestones?.message && <p className="text-sm text-destructive">{errors.milestones.message}</p>}
            {fields.map((f, i) => (
              <div key={f.id} className="rounded-xl border border-black/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Badge className="rounded-sm">Milestone #{i + 1}</Badge>
                  {fields.length > 1 && (
                    <Button type="button" size="icon" variant="ghost" className="text-destructive" aria-label="Hapus milestone" onClick={() => remove(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormInput control={control} name={`milestones.${i}.title`} isRequired label="Judul milestone" />
                  <FormInput control={control} name={`milestones.${i}.milestoneBudget`} isRequired label="Budget (Rupiah)" />
                  <FormInput control={control} name={`milestones.${i}.description`} label="Deskripsi" placeholder="opsional" className="sm:col-span-2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </form>

      {/* Action bar sticky */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-2 border-t border-black/5 bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <span className="text-sm text-muted-foreground">{budgetMatch ? "Anggaran cocok." : "Pastikan Σ milestone = total budget."}</span>
          <Button type="button" disabled={create.isPending} onClick={() => onSubmit()}>
            {create.isPending && <Spinner size={16} className="text-current" />}
            Simpan Draft
          </Button>
        </div>
      </div>
    </>
  );
}
