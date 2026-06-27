import { api } from "./axios";
import type { Receita } from "../types/entities";

export async function getReceitas() {
  const response = await api.get<Receita[]>("/api/Receitas");
  return response.data;
}

export async function getReceita(id: number) {
  const response = await api.get<Receita>(`/api/Receitas/${id}`);
  return response.data;
}

export async function createReceita(payload: Omit<Receita, "id">) {
  const response = await api.post<Receita>("/api/Receitas", payload);
  return response.data;
}

export async function updateReceita(id: number, payload: Omit<Receita, "id">) {
  const response = await api.put<Receita>(`/api/Receitas/${id}`, payload);
  return response.data;
}

export async function deleteReceita(id: number) {
  await api.delete(`/api/Receitas/${id}`);
}
