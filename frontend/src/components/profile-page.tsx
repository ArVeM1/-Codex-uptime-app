"use client";

import { AuthApiError } from "@/lib/auth-api";
import { getProfile, updateProfile, uploadAvatar } from "@/lib/profile-api";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "./auth-provider";

export function ProfilePage() {
  const router = useRouter();
  const { accessToken, isLoading: isAuthLoading, updateUser, user } = useAuth();
  const userId = user?.id;
  const [name, setName] = useState(user?.name ?? "");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url ?? null);
  const previewUrl = useRef<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!accessToken || !userId) { router.replace("/"); return; }
    void getProfile(accessToken).then((profile) => { updateUser(profile); setName(profile.name); setAvatarPreview(profile.avatar_url); }).catch((requestError: unknown) => setError(requestError instanceof AuthApiError ? requestError.message : "Не удалось загрузить профиль.")).finally(() => setIsLoading(false));
  }, [accessToken, isAuthLoading, router, updateUser, userId]);

  useEffect(() => () => { if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); }, []);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = file ? URL.createObjectURL(file) : null;
    setAvatarFile(file);
    setAvatarPreview(previewUrl.current ?? user?.avatar_url ?? null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    setError(null); setMessage(null); setIsSaving(true);
    try {
      let profile = await updateProfile(accessToken, name);
      if (avatarFile) profile = await uploadAvatar(accessToken, avatarFile);
      updateUser(profile); setName(profile.name); setAvatarFile(null); setAvatarPreview(profile.avatar_url); setMessage("Профиль сохранён.");
    } catch (requestError) { setError(requestError instanceof AuthApiError ? requestError.message : "Не удалось сохранить профиль."); }
    finally { setIsSaving(false); }
  }

  if (isAuthLoading || isLoading || !user) return <main className="flex min-h-screen items-center justify-center bg-slate-50"><p className="text-sm text-slate-500">Загружаем профиль…</p></main>;
  return <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-950"><div className="mx-auto max-w-2xl"><button className="text-sm font-medium text-indigo-600 hover:text-indigo-700" onClick={() => router.push("/")} type="button">← На главную</button><section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-950/5"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Аккаунт</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Профиль</h1><p className="mt-2 text-slate-600">Просмотр и редактирование данных профиля.</p><form className="mt-8 space-y-5" onSubmit={handleSubmit}><div className="flex items-center gap-4">{avatarPreview ? <Image alt="Аватар профиля" className="size-20 rounded-full object-cover" height={80} src={avatarPreview} width={80} /> : <div className="grid size-20 place-items-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-700">{name.slice(0, 1).toUpperCase()}</div>}<label className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Загрузить аватар<input accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleAvatarChange} type="file" /></label></div><label className="block text-sm font-medium text-slate-800">Имя<input autoComplete="name" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" maxLength={100} minLength={1} onChange={(event) => setName(event.target.value)} required value={name} /></label><label className="block text-sm font-medium text-slate-800">Email<input className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500" readOnly value={user.email} /></label>{error && <p aria-live="polite" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p aria-live="polite" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}<button className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSaving} type="submit">{isSaving ? "Сохраняем…" : "Сохранить изменения"}</button></form></section></div></main>;
}
