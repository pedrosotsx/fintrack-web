import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createMeta, deleteMeta, getMetas, updateMeta } from "../../api/metas";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { PageHeader } from "../../components/PageHeader";
import { Panel } from "../../components/Panel";
import { TableSkeleton } from "../../components/TableSkeleton";
import { TextField } from "../../components/TextField";
import type { Meta } from "../../types/entities";
import { getErrorMessage } from "../../utils/errors";
import { formatCurrency } from "../../utils/formatters";
import { queryKeys } from "../../utils/queryKeys";
import { requiredNonNegativeNumber, requiredPositiveNumber } from "../../utils/validation";

const metaSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da meta."),
  valorMeta: requiredPositiveNumber("Informe o valor da meta.", "Informe um valor maior que zero."),
  valorAtual: requiredNonNegativeNumber("Informe o valor atual.", "O valor atual não pode ser negativo."),
});

type MetaFormInput = z.input<typeof metaSchema>;
type MetaFormValues = z.output<typeof metaSchema>;

interface MetaFormProps {
  initialData: Meta | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: MetaFormValues) => void;
}

function MetaForm({ initialData, isSubmitting, onCancel, onSubmit }: MetaFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MetaFormInput, unknown, MetaFormValues>({
    resolver: zodResolver(metaSchema),
    defaultValues: {
      nome: "",
      valorMeta: 0,
      valorAtual: 0,
    },
  });

  useEffect(() => {
    reset({
      nome: initialData?.nome ?? "",
      valorMeta: initialData?.valorMeta ?? 0,
      valorAtual: initialData?.valorAtual ?? 0,
    });
  }, [initialData, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="Nome"
        placeholder="Reserva de emergência"
        error={errors.nome?.message}
        {...register("nome")}
      />
      <TextField
        label="Valor da meta"
        type="number"
        step="0.01"
        min="0"
        error={errors.valorMeta?.message}
        {...register("valorMeta", { valueAsNumber: true })}
      />
      <TextField
        label="Valor atual"
        type="number"
        step="0.01"
        min="0"
        error={errors.valorAtual?.message}
        {...register("valorAtual", { valueAsNumber: true })}
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="submit"
          fullWidth
          icon={initialData ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          isLoading={isSubmitting}
        >
          {initialData ? "Salvar alterações" : "Criar meta"}
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

function getProgress(meta: Meta) {
  if (meta.valorMeta <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((meta.valorAtual / meta.valorMeta) * 100));
}

export function MetasPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Meta | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const metasQuery = useQuery({
    queryKey: queryKeys.metas,
    queryFn: getMetas,
  });

  const saveMutation = useMutation({
    mutationFn: (values: MetaFormValues) =>
      editing ? updateMeta(editing.id, values) : createMeta(values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.metas }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
      ]);
      toast.success(editing ? "Meta atualizada com sucesso." : "Meta criada com sucesso.");
      setEditing(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Não foi possível salvar a meta."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMeta,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.metas }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
      ]);
      toast.success("Meta excluída com sucesso.");
      setPendingDeleteId(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Não foi possível excluir a meta."));
    },
  });

  const metas = metasQuery.data ?? [];

  function handleDelete(id: number) {
    if (pendingDeleteId === id) {
      deleteMutation.mutate(id);
      return;
    }

    setPendingDeleteId(id);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Metas" subtitle="Acompanhe objetivos financeiros." />

      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <Panel title={editing ? "Editar meta" : "Nova meta"}>
          <MetaForm
            initialData={editing}
            isSubmitting={saveMutation.isPending}
            onCancel={() => setEditing(null)}
            onSubmit={(values) => saveMutation.mutate(values)}
          />
        </Panel>

        <Panel title="Metas cadastradas">
          {metasQuery.isLoading ? <TableSkeleton columns={5} /> : null}

          {metasQuery.isError ? (
            <ErrorState
              message={getErrorMessage(metasQuery.error, "Não foi possível carregar metas.")}
              onRetry={() => void metasQuery.refetch()}
            />
          ) : null}

          {metasQuery.isSuccess && metas.length === 0 ? (
            <EmptyState title="Nenhuma meta cadastrada." />
          ) : null}

          {metas.length > 0 ? (
            <>
              <div className="space-y-3 md:hidden">
                {metas.map((meta) => {
                  const progress = getProgress(meta);

                  return (
                    <article key={meta.id} className="rounded-lg border border-fin-border bg-zinc-950/50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-fin-text">{meta.nome}</p>
                          <p className="mt-1 text-xs text-fin-muted">ID {meta.id}</p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-fin-muted">Valor atual</span>
                          <span className="text-fin-success">{formatCurrency(meta.valorAtual)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-fin-muted">Valor da meta</span>
                          <span className="text-fin-text">{formatCurrency(meta.valorMeta)}</span>
                        </div>
                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs text-fin-muted">
                            <span>Progresso</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-zinc-800">
                            <div
                              className="h-2 rounded-full bg-fin-success"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          icon={<Pencil className="h-4 w-4" />}
                          onClick={() => setEditing(meta)}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant={pendingDeleteId === meta.id ? "danger" : "ghost"}
                          size="sm"
                          icon={<Trash2 className="h-4 w-4" />}
                          isLoading={deleteMutation.isPending && pendingDeleteId === meta.id}
                          onClick={() => handleDelete(meta.id)}
                        >
                          {pendingDeleteId === meta.id ? "Confirmar" : "Excluir"}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-fin-border text-left text-sm">
                <thead className="text-xs uppercase text-fin-muted">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Nome</th>
                    <th className="px-3 py-3 font-semibold">Valor atual</th>
                    <th className="px-3 py-3 font-semibold">Valor da meta</th>
                    <th className="px-3 py-3 font-semibold">Progresso</th>
                    <th className="px-3 py-3 text-right font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fin-border">
                  {metas.map((meta) => {
                    const progress = getProgress(meta);

                    return (
                      <tr key={meta.id}>
                        <td className="px-3 py-4 font-medium text-fin-text">{meta.nome}</td>
                        <td className="px-3 py-4 text-fin-success">{formatCurrency(meta.valorAtual)}</td>
                        <td className="px-3 py-4 text-fin-muted">{formatCurrency(meta.valorMeta)}</td>
                        <td className="px-3 py-4">
                          <div className="min-w-36">
                            <div className="mb-2 flex items-center justify-between text-xs text-fin-muted">
                              <span>{progress}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-zinc-800">
                              <div
                                className="h-2 rounded-full bg-fin-success"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              icon={<Pencil className="h-4 w-4" />}
                              onClick={() => setEditing(meta)}
                            >
                              Editar
                            </Button>
                            <Button
                              type="button"
                              variant={pendingDeleteId === meta.id ? "danger" : "ghost"}
                              size="sm"
                              icon={<Trash2 className="h-4 w-4" />}
                              isLoading={deleteMutation.isPending && pendingDeleteId === meta.id}
                              onClick={() => handleDelete(meta.id)}
                            >
                              {pendingDeleteId === meta.id ? "Confirmar" : "Excluir"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
