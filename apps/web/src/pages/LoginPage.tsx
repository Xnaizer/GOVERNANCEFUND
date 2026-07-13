import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AuthLayout } from "../components/AuthLayout";
import { FormInput } from "../components/ui/FormField";
import { loginSchema, type LoginForm } from "../schemas/auth";
import { useLogin } from "../hooks/useAuth";
import { useTurnstile } from "../hooks/useTurnstile";
import { getErrorMessage } from "../utils/error";

export function LoginPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useLogin();
  const turnstile = useTurnstile();
  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutateAsync({ ...values, turnstileToken: turnstile.token });
      toast.success("Berhasil masuk.");
      navigate("/dashboard");
    } catch (e) {
      turnstile.reset(); // token sekali-pakai → minta yang baru
      toast.error(getErrorMessage(e));
    }
  });

  return (
    <AuthLayout
      title="Masuk"
      subtitle="Lanjut mengelola atau mengawasi anggaran."
      icon={<LogIn className="h-7 w-7" strokeWidth={2.2} />}
      greeting={{ title: <>Hei, senang <span className="text-gradient">melihatmu lagi.</span></>, text: "Masuk untuk melanjutkan mengawal dana publik." }}
      footer={<>Belum punya akun? <Link to="/register" className="font-medium text-brand-blue hover:underline">Daftar</Link></>}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormInput control={control} name="identifier" label="Email atau Username" isRequired autoComplete="username" />
        <FormInput control={control} name="password" label="Password" type="password" isRequired autoComplete="current-password" />
        <div className="-mt-1 text-right">
          <Link to="/forgot-password" className="text-xs font-medium text-brand-blue hover:underline">Lupa password?</Link>
        </div>
        {turnstile.widget}
        <Button type="submit" size="lg" className="mt-2 w-full bg-linear-to-r from-brand-mint to-brand-blue font-medium text-white transition-opacity hover:opacity-95" disabled={isPending || !turnstile.ready}>
          {isPending && <Spinner size={16} className="text-current" />}
          Masuk
        </Button>
      </form>
    </AuthLayout>
  );
}
