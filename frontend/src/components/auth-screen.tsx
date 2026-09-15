"use client";

import { AuthApiError } from "@/lib/auth-api";
import { FormEvent, useState } from "react";
import { useAuth } from "./auth-provider";

type Mode = "login" | "register";

function errorMessage(error: unknown): string {
  return error instanceof AuthApiError ? error.message : "Не удалось связаться с сервером. Попробуйте ещё раз.";
}

export function AuthScreen() {
  const { isLoading, signIn, signOut, signUp, user } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === "register") {
        await signUp({ email, password, name: String(form.get("name") ?? "") });
      } else {
        await signIn({ email, password });
      }
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <p className="text-center text-sm text-slate-500">Восстанавливаем сессию…</p>;

  if (user) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-xl shadow-emerald-950/5">
        <p className="text-sm font-semibold text-emerald-700">Вы авторизованы</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Здравствуйте, {user.name}</h1>
        <p className="mt-2 text-slate-600">{user.email}</p>
        <p className="mt-6 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">Access-токен находится только в памяти страницы. Refresh-токен хранится в защищённой HttpOnly cookie.</p>
        <button className="mt-6 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-60" disabled={isSubmitting} onClick={() => { setIsSubmitting(true); void signOut().catch((requestError) => setError(errorMessage(requestError))).finally(() => setIsSubmitting(false)); }} type="button">Выйти из аккаунта</button>
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      </section>
    );
  }

  const isRegister = mode === "register";
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-950/5">
      <div className="mb-8 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Авторизация">
        {(["login", "register"] as const).map((item) => <button aria-selected={mode === item} className={`rounded-md px-3 py-2 text-sm font-semibold transition ${mode === item ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"}`} key={item} onClick={() => { setMode(item); setError(null); }} role="tab" type="button">{item === "login" ? "Вход" : "Регистрация"}</button>)}
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{isRegister ? "Создайте аккаунт" : "С возвращением"}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">{isRegister ? "Начните следить за доступностью сервисов." : "Войдите, чтобы продолжить работу."}</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {isRegister && <label className="block text-sm font-medium text-slate-800">Имя<input autoComplete="name" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" maxLength={100} minLength={1} name="name" required /></label>}
        <label className="block text-sm font-medium text-slate-800">Email<input autoComplete="email" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" name="email" required type="email" /></label>
        <label className="block text-sm font-medium text-slate-800">Пароль<input autoComplete={isRegister ? "new-password" : "current-password"} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" minLength={8} name="password" required type="password" />{isRegister && <span className="mt-1 block text-xs font-normal text-slate-500">Минимум 8 символов.</span>}</label>
        {error && <p aria-live="polite" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? "Отправляем…" : isRegister ? "Создать аккаунт" : "Войти"}</button>
      </form>
    </section>
  );
}
