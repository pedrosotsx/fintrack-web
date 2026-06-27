export interface Categoria {
  id: number;
  nome: string;
}

export interface Receita {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  categoriaId: number;
}

export interface Despesa {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  categoriaId: number;
}

export interface Meta {
  id: number;
  nome: string;
  valorMeta: number;
  valorAtual: number;
}

export interface DashboardData {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  quantidadeReceitas: number;
  quantidadeDespesas: number;
  quantidadeMetas: number;
}
