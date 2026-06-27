import { useQuery } from "@tanstack/react-query";
import { BanknoteArrowDown, BanknoteArrowUp, PiggyBank, Target, TrendingDown, TrendingUp } from "lucide-react";

import { getDashboard } from "../../api/dashboard";
import { ErrorState } from "../../components/ErrorState";
import { MetricCard } from "../../components/MetricCard";
import { PageHeader } from "../../components/PageHeader";
import { Skeleton } from "../../components/Skeleton";
import { getErrorMessage } from "../../utils/errors";
import { formatCurrency } from "../../utils/formatters";
import { queryKeys } from "../../utils/queryKeys";

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-32" />
      ))}
    </div>
  );
}

export function DashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboard,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Resumo atualizado da sua vida financeira." />

      {dashboardQuery.isLoading ? <DashboardSkeleton /> : null}

      {dashboardQuery.isError ? (
        <ErrorState
          message={getErrorMessage(dashboardQuery.error, "Não foi possível carregar o dashboard.")}
          onRetry={() => void dashboardQuery.refetch()}
        />
      ) : null}

      {dashboardQuery.data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            title="Total de receitas"
            value={formatCurrency(dashboardQuery.data.totalReceitas)}
            tone="success"
            icon={<BanknoteArrowUp className="h-5 w-5" />}
          />
          <MetricCard
            title="Total de despesas"
            value={formatCurrency(dashboardQuery.data.totalDespesas)}
            tone="danger"
            icon={<BanknoteArrowDown className="h-5 w-5" />}
          />
          <MetricCard
            title="Saldo atual"
            value={formatCurrency(dashboardQuery.data.saldo)}
            icon={<PiggyBank className="h-5 w-5" />}
          />
          <MetricCard
            title="Quantidade de receitas"
            value={dashboardQuery.data.quantidadeReceitas}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <MetricCard
            title="Quantidade de despesas"
            value={dashboardQuery.data.quantidadeDespesas}
            icon={<TrendingDown className="h-5 w-5" />}
          />
          <MetricCard
            title="Quantidade de metas"
            value={dashboardQuery.data.quantidadeMetas}
            icon={<Target className="h-5 w-5" />}
          />
        </div>
      ) : null}
    </div>
  );
}
