"use client";

import { AuthApiError } from "@/lib/auth-api";
import { createMonitor, getMonitors, type IntervalUnit, type Monitor } from "@/lib/monitor-api";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "./auth-provider";

const units: { value: IntervalUnit; label: string }[] = [
  { value: "seconds", label: "секунд" }, { value: "minutes", label: "минут" }, { value: "hours", label: "часов" },
];

function initials(name: string): string { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
function intervalLabel(monitor: Monitor): string { return `каждые ${monitor.interval_value} ${units.find((unit) => unit.value === monitor.interval_unit)?.label ?? monitor.interval_unit}`; }

export function Dashboard() {
  const { accessToken, signOut, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [url, setUrl] = useState("");
  const [intervalValue, setIntervalValue] = useState("5");
  const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>("seconds");
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    void getMonitors(accessToken).then(setMonitors).catch(() => setError("Не удалось загрузить точки мониторинга.")).finally(() => setIsLoading(false));
  }, [accessToken]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!accessToken) return;
    setError(null); setIsCreating(true);
    try {
      const monitor = await createMonitor(accessToken, { url, interval_value: Number(intervalValue), interval_unit: intervalUnit });
      setMonitors((current) => [...current, monitor]); setUrl(""); setIntervalValue("5"); setIsFormOpen(false);
    } catch (requestError) { setError(requestError instanceof AuthApiError ? requestError.message : "Не удалось создать точку мониторинга."); }
    finally { setIsCreating(false); }
  }

  async function handleSignOut() {
    setError(null); setIsSigningOut(true);
    try { await signOut(); } catch (requestError) { setError(requestError instanceof AuthApiError ? requestError.message : "Не удалось завершить сессию."); }
    finally { setIsSigningOut(false); }
  }

  if (!user) return null;
  return <main className="min-h-screen bg-slate-50 text-slate-950">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Uptime</p><div className="relative flex items-center gap-2"><div className="relative"><button aria-expanded={isMenuOpen} aria-haspopup="menu" className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-100" onClick={() => setIsMenuOpen((open) => !open)} type="button">{user.avatar_url ? <Image alt="" className="size-9 rounded-full object-cover" height={36} src={user.avatar_url} width={36} /> : <span className="grid size-9 place-items-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">{initials(user.name)}</span>}<span className="hidden sm:block"><span className="block text-sm font-semibold">{user.name}</span><span className="block text-xs text-slate-500">{user.email}</span></span><span aria-hidden="true" className="text-slate-500">⌄</span></button>{isMenuOpen && <div className="absolute right-0 z-10 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg" role="menu"><div className="px-3 py-2.5"><p className="text-sm font-semibold">{user.name}</p><p className="truncate text-sm text-slate-500">{user.email}</p></div><Link className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" href="/profile" onClick={() => setIsMenuOpen(false)} role="menuitem">Профиль</Link></div>}</div><button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60" disabled={isSigningOut} onClick={() => void handleSignOut()} type="button">{isSigningOut ? "Выходим…" : "Выйти"}</button></div></div></header>
    <section className="mx-auto max-w-6xl px-5 py-12"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Мониторинг</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Ваши сайты</h1><p className="mt-2 text-slate-600">Создайте точку, чтобы сохранить сайт и частоту его будущих проверок.</p></div><button className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700" onClick={() => { setError(null); setIsFormOpen(true); }} type="button">Добавить сайт</button></div>
      {isFormOpen && <form className="mt-8 rounded-2xl border border-indigo-100 bg-white p-6 shadow-xl shadow-slate-950/5" onSubmit={handleCreate}><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold">Новая точка мониторинга</h2><p className="mt-1 text-sm text-slate-500">Проверка пока не запускается — мы только сохраним настройки.</p></div><button className="text-2xl leading-none text-slate-400 hover:text-slate-700" aria-label="Закрыть" onClick={() => setIsFormOpen(false)} type="button">×</button></div><div className="mt-6 grid gap-5 sm:grid-cols-[minmax(0,1fr)_10rem_10rem] sm:items-end"><label className="block text-sm font-medium">URL сайта<input autoFocus className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" required type="url" value={url} /></label><label className="block text-sm font-medium">Каждые<input className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" min="1" onChange={(event) => setIntervalValue(event.target.value)} required type="number" value={intervalValue} /></label><label className="block text-sm font-medium">Единица<select className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" onChange={(event) => setIntervalUnit(event.target.value as IntervalUnit)} value={intervalUnit}>{units.map((unit) => <option key={unit.value} value={unit.value}>{unit.label}</option>)}</select></label></div><div className="mt-6 flex justify-end"><button className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60" disabled={isCreating} type="submit">{isCreating ? "Создаём…" : "Создать"}</button></div></form>}
      {error && <p aria-live="polite" className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {isLoading ? <p className="mt-12 text-sm text-slate-500">Загружаем точки…</p> : monitors.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="font-medium">Пока нет сайтов для мониторинга</p><p className="mt-1 text-sm text-slate-500">Добавьте первый сайт, чтобы он появился здесь.</p></div> : <div className="mt-8 grid gap-4 sm:grid-cols-2">{monitors.map((monitor) => <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={monitor.id}><div className="flex items-start justify-between gap-4"><div className="min-w-0"><h2 className="truncate font-semibold">{monitor.url}</h2><p className="mt-2 text-sm text-slate-500">{intervalLabel(monitor)}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Готов к проверке</span></div></article>)}</div>}
    </section>
  </main>;
}
