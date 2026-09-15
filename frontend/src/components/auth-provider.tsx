"use client";

import { type AuthResponse, type AuthUser, type LoginInput, type RegistrationInput, login, logout, refresh, register } from "@/lib/auth-api";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type AuthContextValue = {
  accessToken: string | null;
  isLoading: boolean;
  user: AuthUser | null;
  signIn: (input: LoginInput) => Promise<void>;
  signUp: (input: RegistrationInput) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function applyResponse(response: AuthResponse, setAccessToken: (value: string) => void, setUser: (value: AuthUser) => void) {
  setAccessToken(response.access_token);
  setUser(response.user);
}

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const restored = useRef(false);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    void refresh()
      .then((response) => applyResponse(response, setAccessToken, setUser))
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(async (input: LoginInput) => applyResponse(await login(input), setAccessToken, setUser), []);
  const signUp = useCallback(async (input: RegistrationInput) => applyResponse(await register(input), setAccessToken, setUser), []);
  const signOut = useCallback(async () => {
    await logout();
    setAccessToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((nextUser: AuthUser) => setUser(nextUser), []);

  return <AuthContext.Provider value={{ accessToken, isLoading, user, signIn, signOut, signUp, updateUser }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
