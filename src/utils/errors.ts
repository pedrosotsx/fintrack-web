import axios from "axios";

interface ApiErrorResponse {
  message?: string;
  title?: string;
  errors?: Record<string, string[] | string>;
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse | string>(error)) {
    const data = error.response?.data;

    if (typeof data === "string" && data.trim().length > 0) {
      return data;
    }

    if (data && typeof data !== "string") {
      if (data.message) {
        return data.message;
      }

      if (data.title) {
        return data.title;
      }

      const firstError = data.errors ? Object.values(data.errors)[0] : undefined;

      if (Array.isArray(firstError)) {
        return firstError[0] ?? fallback;
      }

      if (typeof firstError === "string") {
        return firstError;
      }
    }
  }

  return fallback;
}
