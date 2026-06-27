import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { getCategorias } from "../../api/categorias";
import { createReceita, deleteReceita, getReceitas, updateReceita } from "../../api/receitas";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { PageHeader } from "../../components/PageHeader";
import { Panel } from "../../components/Panel";
import { SelectField } from "../../components/SelectField";
import { TableSkeleton } from "../../components/TableSkeleton";
import { TextField } from "../../components/TextField";
import type { Categoria, Receita } from "../../types/entities";
import { getErrorMessage } from "../../utils/errors";
import { formatCurrency, formatDate, toDateInputValue } from "../../utils/formatters";
import { queryKeys } from "../../utils/queryKeys";
import { requiredPositiveInteger, requiredPositiveNumber } from "../../utils/validation";

const receitaSchema = z.object({
  descricao: z.string().trim().min(2, "Informe uma descrição."),
  valor: requiredPositiveNumber("Informe o valor.", "Informe um valor maior que zero."),
  data: z.string().min(1, "Informe a data."),
  categoriaId: requiredPositiveInteger("Selecione uma categoria."),
});

type ReceitaFormInput = z.input<typeof receitaSchema>;
type ReceitaFormValues = z.output<typeof receitaSchema>;

interface ReceitaFormProps {
  categorias: Categoria[];
  categoriasError: boolean;
  categoriasLoading: boolean;
  initialData: Receita | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: ReceitaFormValues) => void;
}

