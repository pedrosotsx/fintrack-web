import { api } from "./axios";
import type { Meta } from "../types/entities";

export async function getMetas() {
  const response = await api.get<Meta[]>("/api/Metas");
  return response.data;
}

export async function getMeta(id: number) {
  const response = await api.get<Meta>(`/api/Metas/${id}`);
  return response.data;
}

export async function createMeta(payload: Omit<Meta, "id">) {
  const response = await api.post<Meta>("/api/Metas", payload);
  return response.data;
}

export async function updateMeta(id: number, payload: Omit<Meta, "id">) {
  const response = await api.put<Meta>(`/api/Metas/${id}`, payload);
  return response.data;
}

export async function deleteMeta(id: number) {
  await api.delete(`/api/Metas/${id}`);
}
