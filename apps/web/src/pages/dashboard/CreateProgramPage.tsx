import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../components/ui/PageHeader";
import { FormInput, FormTextarea } from "../../components/ui/FormField";
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
        <PageHeader back="/dashboard/programs" title="Buat Program" subtitle="Lengkapi data program (draft). Tanda * wajib. Setelah tersimpan, submit on-chain dari Program Saya." />

        {isSubmitted && errorCount > 0 && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="p-4 text-sm text-destructive">
              ⚠️ Ada {errorCount} isian yang belum benar — periksa kolom bertanda merah di bawah.
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="font-semibold">1 · Informasi Umum</CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput control={control} name="title" isRequired label="Judul" className="sm:col-span-2" />
            <FormTextarea control={control} name="description" isRequired label="Deskripsi (ruang lingkup)" minRows={3} className="sm:col-span-2" />
            <FormInput control={control} name="category" isRequired label="Kategori" />
            <FormInput control={control} name="institutionName" isRequired label="Institusi" />
            <FormInput control={control} name="executorName" isRequired label="Pelaksana" />
            <FormInput control={control} name="executorRegistration" isRequired label="No. Registrasi Pelaksana" />
            <FormInput control={control} name="fiscalYear" isRequired type="number" label="Tahun Fiskal" placeholder="2026" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="font-semibold">2 · Lokasi &amp; Jadwal</CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput control={control} name="province" isRequired label="Provinsi" />
            <FormInput control={control} name="regency" isRequired label="Kabupaten/Kota" />
            <FormInput control={control} name="district" label="Kecamatan" placeholder="opsional" />
            <FormInput control={control} name="locationAddress" isRequired label="Alamat" />
            <FormInput control={control} name="plannedStartDate" label="Mulai" placeholder="opsional" type="date" />
            <FormInput control={control} name="plannedEndDate" label="Selesai" placeholder="opsional" type="date" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="font-semibold">3 · Anggaran</CardHeader>
          <CardContent className="flex flex-col gap-3">
            <FormInput control={control} name="totalBudget" isRequired label="Total Budget (Rupiah)" description="Angka saja, tanpa titik/koma." className="sm:max-w-xs" />
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-muted-foreground">Σ milestone: <b className="font-mono">{formatIDR(sumMs.toString())}</b></span>
              <span className="text-muted-foreground/70">/</span>
              <span className="text-muted-foreground">Total: <b className="font-mono">{formatIDR(totalBudget.toString())}</b></span>
              <Badge variant={budgetMatch ? "success" : "warning"}>{budgetMatch ? "cocok ✓" : "harus sama"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 font-semibold">
            <span>4 · Milestones ({fields.length})</span>
            <Button type="button" size="sm" variant="secondary" onClick={() => append({ title: "", description: "", milestoneBudget: "" })}>
              <Plus className="h-4 w-4" /> Tambah
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {errors.milestones?.message && <p className="text-sm text-destructive">{errors.milestones.message}</p>}
            {fields.map((f, i) => (
              <div key={f.id} className="rounded-xl border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Badge>Milestone #{i + 1}</Badge>
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
      <div className="sticky bottom-0 z-10 -mx-4 mt-2 border-t bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
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
