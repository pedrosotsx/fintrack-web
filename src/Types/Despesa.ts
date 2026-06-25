export interface Despesa {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  categoriaId: number;

  categoria: {
    id: number;
    nome: string;
  };
}