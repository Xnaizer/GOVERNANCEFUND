
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Input, Button } from "@heroui/react";
import toast from "react-hot-toast";
import { AuthLayout } from "../components/AuthLayout";
import { loginSchema, type LoginForm } from "../schemas/auth";
import { useLogin } from "../hooks/useAuth";
import { getErrorMessage } from "../utils/error";

export function LoginPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutateAsync(values);
      toast.success("Berhasil masuk.");
      navigate("/"); 
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  });

  return (
    <AuthLayout title="Masuk" footer={<>Belum punya akun? <Link to="/register" className="text-brand-blue">Daftar</Link></>}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input label="Email atau Username" {...register("identifier")} isInvalid={!!errors.identifier} errorMessage={errors.identifier?.message} />
        <Input label="Password" type="password" {...register("password")} isInvalid={!!errors.password} errorMessage={errors.password?.message} />
        <Button type="submit" color="primary" isLoading={isPending}>Masuk</Button>
      </form>
    </AuthLayout>
  );
}
