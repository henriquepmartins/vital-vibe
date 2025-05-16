import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 44;

// Definir tipos para consultas e pacientes
interface Consulta {
  id: string;
  start_time: string;
  appointment_type: string;
  status: string;
  users?: { name: string; email: string };
}
interface Paciente {
  user_id: string;
  users: { name: string; email: string };
}

const DashboardNutricionista = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [nutriId, setNutriId] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Bom dia");
  const [currentDate, setCurrentDate] = useState("");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Bom dia");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Boa tarde");
    } else {
      setGreeting("Boa noite");
    }
    const options = {
      weekday: "long" as const,
      day: "numeric" as const,
      month: "long" as const,
    };
    const formattedDate = new Date().toLocaleDateString("pt-BR", options);
    setCurrentDate(
      formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
    );
  }, []);

  useEffect(() => {
    async function fetchNutriId() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userEmail = session?.user?.email;
      if (!userEmail) return;
      const { data } = await supabase
        .from("nutricionistas")
        .select("id, nome")
        .eq("email", userEmail)
        .single();
      if (data?.id) setNutriId(data.id);
      if (data?.nome) setUserName(data.nome.split(" ")[0]);
    }
    fetchNutriId();
  }, []);

  useEffect(() => {
    if (!nutriId) return;
    // Buscar consultas do dia e pacientes do nutricionista
    async function fetchData() {
      setLoading(true);
      // Consultas do dia
      const today = new Date().toISOString().split("T")[0];
      const { data: consultasData } = await supabase
        .from("appointments")
        .select(
          "id, start_time, appointment_type, status, users:users(name, email)"
        )
        .eq("nutricionista_id", nutriId)
        .eq("date", today)
        .order("start_time", { ascending: true });
      setConsultas(
        (consultasData as any[])
          ? (consultasData as any[]).map((item) => ({
              ...item,
              users: Array.isArray(item.users) ? item.users[0] : item.users,
            }))
          : []
      );
      // Pacientes atendidos (únicos)
      const { data: pacientesData } = await supabase
        .from("appointments")
        .select("user_id, users:users(name, email)")
        .eq("nutricionista_id", nutriId);
      // Remover duplicados por user_id
      const uniquePacientes: Paciente[] = [];
      const seen = new Set();
      (pacientesData as any[]).forEach((item) => {
        const userObj = Array.isArray(item.users) ? item.users[0] : item.users;
        if (userObj && !seen.has(item.user_id)) {
          seen.add(item.user_id);
          uniquePacientes.push({ user_id: item.user_id, users: userObj });
        }
      });
      setPacientes(uniquePacientes);
      setLoading(false);
    }
    fetchData();
  }, [nutriId]);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={styles.container}>
        <View style={styles.phoneContainer}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContainer,
              { minHeight: height },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* HEADER */}
            <View style={styles.headerContainer}>
              <LinearGradient
                colors={["#ADC178", "#ADC178"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerGradient}
              >
                <View style={styles.headerTop}>
                  <View style={styles.logoContainer}>
                    <Ionicons name="leaf" size={24} color="white" />
                    <Text style={styles.logoText}>VitalVibe</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.headerSubtitle}>Nutricionista</Text>
                    <TouchableOpacity
                      style={{
                        marginLeft: 16,
                        backgroundColor: "rgba(255,255,255,0.18)",
                        borderRadius: 20,
                        padding: 6,
                      }}
                      onPress={() => router.push("/perfil-nutricionista")}
                    >
                      <Ionicons
                        name="person-circle-outline"
                        size={28}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.headerBottom}>
                  <View style={styles.greetingContainer}>
                    <Text style={styles.greeting}>{greeting},</Text>
                    <Text style={styles.userName}>{userName}!</Text>
                    <Text style={styles.currentDate}>{currentDate}</Text>
                  </View>
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <View style={styles.statIconContainer}>
                        <Ionicons
                          name="calendar-outline"
                          size={18}
                          color="white"
                        />
                      </View>
                      <View>
                        <Text style={styles.statValue}>{consultas.length}</Text>
                        <Text style={styles.statLabel}>Consultas</Text>
                      </View>
                    </View>
                    <View style={styles.statItem}>
                      <View style={styles.statIconContainer}>
                        <Ionicons
                          name="people-outline"
                          size={18}
                          color="white"
                        />
                      </View>
                      <View>
                        <Text style={styles.statValue}>{pacientes.length}</Text>
                        <Text style={styles.statLabel}>Pacientes</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.headerCurve} />
              </LinearGradient>
            </View>
            {/* CONSULTAS DO DIA */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Consultas do Dia</Text>
              </View>
              {loading ? (
                <ActivityIndicator color="#ADC178" />
              ) : consultas.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Nenhuma consulta agendada para hoje.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={consultas}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.appointmentCard}>
                      <View style={styles.appointmentInfo}>
                        <Text style={styles.appointmentName}>
                          {item.users?.name || "Paciente"}
                        </Text>
                        <Text style={styles.appointmentDescription}>
                          {item.start_time?.substring(0, 5)} -{" "}
                          {item.appointment_type}
                        </Text>
                      </View>
                      <View style={styles.appointmentActions}>
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>{item.status}</Text>
                        </View>
                        {/* Botões de reagendar/cancelar aqui */}
                      </View>
                    </View>
                  )}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginVertical: 10 }}
                />
              )}
            </View>
            {/* PACIENTES ATENDIDOS */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pacientes Atendidos</Text>
              </View>
              {loading ? (
                <ActivityIndicator color="#ADC178" />
              ) : pacientes.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Nenhum paciente encontrado.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={pacientes}
                  keyExtractor={(item) => item.user_id}
                  renderItem={({ item }) => (
                    <View style={styles.appointmentCard}>
                      <View style={styles.appointmentInfo}>
                        <Text style={styles.appointmentName}>
                          {item.users?.name}
                        </Text>
                        <Text style={styles.appointmentDescription}>
                          {item.users?.email}
                        </Text>
                      </View>
                      <View style={styles.appointmentActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() =>
                            router.push(`/chat?paciente=${item.users?.email}`)
                          }
                        >
                          <Ionicons
                            name="chatbubbles-outline"
                            size={20}
                            color="#ADC178"
                          />
                          <Text style={styles.actionButtonText}>Chat</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() =>
                            router.push(
                              `/plano-alimentar?paciente=${item.users?.email}`
                            )
                          }
                        >
                          <Ionicons
                            name="restaurant-outline"
                            size={20}
                            color="#ADC178"
                          />
                          <Text style={styles.actionButtonText}>Plano</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginVertical: 10 }}
                />
              )}
            </View>
            <View style={styles.footer} />
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  phoneContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerContainer: {
    width: "100%",
    overflow: "hidden",
  },
  headerGradient: {
    paddingTop: STATUSBAR_HEIGHT + 10,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: "relative",
    minHeight: STATUSBAR_HEIGHT + 120,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: width > 500 ? 25 : 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    top: 6,
  },
  logoText: {
    fontSize: width > 500 ? 26 : 22,
    fontWeight: "bold",
    color: "white",
    marginLeft: 4,
  },
  headerSubtitle: {
    fontSize: width > 500 ? 16 : 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 32,
    marginTop: 4,
  },
  headerBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: width > 500 ? 30 : 22,
  },
  greetingContainer: {
    flex: 1,
    alignItems: "flex-start",
    bottom: 10,
  },
  greeting: {
    fontSize: width > 500 ? 18 : 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  userName: {
    fontSize: width > 500 ? 28 : 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  currentDate: {
    fontSize: width > 500 ? 16 : 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statsContainer: {
    flexDirection: "column",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    paddingVertical: width > 500 ? 12 : 8,
    paddingHorizontal: width > 500 ? 12 : 8,
    alignItems: "center",
    gap: width > 500 ? 12 : 10,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIconContainer: {
    width: width > 500 ? 36 : 32,
    height: width > 500 ? 36 : 32,
    borderRadius: width > 500 ? 18 : 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: width > 500 ? 10 : 8,
  },
  statValue: {
    fontSize: width > 500 ? 18 : 16,
    fontWeight: "bold",
    color: "white",
  },
  statLabel: {
    fontSize: width > 500 ? 14 : 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  headerCurve: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: width > 500 ? 35 : 30,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  sectionContainer: {
    marginBottom: width > 500 ? 30 : 25,
    paddingHorizontal: width > 500 ? 25 : 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: width > 500 ? 20 : 15,
  },
  sectionTitle: {
    fontSize: width > 500 ? 22 : 20,
    fontWeight: "bold",
    color: "#333333",
  },
  emptyContainer: {
    padding: width > 500 ? 30 : 25,
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    marginHorizontal: width > 500 ? 5 : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: width > 500 ? 17 : 15,
    color: "#666666",
    marginBottom: 20,
    textAlign: "center",
  },
  appointmentCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: width > 500 ? 25 : 20,
    marginBottom: width > 500 ? 20 : 15,
    marginHorizontal: width > 500 ? 5 : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentInfo: {
    marginBottom: width > 500 ? 20 : 15,
  },
  appointmentName: {
    fontSize: width > 500 ? 20 : 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  appointmentDescription: {
    fontSize: width > 500 ? 15 : 14,
    color: "#666666",
    marginBottom: width > 500 ? 15 : 12,
    lineHeight: width > 500 ? 22 : 20,
  },
  appointmentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: width > 500 ? 15 : 12,
  },
  statusBadge: {
    paddingHorizontal: width > 500 ? 15 : 12,
    paddingVertical: width > 500 ? 8 : 6,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#E8F5E9",
    borderColor: "#ADC178",
  },
  statusText: {
    fontSize: width > 500 ? 14 : 13,
    fontWeight: "600",
    color: "#ADC178",
  },
  actionButton: {
    paddingHorizontal: width > 500 ? 15 : 12,
    paddingVertical: width > 500 ? 8 : 6,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  actionButtonText: {
    color: "#6C584C",
    fontWeight: "600",
    fontSize: width > 500 ? 14 : 13,
    marginLeft: 6,
  },
  footer: {
    height: width > 500 ? 40 : 30,
  },
});

export default DashboardNutricionista;
