import { Toaster } from "sonner";

import { AppRoutes } from "./routes/AppRoutes";

export function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        richColors
        theme="dark"
        toastOptions={{
          classNames: {
            toast: "border border-fin-border bg-fin-panel text-fin-text",
            success: "border-fin-success",
            error: "border-fin-red",
          },
        }}
      />
    </>
  );
}
