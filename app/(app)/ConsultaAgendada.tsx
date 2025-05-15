import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS } from "../constants/Colors";
import { useChat } from "../contexts/ChatContext";
import { supabase } from "@/lib/supabase";

const ConsultaAgendada = () => {
  const { updateAppointmentInfo } = useChat();

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (userId) {
        const { data: userData, error } = await supabase
          .from("users")
          .select("name, phone")
          .eq("id", userId)
          .single();

        if (userData && !error) {
          updateAppointmentInfo({
            patientName: userData.name,
            phoneNumber: userData.phone,
          });
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={80} color={COLORS.sage} />
      </View>
      <Text style={styles.title}>Consulta Agendada!</Text>
      <Text style={styles.subtitle}>
        Sua consulta foi agendada com sucesso. Você receberá um lembrete antes
        do horário marcado.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/dashboard")}
      >
        <Text style={styles.buttonText}>Voltar para a tela inicial</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.cream,
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.sage,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.taupe,
    marginBottom: 32,
    marginHorizontal: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: COLORS.sage,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
    shadowColor: COLORS.taupe,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ConsultaAgendada;
