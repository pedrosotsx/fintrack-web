import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  createCategoria,
  deleteCategoria,
  getCategorias,
  updateCategoria,
} from "../../api/categorias";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { PageHeader } from "../../components/PageHeader";
import { Panel } from "../../components/Panel";
import { TableSkeleton } from "../../components/TableSkeleton";
import { TextField } from "../../components/TextField";
import type { Categoria } from "../../types/entities";
import { getErrorMessage } from "../../utils/errors";
import { queryKeys } from "../../utils/queryKeys";

const categoriaSchema = z.object({
  nome: z.string().trim().min(2, "Informe uma categoria válida."),
});

type CategoriaFormValues = z.infer<typeof categoriaSchema>;

interface CategoriaFormProps {
  initialData: Categoria | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: CategoriaFormValues) => void;
}

function CategoriaForm({ initialData, isSubmitting, onCancel, onSubmit }: CategoriaFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nome: "",
    },
  });

  useEffect(() => {
    reset({
      nome: initialData?.nome ?? "",
    });
  }, [initialData, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="Nome"
        placeholder="Alimentação"
        error={errors.nome?.message}
        {...register("nome")}
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="submit"
          fullWidth
          icon={initialData ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          isLoading={isSubmitting}
        >
          {initialData ? "Salvar alterações" : "Criar categoria"}
        </Button>
        {initialData ? (
          <Button
            type="button"
            fullWidth
            variant="secondary"
            icon={<X className="h-4 w-4" />}
            onClick={onCancel}
          >
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export function CategoriasPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const categoriasQuery = useQuery({
    queryKey: queryKeys.categorias,
    queryFn: getCategorias,
  });

  const saveMutation = useMutation({
    mutationFn: (values: CategoriaFormValues) =>
      editing ? updateCategoria(editing.id, values) : createCategoria(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categorias });
      toast.success(editing ? "Categoria atualizada com sucesso." : "Categoria criada com sucesso.");
      setEditing(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Não foi possível salvar a categoria."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategoria,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categorias });
      toast.success("Categoria excluída com sucesso.");
      setPendingDeleteId(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Não foi possível excluir a categoria."));
    },
  });

  const categorias = categoriasQuery.data ?? [];

  function handleDelete(id: number) {
    if (pendingDeleteId === id) {
      deleteMutation.mutate(id);
      return;
    }

    setPendingDeleteId(id);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Categorias" subtitle="Organize os lançamentos por tipo." />

      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <Panel title={editing ? "Editar categoria" : "Nova categoria"}>
          <CategoriaForm
            initialData={editing}
            isSubmitting={saveMutation.isPending}
            onCancel={() => setEditing(null)}
            onSubmit={(values) => saveMutation.mutate(values)}
          />
        </Panel>

        <Panel title="Categorias cadastradas">
          {categoriasQuery.isLoading ? <TableSkeleton columns={3} /> : null}

          {categoriasQuery.isError ? (
            <ErrorState
              message={getErrorMessage(categoriasQuery.error, "Não foi possível carregar categorias.")}
              onRetry={() => void categoriasQuery.refetch()}
            />
          ) : null}

          {categoriasQuery.isSuccess && categorias.length === 0 ? (
            <EmptyState
              title="Nenhuma categoria cadastrada."
              actionLabel="Adicionar categoria"
              onAction={() => setEditing(null)}
            />
          ) : null}

          {categorias.length > 0 ? (
            <>
              <div className="space-y-3 md:hidden">
                {categorias.map((categoria) => (
                  <article key={categoria.id} className="rounded-lg border border-fin-border bg-zinc-950/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-fin-text">{categoria.nome}</p>
                        <p className="mt-1 text-xs text-fin-muted">ID {categoria.id}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        icon={<Pencil className="h-4 w-4" />}
                        onClick={() => setEditing(categoria)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant={pendingDeleteId === categoria.id ? "danger" : "ghost"}
                        size="sm"
                        icon={<Trash2 className="h-4 w-4" />}
                        isLoading={deleteMutation.isPending && pendingDeleteId === categoria.id}
                        onClick={() => handleDelete(categoria.id)}
                      >
                        {pendingDeleteId === categoria.id ? "Confirmar" : "Excluir"}
                      </Button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-fin-border text-left text-sm">
                <thead className="text-xs uppercase text-fin-muted">
                  <tr>
                    <th className="px-3 py-3 font-semibold">ID</th>
                    <th className="px-3 py-3 font-semibold">Nome</th>
                    <th className="px-3 py-3 text-right font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fin-border">
                  {categorias.map((categoria) => (
                    <tr key={categoria.id}>
                      <td className="px-3 py-4 text-fin-muted">{categoria.id}</td>
                      <td className="px-3 py-4 font-medium text-fin-text">{categoria.nome}</td>
                      <td className="px-3 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            icon={<Pencil className="h-4 w-4" />}
                            onClick={() => setEditing(categoria)}
                          >
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant={pendingDeleteId === categoria.id ? "danger" : "ghost"}
                            size="sm"
                            icon={<Trash2 className="h-4 w-4" />}
                            isLoading={deleteMutation.isPending && pendingDeleteId === categoria.id}
                            onClick={() => handleDelete(categoria.id)}
                          >
                            {pendingDeleteId === categoria.id ? "Confirmar" : "Excluir"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          ) : null}
        </Panel>
      </div>
    </div>
  );
}
