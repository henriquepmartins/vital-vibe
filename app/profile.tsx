import { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      setError("");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        setError("Usuário não autenticado.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, name, email, cpf, phone, birthdate, avatar_url, height, weight"
        )
        .eq("id", userId)
        .single();
      if (error) {
        setError(error.message);
      } else {
        setUserData(data);
      }
      setLoading(false);
    }
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#ADC178" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ color: "#ff4444" }}>{error}</Text>
      </SafeAreaView>
    );
  }

  function capitalizeName(name?: string) {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  function formatCPF(cpf?: string) {
    if (!cpf) return "-";
    const cleaned = cpf.replace(/\D/g, "");
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  function formatDateBR(dateString?: string) {
    if (!dateString) return "-";
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return dateString;
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/dashboard")}
        >
          <Ionicons name="arrow-back" size={28} color="#ADC178" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {userData?.avatar_url ? (
              <Image
                source={{ uri: userData.avatar_url }}
                style={styles.profileImage}
              />
            ) : (
              <Ionicons name="person-circle" size={100} color="#ADC178" />
            )}
          </View>
          <Text style={styles.profileName}>
            {capitalizeName(userData?.name)}
          </Text>
          <Text style={styles.profileEmail}>{userData?.email}</Text>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          <Text style={styles.infoLabel}>
            CPF:{" "}
            <Text style={styles.infoValue}>{formatCPF(userData?.cpf)}</Text>
          </Text>
          <Text style={styles.infoLabel}>
            Telefone:{" "}
            <Text style={styles.infoValue}>{userData?.phone || "-"}</Text>
          </Text>
          <Text style={styles.infoLabel}>
            Data de Nascimento:{" "}
            <Text style={styles.infoValue}>
              {formatDateBR(userData?.birthdate)}
            </Text>
          </Text>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Dados Antropométricos</Text>
          <Text style={styles.infoLabel}>
            Altura (cm):{" "}
            <Text style={styles.infoValue}>{userData?.height || "-"}</Text>
          </Text>
          <Text style={styles.infoLabel}>
            Peso (kg):{" "}
            <Text style={styles.infoValue}>{userData?.weight || "-"}</Text>
          </Text>
        </View>
        <View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              const { error } = await supabase.auth.signOut();
              if (!error) {
                router.replace("/");
              }
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#FF4444" />
            <Text style={styles.logoutText}>Finalizar Sessão</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContainer: {
    padding: 20,
    alignItems: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 10,
  },
  sectionContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    width: "100%",
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 15,
    color: "#666666",
    marginBottom: 6,
  },
  infoValue: {
    color: "#333333",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 10,
  },
  backButton: {
    padding: 6,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF4444",
    marginTop: 30,
  },
  logoutText: {
    color: "#FF4444",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
