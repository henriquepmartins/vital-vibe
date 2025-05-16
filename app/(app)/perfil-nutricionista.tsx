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
  Dimensions,
  Alert,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

interface NutriData {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  crn: string;
  avatar_url?: string;
}

export default function PerfilNutricionistaScreen() {
  const [nutri, setNutri] = useState<NutriData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchNutri() {
      setLoading(true);
      setError("");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userEmail = session?.user?.email;
      if (!userEmail) {
        setError("Usuário não autenticado.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("nutricionistas")
        .select("id, nome, email, telefone, crn")
        .eq("email", userEmail)
        .single();
      if (error) {
        setError(error.message);
      } else {
        setNutri(data as NutriData);
      }
      setLoading(false);
    }
    fetchNutri();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

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
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/dashboard-nutricionista")}
        >
          <Ionicons name="arrow-back" size={28} color="#ADC178" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Perfil</Text>
          <View style={styles.headerUnderline} />
        </View>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileHeaderSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={50} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.profileName}>{nutri?.nome}</Text>
            <Text style={styles.profileEmail}>{nutri?.email}</Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons
              name="call-outline"
              size={20}
              color="#ADC178"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.infoLabel}>Telefone:</Text>
            <Text style={styles.infoValue}>{nutri?.telefone || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="id-card-outline"
              size={20}
              color="#ADC178"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.infoLabel}>CRN:</Text>
            <Text style={styles.infoValue}>{nutri?.crn}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons
            name="log-out-outline"
            size={22}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.logoutButtonText}>Finalizar Sessão</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EAD2",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0EAD2",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
    textAlign: "center",
    margin: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6C584C",
  },
  headerUnderline: {
    height: 3,
    width: 32,
    backgroundColor: "#ADC178",
    borderRadius: 2,
    marginTop: 2,
  },
  scrollContainer: {
    alignItems: "center",
    padding: 24,
    paddingBottom: 40,
  },
  profileHeaderSection: {
    alignItems: "center",
    marginBottom: 18,
  },
  profileImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ADC178",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    overflow: "hidden",
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#A98467",
    alignItems: "center",
    justifyContent: "center",
  },
  nameContainer: {
    alignItems: "center",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6C584C",
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 15,
    color: "#A98467",
    marginBottom: 2,
  },
  infoContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontWeight: "600",
    color: "#6C584C",
    marginRight: 4,
    fontSize: 15,
  },
  infoValue: {
    color: "#6C584C",
    fontSize: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A98467",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: "center",
    marginTop: 12,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
