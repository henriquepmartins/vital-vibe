import { Stack } from "expo-router";
import { ChatBot } from "../components/chat/ChatBot";

export default function AppLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="consulta" options={{ headerShown: false }} />
        <Stack.Screen
          name="ConsultaAgendada"
          options={{ headerShown: false }}
        />
      </Stack>
      <ChatBot />
    </>
  );
}
