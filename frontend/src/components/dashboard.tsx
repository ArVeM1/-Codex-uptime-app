"use client";

import { AuthApiError } from "@/lib/auth-api";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./auth-provider";

function errorMessage(error: unknown): string {
  return error instanceof AuthApiError ? error.message : "Не удалось завершить сессию. Попробуйте ещё раз.";
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function Dashboard() {
  const { signOut, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function handleSignOut() {
    setError(null);
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Uptime</p>
          <div className="relative flex items-center gap-2">
            <div className="relative">
              <button aria-expanded={isMenuOpen} aria-haspopup="menu" className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-100" onClick={() => setIsMenuOpen((open) => !open)} type="button">
                {user.avatar_url ? <Image alt="" className="size-9 rounded-full object-cover" height={36} src={user.avatar_url} width={36} /> : <span className="grid size-9 place-items-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">{initials(user.name)}</span>}
                <span className="hidden sm:block"><span className="block text-sm font-semibold">{user.name}</span><span className="block text-xs text-slate-500">{user.email}</span></span>
                <span aria-hidden="true" className="text-slate-500">⌄</span>
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 z-10 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-950/10" role="menu">
                  <div className="px-3 py-2.5"><p className="text-sm font-semibold text-slate-900">{user.name}</p><p className="truncate text-sm text-slate-500">{user.email}</p></div>
                  <Link className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" href="/profile" onClick={() => setIsMenuOpen(false)} role="menuitem">Профиль</Link>
                </div>
              )}
            </div>
            <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSigningOut} onClick={() => void handleSignOut()} type="button">{isSigningOut ? "Выходим…" : "Выйти"}</button>
            {error && <p aria-live="polite" className="absolute right-5 top-16 text-sm text-red-700">{error}</p>}
          </div>
        </div>
      </header>
    </main>
  );
}
