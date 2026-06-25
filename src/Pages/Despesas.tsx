import { useEffect, useState } from "react";
import { api } from "../Services/api";
import type { Despesa } from "../Types/Despesa";


export function Despesas() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);

  useEffect(() => {
    async function carregar() {
      try {
        const response = await api.get<Despesa[]>("/despesa");
        setDespesas(response.data);
      } catch (error) {
        console.error("Erro ao buscar despesas:", error);
      }
    }

    carregar();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Despesas</h1>

      {despesas.length === 0 ? (
        <p>Nenhuma despesa encontrada</p>
      ) : (
        <table border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Data</th>
              <th>Categoria</th>
            </tr>
          </thead>

          <tbody>
            {despesas.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.descricao}</td>
                <td>R$ {d.valor}</td>
                <td>{new Date(d.data).toLocaleDateString()}</td>
                <td>{d.categoria?.nome ?? "Sem categoria"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}