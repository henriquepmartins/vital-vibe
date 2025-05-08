import { Stack } from "expo-router";

export default function MainLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(auth)/sign-in/login"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(auth)/sign-up/register"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
