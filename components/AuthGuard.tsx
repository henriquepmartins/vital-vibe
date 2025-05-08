import { useEffect } from "react";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import React from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/");
      }
    });
  }, []);

  return <>{children}</>;
}
