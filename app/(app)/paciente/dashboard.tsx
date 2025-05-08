import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React from "react";

export default function PacienteDashboardScreen() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <AuthGuard>
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <Text style={styles.title}>Dashboard do Paciente</Text>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E8B57",
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: "#ff4444",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  signOutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
