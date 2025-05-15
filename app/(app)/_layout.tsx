import { Stack } from "expo-router";
import { ChatBot } from "../components/chat/ChatBot";
import { ChatProvider } from "../contexts/ChatContext";
import { AppointmentProvider } from "../contexts/AppointmentContext";

export default function AppLayout() {
  return (
    <ChatProvider>
      <AppointmentProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="consulta" options={{ headerShown: false }} />
          <Stack.Screen
            name="ConsultaAgendada"
            options={{ headerShown: false }}
          />
        </Stack>
        <ChatBot />
      </AppointmentProvider>
    </ChatProvider>
  );
}
