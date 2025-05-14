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
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface UserData {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  birthdate: string;
  avatar_url: string;
  height: number;
  weight: number;
}

interface BMIStatus {
  status: string;
  color: string;
}

export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
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
        setUserData(data as UserData);
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
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  function capitalizeName(name: string | undefined): string {
    if (!name) return "";
    return name
      .split(" ")
      .map(
        (word: string) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(" ");
  }

  function formatCPF(cpf: string | undefined): string {
    if (!cpf) return "-";
    const cleaned = cpf.replace(/\D/g, "");
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  function formatDateBR(dateString: string | undefined): string {
    if (!dateString) return "-";
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return dateString;
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }

  function calculateBMI(): string | null {
    if (userData?.height && userData?.weight) {
      const heightInMeters = userData.height / 100;
      const bmi = (userData.weight / (heightInMeters * heightInMeters)).toFixed(
        1
      );
      return bmi;
    }
    return null;
  }

  function getBMIStatus(bmi: string | null): BMIStatus | null {
    if (!bmi) return null;
    const numBMI = parseFloat(bmi);
    if (numBMI < 18.5) return { status: "Abaixo do peso", color: "#FFB347" };
    if (numBMI < 25) return { status: "Peso normal", color: "#77DD77" };
    if (numBMI < 30) return { status: "Sobrepeso", color: "#FFB347" };
    return { status: "Obesidade", color: "#FF6961" };
  }

  const bmi = calculateBMI();
  const bmiStatus = getBMIStatus(bmi);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/dashboard" as any)}
        >
          <Ionicons name="arrow-back" size={28} color="#ADC178" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/edit-profile" as any)}
        >
          <Ionicons name="pencil" size={24} color="#ADC178" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileHeaderSection}>
          <View style={styles.profileImageContainer}>
            {userData?.avatar_url ? (
              <Image
                source={{ uri: userData.avatar_url }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color="#FFFFFF" />
              </View>
            )}
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.profileName}>
              {capitalizeName(userData?.name)}
            </Text>
            <Text style={styles.profileEmail}>{userData?.email}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData?.height || "-"}</Text>
            <Text style={styles.statLabel}>Altura (cm)</Text>
          </View>
          <View style={[styles.statItem, styles.statDivider]}>
            <Text style={styles.statValue}>{userData?.weight || "-"}</Text>
            <Text style={styles.statLabel}>Peso (kg)</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{bmi || "-"}</Text>
            <Text style={styles.statLabel}>IMC</Text>
          </View>
        </View>

        {bmi && bmiStatus && (
          <View style={styles.bmiContainer}>
            <Text style={styles.bmiLabel}>Status IMC:</Text>
            <View
              style={[
                styles.bmiStatusBadge,
                { backgroundColor: bmiStatus.color },
              ]}
            >
              <Text style={styles.bmiStatusText}>{bmiStatus.status}</Text>
            </View>
          </View>
        )}

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="person-outline" size={20} color="#ADC178" />
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CPF</Text>
            <Text style={styles.infoValue}>{formatCPF(userData?.cpf)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Telefone</Text>
            <Text style={styles.infoValue}>{userData?.phone || "-"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data de Nascimento</Text>
            <Text style={styles.infoValue}>
              {formatDateBR(userData?.birthdate)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push("/settings" as any)}
        >
          <Ionicons name="settings-outline" size={22} color="#666666" />
          <Text style={styles.settingsText}>Configurações</Text>
          <Ionicons name="chevron-forward" size={22} color="#666666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            const { error } = await supabase.auth.signOut();
            if (!error) {
              router.replace("/");
            }
          }}
        >
          <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
          <Text style={styles.logoutText}>Finalizar Sessão</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContainer: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  errorText: {
    color: "#FF4444",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    flex: 1,
    textAlign: "center",
    marginLeft: -28,
  },
  editButton: {
    padding: 6,
  },
  profileHeaderSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#ADC178",
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ADC178",
    justifyContent: "center",
    alignItems: "center",
  },
  nameContainer: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#666666",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
  },
  statDivider: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#EEEEEE",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
  },
  bmiContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  bmiLabel: {
    fontSize: 14,
    color: "#666666",
    marginRight: 10,
  },
  bmiStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bmiStatusText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  sectionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: "100%",
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666666",
  },
  infoValue: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  settingsText: {
    fontSize: 16,
    color: "#333333",
    flex: 1,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E66356",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
