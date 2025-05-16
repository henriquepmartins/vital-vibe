import { Stack } from "expo-router";
import { ChatProvider } from "../contexts/ChatContext";
import { AppointmentProvider } from "../contexts/AppointmentContext";
import { HydrationProvider } from "../contexts/HydrationContext";

export default function AppLayout() {
  return (
    <ChatProvider>
      <AppointmentProvider>
        <HydrationProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="consulta" options={{ headerShown: false }} />
            <Stack.Screen
              name="ConsultaAgendada"
              options={{ headerShown: false }}
            />
          </Stack>
        </HydrationProvider>
      </AppointmentProvider>
    </ChatProvider>
  );
}
