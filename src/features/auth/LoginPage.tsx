import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { loginRequest } from "../../api/auth";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { useAuth } from "../../hooks/useAuth";
import { AuthLayout } from "../../layouts/AuthLayout";
import { getErrorMessage } from "../../utils/errors";

const loginSchema = z.object({
  email: z.string().min(1, "Informe o e-mail.").email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe a senha."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      login(data.token);
      toast.success("Login realizado com sucesso.");
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "E-mail ou senha inválidos."));
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout
      title="Acesse sua conta"
      subtitle="Entre para acompanhar suas receitas, despesas e metas."
      footer={
        <>
          Não tem conta?{" "}
          <Link className="font-semibold text-fin-red hover:text-red-300" to="/cadastro">
            Cadastre-se
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="seuemail@email.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Senha"
          type="password"
          autoComplete="current-password"
          placeholder="Sua senha"
          error={errors.senha?.message}
          {...register("senha")}
        />
        <Button
          type="submit"
          fullWidth
          icon={<LogIn className="h-4 w-4" />}
          isLoading={mutation.isPending}
        >
          Entrar
        </Button>
      </form>
    </AuthLayout>
  );
}
