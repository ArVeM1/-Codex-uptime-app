"use client";

import { useAuth } from "@/components/auth-provider";
import { AuthScreen } from "@/components/auth-screen";
import { Dashboard } from "@/components/dashboard";

function HomeContent() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12"><p className="text-center text-sm text-slate-500">Восстанавливаем сессию…</p></main>;
  }

  if (user) return <Dashboard />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <div className="w-full max-w-md">
        <p className="mb-5 text-center text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Uptime</p>
        <AuthScreen />
      </div>
    </main>
  );
}

export default function Home() {
  return <HomeContent />;
}
