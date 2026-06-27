import { api } from "./axios";
import type { DashboardData } from "../types/entities";

export async function getDashboard() {
  const response = await api.get<DashboardData>("/api/Dashboard");
  return response.data;
}
