import { api } from "./axios";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types/auth";

export async function loginRequest(payload: LoginRequest) {
  const response = await api.post<AuthResponse>("/api/Auth/login", payload);
  return response.data;
}

export async function registerRequest(payload: RegisterRequest) {
  const response = await api.post<AuthResponse>("/api/Auth/register", payload);
  return response.data;
}
