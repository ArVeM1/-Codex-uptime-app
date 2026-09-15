"use client";

import { AuthProvider } from "@/components/auth-provider";

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthProvider>{children}</AuthProvider>;
}
