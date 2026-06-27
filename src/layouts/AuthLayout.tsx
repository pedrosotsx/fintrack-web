import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-fin-background px-3 py-6 text-fin-text sm:px-4 sm:py-10">
      <section className="w-full max-w-md rounded-lg border border-fin-border bg-fin-panel p-5 sm:p-6">
        <div className="mb-8">
          <p className="text-sm font-semibold text-fin-red">FinTrack</p>
          <h1 className="mt-2 text-xl font-bold tracking-normal sm:text-2xl">{title}</h1>
          <p className="mt-2 text-sm text-fin-muted">{subtitle}</p>
        </div>
        {children}
        <div className="mt-6 border-t border-fin-border pt-5 text-center text-sm text-fin-muted">
          {footer}
        </div>
      </section>
    </main>
  );
}
