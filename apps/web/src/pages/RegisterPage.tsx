import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Input, Button } from "@heroui/react";
import toast from "react-hot-toast";
import { AuthLayout } from "../components/AuthLayout";
import { registerSchema, type RegisterForm } from "../schemas/auth";
import { useRegister } from "../hooks/useAuth";
import { getErrorMessage } from "../utils/error";

export function RegisterPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useRegister();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutateAsync(values);
      toast.success("Registrasi berhasil. Cek email untuk verifikasi.");
      navigate("/login");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  });

  return (
    <AuthLayout title="Buat Akun" footer={<>Sudah punya akun? <Link to="/login" className="text-brand-blue">Masuk</Link></>}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input label="Username" {...register("username")} isInvalid={!!errors.username} errorMessage={errors.username?.message} />
        <Input label="Email" type="email" {...register("email")} isInvalid={!!errors.email} errorMessage={errors.email?.message} />
        <Input label="Password" type="password" {...register("password")} isInvalid={!!errors.password} errorMessage={errors.password?.message} />
        <Button type="submit" color="primary" isLoading={isPending}>Daftar</Button>
      </form>
    </AuthLayout>
  );
}
