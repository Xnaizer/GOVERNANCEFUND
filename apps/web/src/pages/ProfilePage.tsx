import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { PageHeader } from "../components/ui/PageHeader";
import { FormInput } from "../components/ui/FormField";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { useMe } from "../hooks/useAuth";
import { useUpdateProfile, useUploadAvatar, useUploadBanner } from "../hooks/useProfile";
import { useBindWallet } from "../hooks/useBindWallet";
import { profileSchema, type ProfileForm } from "../schemas/profile";
import { getErrorMessage } from "../utils/error";
import { formatShortenAddress } from "../utils/format";

function initials(s: string): string {
  return s.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
}

export function ProfilePage() {
  const { data: me, isLoading } = useMe();
  const update = useUpdateProfile();
  const avatarUp = useUploadAvatar();
  const bannerUp = useUploadBanner();
  const bind = useBindWallet();
  const { address, isConnected } = useAccount();

  const { control, handleSubmit } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: me
      ? {
          name: me.name ?? "", nik: me.nik ?? "", nip: me.nip ?? "",
          institution: me.institution ?? "", position: me.position ?? "",
          birthPlace: me.birthPlace ?? "",
          birthDate: me.birthDate ? me.birthDate.slice(0, 10) : "", // ISO → YYYY-MM-DD utk input date
          address: me.address ?? "", phone: me.phone ?? "", nationality: me.nationality ?? "",
        }
      : undefined,
  });

  if (isLoading) return <Spinner />;
  if (!me) return null;

  const onSubmit = handleSubmit(async (values) => {
    const payload = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== "" && v != null));
    try {
      await update.mutateAsync(payload);
      toast.success("Profil diperbarui.");
    } catch (e) { toast.error(getErrorMessage(e)); }
  });

  const onFile = (file: File | undefined, kind: "avatar" | "banner") => {
    if (!file) return;
    const m = kind === "avatar" ? avatarUp : bannerUp;
    toast.promise(m.mutateAsync(file), { loading: "Mengunggah…", success: "Foto diperbarui.", error: (e) => getErrorMessage(e) });
  };

  const onBind = () =>
    toast.promise(bind.mutateAsync(), { loading: "Menandatangani…", success: "Wallet terhubung.", error: (e) => getErrorMessage(e) });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="Profil Saya" subtitle="Kelola identitas, wallet, dan foto." />
      <Card className="overflow-hidden pt-0">
        <div className="relative">
          <div className="h-40 w-full overflow-hidden bg-linear-to-br from-brand-mint to-brand-blue">
            {me.profileBannerURL && <img src={me.profileBannerURL} alt="banner" className="h-full w-full object-cover" />}
          </div>
          <label htmlFor="banner-input" className="absolute right-2 top-2 cursor-pointer rounded-md bg-background/85 px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-background">
            {bannerUp.isPending ? "Mengunggah…" : "Ganti Banner"}
            <input id="banner-input" type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0], "banner")} />
          </label>
          <div className="absolute -bottom-10 left-6">
            <div className="relative">
              <Avatar className="h-20 w-20 text-lg ring-4 ring-background">
                {me.profilePictureURL && <AvatarImage src={me.profilePictureURL} alt={me.username} />}
                <AvatarFallback>{initials(me.name ?? me.username)}</AvatarFallback>
              </Avatar>
              <label htmlFor="avatar-input" aria-label="Ganti foto profil" className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-brand-blue text-sm text-white shadow-sm transition-opacity hover:opacity-90">
                {avatarUp.isPending ? "…" : "✎"}
                <input id="avatar-input" type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0], "avatar")} />
              </label>
            </div>
          </div>
        </div>
        <CardContent className="pt-12">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{me.name ?? me.username}</h1>
            <Badge>{me.role}</Badge>
            {me.isVerified && <Badge variant="success">Verified</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{me.email} · Reputasi {me.reputationScore}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="font-semibold">Wallet</CardHeader>
        <CardContent className="flex flex-col gap-3">
          {me.walletAddress ? (
            <Badge variant="success" className="w-fit font-mono">{formatShortenAddress(me.walletAddress)} · terhubung</Badge>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Hubungkan lalu tanda tangani nonce untuk mengikat wallet ke akun (sekali, sebelum punya role).</p>
              <div className="flex flex-wrap items-center gap-3">
                <ConnectButton showBalance={false} chainStatus="icon" />
                <Button disabled={!isConnected || bind.isPending} onClick={onBind}>
                  {bind.isPending && <Spinner size={16} className="text-current" />}
                  Bind Wallet {address ? `(${formatShortenAddress(address)})` : ""}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="font-semibold">Data Identitas</CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput control={control} name="name" label="Nama" />
            <FormInput control={control} name="nik" label="NIK" />
            <FormInput control={control} name="nip" label="NIP" />
            <FormInput control={control} name="institution" label="Institusi" />
            <FormInput control={control} name="position" label="Jabatan" />
            <FormInput control={control} name="phone" label="Telepon" />
            <FormInput control={control} name="birthPlace" label="Tempat Lahir" />
            <FormInput control={control} name="birthDate" label="Tanggal Lahir" type="date" />
            <FormInput control={control} name="nationality" label="Kewarganegaraan" />
            <FormInput control={control} name="address" label="Alamat" className="sm:col-span-2" />
            <Button type="submit" disabled={update.isPending} className="w-fit sm:col-span-2">
              {update.isPending && <Spinner size={16} className="text-current" />}
              Simpan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
