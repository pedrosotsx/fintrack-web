import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { registerRequest } from "../../api/auth";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { useAuth } from "../../hooks/useAuth";
import { AuthLayout } from "../../layouts/AuthLayout";
import { getErrorMessage } from "../../utils/errors";

const registerSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().min(1, "Informe o e-mail.").email("Informe um e-mail válido."),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
    },
  });

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => {
      login(data.token);
      toast.success("Cadastro realizado com sucesso.");
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Não foi possível criar sua conta."));
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Comece a organizar sua vida financeira no FinTrack."
      footer={
        <>
          Já tem conta?{" "}
          <Link className="font-semibold text-fin-red hover:text-red-300" to="/login">
            Entrar
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <TextField
          label="Nome"
          autoComplete="name"
          placeholder="Seu nome"
          error={errors.nome?.message}
          {...register("nome")}
        />
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
          autoComplete="new-password"
          placeholder="Mínimo de 6 caracteres"
          error={errors.senha?.message}
          {...register("senha")}
        />
        <Button
          type="submit"
          fullWidth
          icon={<UserPlus className="h-4 w-4" />}
          isLoading={mutation.isPending}
        >
          Cadastrar
        </Button>
      </form>
    </AuthLayout>
  );
}
