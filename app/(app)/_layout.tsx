import { Stack } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function AppLayout() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.replace("/");
      }
    });
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="paciente/dashboard" />
      <Stack.Screen name="medico/dashboard" />
    </Stack>
  );
}
