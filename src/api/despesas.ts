import { api } from "./axios";
import type { Despesa } from "../types/entities";

export async function getDespesas() {
  const response = await api.get<Despesa[]>("/api/Despesa");
  return response.data;
}

export async function getDespesa(id: number) {
  const response = await api.get<Despesa>(`/api/Despesa/${id}`);
  return response.data;
}

export async function createDespesa(payload: Omit<Despesa, "id">) {
  const response = await api.post<Despesa>("/api/Despesa", payload);
  return response.data;
}

export async function updateDespesa(id: number, payload: Omit<Despesa, "id">) {
  const response = await api.put<Despesa>(`/api/Despesa/${id}`, payload);
  return response.data;
}

export async function deleteDespesa(id: number) {
  await api.delete(`/api/Despesa/${id}`);
}