function ReceitaForm({
  categorias,
  categoriasError,
  categoriasLoading,
  initialData,
  isSubmitting,
  onCancel,
  onSubmit,
}: ReceitaFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReceitaFormInput, unknown, ReceitaFormValues>({
    resolver: zodResolver(receitaSchema),
    defaultValues: {
      descricao: "",
      valor: 0,
      data: "",
      categoriaId: 0,
    },
  });

  useEffect(() => {
    reset({
      descricao: initialData?.descricao ?? "",
      valor: initialData?.valor ?? 0,
      data: initialData ? toDateInputValue(initialData.data) : "",
      categoriaId: initialData?.categoriaId ?? 0,
    });
  }, [initialData, reset]);

  const selectDisabled = categoriasLoading || categoriasError || categorias.length === 0;

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="Descrição"
        placeholder="Salário"
        error={errors.descricao?.message}
        {...register("descricao")}
      />
      <TextField
        label="Valor"
        type="number"
        step="0.01"
        min="0"
        error={errors.valor?.message}
        {...register("valor", { valueAsNumber: true })}
      />
      <TextField
        label="Data"
        type="date"
        error={errors.data?.message}
        {...register("data")}
      />
      <SelectField
        label="Categoria"
        error={errors.categoriaId?.message}
        disabled={selectDisabled}
        {...register("categoriaId", { valueAsNumber: true })}
      >
        <option value={0}>
          {categoriasLoading
            ? "Carregando categorias..."
            : categoriasError
              ? "Erro ao carregar categorias"
              : "Selecione uma categoria"}
        </option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.nome}
          </option>
        ))}
      </SelectField>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="submit"
          fullWidth
          icon={initialData ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          isLoading={isSubmitting}
          disabled={categoriasLoading}
        >
          {initialData ? "Salvar alterações" : "Criar receita"}
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

export function ReceitasPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Receita | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const receitasQuery = useQuery({
    queryKey: queryKeys.receitas,
    queryFn: getReceitas,
  });

  const categoriasQuery = useQuery({
    queryKey: queryKeys.categorias,
    queryFn: getCategorias,
  });

  const categorias = useMemo(() => categoriasQuery.data ?? [], [categoriasQuery.data]);
  const categoriasById = useMemo(
    () => new Map(categorias.map((categoria) => [categoria.id, categoria.nome])),
    [categorias]
  );

  const saveMutation = useMutation({
    mutationFn: (values: ReceitaFormValues) => {
      const payload = {
        descricao: values.descricao,
        valor: values.valor,
        data: new Date(values.data).toISOString(),
        categoriaId: values.categoriaId,
      };

      return editing ? updateReceita(editing.id, payload) : createReceita(payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.receitas }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
      ]);
      toast.success(editing ? "Receita atualizada com sucesso." : "Receita criada com sucesso.");
      setEditing(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Não foi possível salvar a receita."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReceita,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.receitas }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
      ]);
      toast.success("Receita excluída com sucesso.");
      setPendingDeleteId(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Não foi possível excluir a receita."));
    },
  });

  const receitas = receitasQuery.data ?? [];

  function handleDelete(id: number) {
    if (pendingDeleteId === id) {
      deleteMutation.mutate(id);
      return;
    }

    setPendingDeleteId(id);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Receitas" subtitle="Registre entradas financeiras." />

      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <Panel title={editing ? "Editar receita" : "Nova receita"}>
          <ReceitaForm
            categorias={categorias}
            categoriasError={categoriasQuery.isError}
            categoriasLoading={categoriasQuery.isLoading}
            initialData={editing}
            isSubmitting={saveMutation.isPending}
            onCancel={() => setEditing(null)}
            onSubmit={(values) => saveMutation.mutate(values)}
          />
        </Panel>

        <Panel title="Receitas cadastradas">
          {receitasQuery.isLoading ? <TableSkeleton columns={5} /> : null}

          {receitasQuery.isError ? (
            <ErrorState
              message={getErrorMessage(receitasQuery.error, "Não foi possível carregar receitas.")}
              onRetry={() => void receitasQuery.refetch()}
            />
          ) : null}

          {receitasQuery.isSuccess && receitas.length === 0 ? (
            <EmptyState title="Nenhuma receita cadastrada." />
          ) : null}

          {receitas.length > 0 ? (
            <>
              <div className="space-y-3 md:hidden">
                {receitas.map((receita) => (
                  <article key={receita.id} className="rounded-lg border border-fin-border bg-zinc-950/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-fin-text">{receita.descricao}</p>
                        <p className="mt-1 text-xs text-fin-muted">ID {receita.id}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-fin-muted">Valor</span>
                        <span className="text-fin-success">{formatCurrency(receita.valor)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-fin-muted">Data</span>
                        <span className="text-fin-text">{formatDate(receita.data)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-fin-muted">Categoria</span>
                        <span className="text-fin-text">
                          {categoriasById.get(receita.categoriaId) ?? `Categoria ${receita.categoriaId}`}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        icon={<Pencil className="h-4 w-4" />}
                        onClick={() => setEditing(receita)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant={pendingDeleteId === receita.id ? "danger" : "ghost"}
                        size="sm"
                        icon={<Trash2 className="h-4 w-4" />}
                        isLoading={deleteMutation.isPending && pendingDeleteId === receita.id}
                        onClick={() => handleDelete(receita.id)}
                      >
                        {pendingDeleteId === receita.id ? "Confirmar" : "Excluir"}
                      </Button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-fin-border text-left text-sm">
                <thead className="text-xs uppercase text-fin-muted">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Descrição</th>
                    <th className="px-3 py-3 font-semibold">Valor</th>
                    <th className="px-3 py-3 font-semibold">Data</th>
                    <th className="px-3 py-3 font-semibold">Categoria</th>
                    <th className="px-3 py-3 text-right font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fin-border">
                  {receitas.map((receita) => (
                    <tr key={receita.id}>
                      <td className="px-3 py-4 font-medium text-fin-text">{receita.descricao}</td>
                      <td className="px-3 py-4 text-fin-success">{formatCurrency(receita.valor)}</td>
                      <td className="px-3 py-4 text-fin-muted">{formatDate(receita.data)}</td>
                      <td className="px-3 py-4 text-fin-muted">
                        {categoriasById.get(receita.categoriaId) ?? `Categoria ${receita.categoriaId}`}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            icon={<Pencil className="h-4 w-4" />}
                            onClick={() => setEditing(receita)}
                          >
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant={pendingDeleteId === receita.id ? "danger" : "ghost"}
                            size="sm"
                            icon={<Trash2 className="h-4 w-4" />}
                            isLoading={deleteMutation.isPending && pendingDeleteId === receita.id}
                            onClick={() => handleDelete(receita.id)}
                          >
                            {pendingDeleteId === receita.id ? "Confirmar" : "Excluir"}
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
