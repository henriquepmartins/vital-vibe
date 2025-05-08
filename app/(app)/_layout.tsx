import { Stack } from "expo-router";
import { AuthGuard } from "@/components/AuthGuard";

export default function AppLayout() {
  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      </Stack>
    </AuthGuard>
  );
}
