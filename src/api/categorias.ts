import { api } from "./axios";
import type { Categoria } from "../types/entities";

export async function getCategorias() {
  const response = await api.get<Categoria[]>("/api/Categorias");
  return response.data;
}

export async function getCategoria(id: number) {
  const response = await api.get<Categoria>(`/api/Categorias/${id}`);
  return response.data;
}

export async function createCategoria(payload: Omit<Categoria, "id">) {
  const response = await api.post<Categoria>("/api/Categorias", payload);
  return response.data;
}

export async function updateCategoria(id: number, payload: Omit<Categoria, "id">) {
  const response = await api.put<Categoria>(`/api/Categorias/${id}`, payload);
  return response.data;
}

export async function deleteCategoria(id: number) {
  await api.delete(`/api/Categorias/${id}`);
}
