"use client";

import { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  Modal,
  Alert,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useAppointment } from "../contexts/AppointmentContext";
import { useHydration } from "../contexts/HydrationContext";
import { ChatBot } from "../components/chat/ChatBot";
import { useFocusEffect } from "@react-navigation/native";
import { getIconForMeal, CutleryIcon } from "../utils/icons";
import Toast from "react-native-toast-message";

const availableSlots = [
  { id: "1", period: "Manhã", time: "11:00" },
  { id: "2", period: "Tarde", time: "14:00" },
  { id: "3", period: "Tarde", time: "15:30" },
  { id: "4", period: "Tarde", time: "16:45" },
];

const waterIntake = [
  { id: "1", time: "08:00", completed: true },
  { id: "2", time: "10:00", completed: true },
  { id: "3", time: "12:00", completed: false },
  { id: "4", time: "14:00", completed: false },
  { id: "5", time: "16:00", completed: false },
  { id: "6", time: "18:00", completed: false },
  { id: "7", time: "20:00", completed: false },
  { id: "8", time: "22:00", completed: false },
];

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  "screens/ProfileScreen": undefined;
  Agendamento: undefined;
  Chat: undefined;
};

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Dashboard">;
};

type Appointment = {
  id: string;
  date: string;
  start_time: string;
  appointment_type: string;
  status: string;
  duration: number;
};

const { width, height } = Dimensions.get("window");

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Bom dia");
  const [currentDate, setCurrentDate] = useState("");
  const [userName, setUserName] = useState<string>("");
  const { appointmentCount } = useAppointment();
  const { waterProgress, totalWaterGoal, waterIntake, handleWaterIntake } =
    useHydration();
  const [userMealPlan, setUserMealPlan] = useState<null | {
    descricao: string;
    refeicoes: { type: string; description: string }[];
  }>(null);
  const [loadingMealPlan, setLoadingMealPlan] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchDrawerVisible, setSearchDrawerVisible] = useState(false);
  const [notificationDrawerVisible, setNotificationDrawerVisible] =
    useState(false);
  const [searchText, setSearchText] = useState("");
  const [chatBotOpen, setChatBotOpen] = useState(false);

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
    async function fetchUserName() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (userId) {
        const { data, error } = await supabase
          .from("users")
          .select("name")
          .eq("id", userId)
          .single();
        if (data?.name) {
          const firstName = data.name.split(" ")[0];
          setUserName(
            firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
          );
        }
      }
    }
    fetchUserName();
  }, []);

  useEffect(() => {
    async function fetchMealPlan() {
      setLoadingMealPlan(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        setUserMealPlan(null);
        setLoadingMealPlan(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("planos_alimentares")
          .select("descricao, refeicoes")
          .eq("paciente_id", userId)
          .order("validade_inicio", { ascending: false })
          .limit(1)
          .single();
        if (error) throw error;
        if (
          data &&
          data.refeicoes &&
          Array.isArray(data.refeicoes) &&
          data.refeicoes.length > 0
        ) {
          setUserMealPlan({
            descricao: data.descricao,
            refeicoes: data.refeicoes,
          });
        } else {
          setUserMealPlan(null);
        }
      } catch (err) {
        setUserMealPlan(null);
      } finally {
        setLoadingMealPlan(false);
      }
    }
    fetchMealPlan();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace("/");
      }
    };
    checkAuth();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        console.error("Usuário não autenticado");
        setUpcomingAppointments([]);
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          id,
          user_id,
          appointment_type,
          date,
          start_time,
          duration,
          status,
          reminder_type,
          reminder_time,
          created_at,
          updated_at
        `
        )
        .eq("user_id", userId)
        .gte("date", today)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Erro ao buscar consultas:", error);
        setUpcomingAppointments([]);
        return;
      }

      if (!data || data.length === 0) {
        console.log("Nenhuma consulta futura encontrada");
        setUpcomingAppointments([]);
        return;
      }

      setUpcomingAppointments(data);
    } catch (error) {
      console.error("Erro ao buscar consultas:", error);
      setUpcomingAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Estado atual das consultas:", upcomingAppointments);
  }, [upcomingAppointments]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    const options = { weekday: "long", day: "numeric", month: "long" } as const;
    const formattedDate = date.toLocaleDateString("pt-BR", options);

    const [weekday, ...rest] = formattedDate.split(" ");
    const capitalizedWeekday =
      weekday.charAt(0).toUpperCase() + weekday.slice(1);

    return `${capitalizedWeekday} ${rest.join(" ")}`;
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const getAppointmentTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      initial: "Avaliação Inicial",
      followup: "Consulta de Acompanhamento",
      assessment: "Avaliação Física",
      consultation: "Orientação Nutricional",
    };
    return types[type] || type;
  };

  const getAppointmentDescription = (type: string) => {
    const descriptions: { [key: string]: string } = {
      initial:
        "Primeira consulta para avaliação completa e definição de objetivos",
      followup: "Acompanhamento de progresso e ajustes no plano alimentar",
      assessment: "Medições antropométricas e avaliação de composição corporal",
      consultation: "Esclarecimento de dúvidas e orientações específicas",
    };
    return descriptions[type] || "";
  };

  const renderAppointmentItem = ({ item }: { item: Appointment }) => {
    const formattedDate = formatDate(item.date);
    const formattedTime = formatTime(item.start_time);
    const appointmentType = getAppointmentTypeLabel(item.appointment_type);
    const appointmentDescription = getAppointmentDescription(
      item.appointment_type
    );

    const handleCancelAppointment = async () => {
      Alert.alert(
        "Cancelar consulta",
        "Tem certeza que deseja cancelar esta consulta?",
        [
          { text: "Não", style: "cancel" },
          {
            text: "Sim",
            style: "destructive",
            onPress: async () => {
              const { error } = await supabase
                .from("appointments")
                .delete()
                .eq("id", item.id);
              if (error) {
                Alert.alert("Erro", "Não foi possível cancelar a consulta.");
              } else {
                // Atualiza a lista localmente
                setUpcomingAppointments((prev) =>
                  prev.filter((a) => a.id !== item.id)
                );
                Toast.show({
                  type: "success",
                  text1: "Consulta cancelada com sucesso!",
                });
              }
            },
          },
        ]
      );
    };

    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentInfo}>
          <Text style={styles.appointmentName}>{appointmentType}</Text>
          <Text style={styles.appointmentDescription}>
            {appointmentDescription}
          </Text>
          <View style={styles.appointmentDateTime}>
            <View style={styles.dateTimeItem}>
              <Ionicons name="calendar-outline" size={16} color="#666666" />
              <Text style={styles.appointmentDate}>{formattedDate}</Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Ionicons name="time-outline" size={16} color="#666666" />
              <Text style={styles.appointmentTime}>{formattedTime}</Text>
            </View>
          </View>
        </View>
        <View style={styles.appointmentActions}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === "scheduled" ? "#E8F5E9" : "#FFF8E1",
                borderColor:
                  item.status === "scheduled" ? "#ADC178" : "#FFC107",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: item.status === "scheduled" ? "#ADC178" : "#FFC107" },
              ]}
            >
              {item.status === "scheduled" ? "Confirmado" : "Pendente"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/consulta")}
          >
            <Text style={styles.actionButtonText}>
              {item.status === "scheduled" ? "Reagendar" : "Confirmar"}
            </Text>
          </TouchableOpacity>
          {/* Botão de cancelar consulta */}
          {item.status === "scheduled" && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: "#ffdddd",
                  borderColor: "#ff4444",
                  marginLeft: 8,
                },
              ]}
              onPress={handleCancelAppointment}
            >
              <Text style={[styles.actionButtonText, { color: "#ff4444" }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderAppointments = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando consultas...</Text>
        </View>
      );
    }

    if (upcomingAppointments.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma consulta agendada</Text>
          <TouchableOpacity
            style={styles.scheduleButton}
            onPress={() => router.push("/consulta")}
          >
            <Text style={styles.scheduleButtonText}>Agendar Consulta</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={upcomingAppointments.filter((a) => a.status !== "cancelled")}
        renderItem={renderAppointmentItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    );
  };

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
            <View style={styles.headerContainer}>
              <LinearGradient
                colors={["#ADC178", "#ADC178"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerGradient}
              >
                <View style={styles.headerTop}>
                  <View style={styles.headerLeft}>
                    <View style={styles.logoContainer}>
                      <Ionicons name="leaf" size={24} color="white" />
                      <Text style={styles.logoText}>VitalVibe</Text>
                    </View>
                    <Text style={styles.headerSubtitle}>UNDB</Text>
                  </View>

                  <View style={styles.headerRight}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => setSearchDrawerVisible(true)}
                    >
                      <Ionicons name="search-outline" size={22} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.notificationButton}
                      onPress={() => setNotificationDrawerVisible(true)}
                    >
                      <Ionicons
                        name="notifications-outline"
                        size={22}
                        color="white"
                      />
                      <View style={styles.notificationBadge}>
                        <Text style={styles.notificationBadgeText}>2</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.avatarContainer}
                      onPress={() => router.push("/profile")}
                    >
                      <View style={styles.avatarContent}>
                        <Ionicons
                          name="person"
                          size={width > 500 ? 26 : 22}
                          color="white"
                        />
                      </View>
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
                        <Text style={styles.statValue}>{appointmentCount}</Text>
                        <Text style={styles.statLabel}>Consultas</Text>
                      </View>
                    </View>

                    <View style={styles.statItem}>
                      <View style={styles.statIconContainer}>
                        <Ionicons
                          name="water-outline"
                          size={18}
                          color="white"
                        />
                      </View>
                      <View>
                        <Text style={styles.statValue}>
                          {waterProgress}/{totalWaterGoal}
                        </Text>
                        <Text style={styles.statLabel}>Hidratação</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.headerCurve} />
              </LinearGradient>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push("/consulta")}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="white"
                  style={styles.buttonIcon}
                />
                <Text style={styles.primaryButtonText}>Agendar Consulta</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push("/profile")}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#ADC178"
                  style={styles.buttonIcon}
                />
                <Text style={styles.secondaryButtonText}>Meu Perfil</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Minhas Consultas</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Agendamento")}
                >
                  <Text style={styles.seeAllText}>Ver todas</Text>
                </TouchableOpacity>
              </View>
              {renderAppointments()}
            </View>

            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Controle de Hidratação</Text>
              </View>
              <View style={styles.waterTrackerCard}>
                <View style={styles.waterProgressContainer}>
                  <View style={styles.waterProgressBar}>
                    <LinearGradient
                      colors={["#ADC178", "#4CAF50"]}
                      style={[
                        styles.waterProgressFill,
                        { width: `${(waterProgress / totalWaterGoal) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.waterProgressText}>
                    {waterProgress} de {totalWaterGoal} copos
                  </Text>
                </View>
                <View style={styles.waterGlassesContainer}>
                  {waterIntake.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.waterGlass,
                        { opacity: item.completed ? 1 : 0.5 },
                      ]}
                      onPress={() => handleWaterIntake(item.id)}
                    >
                      <Ionicons
                        name="water"
                        size={24}
                        color={item.completed ? "#ADC178" : "#CCCCCC"}
                      />
                      <Text style={styles.waterGlassTime}>{item.time}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Plano Alimentar de Hoje</Text>
                {userMealPlan && (
                  <TouchableOpacity onPress={() => setDrawerVisible(true)}>
                    <Text style={[styles.seeAllText, { color: "#6C584C" }]}>
                      Ver completo
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {loadingMealPlan ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>
                    Carregando plano alimentar...
                  </Text>
                </View>
              ) : userMealPlan ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setDrawerVisible(true)}
                  style={{ marginBottom: 12 }}
                >
                  <View
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 14,
                      padding: 18,
                      flexDirection: "row",
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.07,
                      shadowRadius: 6,
                      elevation: 2,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 16,
                          marginBottom: 4,
                          color: "#333",
                        }}
                      >
                        {userMealPlan.refeicoes[0]?.type || "Refeição"}
                      </Text>
                      <Text
                        style={{ color: "#666", fontSize: 15, lineHeight: 22 }}
                      >
                        {(userMealPlan.refeicoes[0]?.description || "-")
                          .split("\n")
                          .map((line, idx) => (
                            <Text key={idx} style={{ color: "#666" }}>
                              {line}
                              {"\n"}
                            </Text>
                          ))}
                      </Text>
                    </View>
                    <CutleryIcon />
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Você ainda não possui um plano alimentar.
                  </Text>
                </View>
              )}
            </View>

            {/* Drawer/Modal para o plano completo */}
            <Modal
              visible={drawerVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setDrawerVisible(false)}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.18)",
                  justifyContent: "flex-end",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    padding: 24,
                    minHeight: "60%",
                    maxHeight: "90%",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        color: "#333",
                      }}
                    >
                      {userMealPlan?.descricao}
                    </Text>
                    <TouchableOpacity onPress={() => setDrawerVisible(false)}>
                      <Ionicons name="close" size={28} color="#6C584C" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {userMealPlan?.refeicoes.map((meal, idx) => (
                      <View
                        key={idx}
                        style={{
                          backgroundColor: "#F8F9FA",
                          borderRadius: 14,
                          padding: 16,
                          marginBottom: 14,
                          flexDirection: "row",
                          alignItems: "flex-start",
                        }}
                      >
                        <View style={{ marginRight: 12, marginTop: 2 }}>
                          {getIconForMeal(meal.type)}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontWeight: "bold",
                              fontSize: 15,
                              color: "#333",
                              marginBottom: 2,
                            }}
                          >
                            {meal.type}
                          </Text>
                          <Text
                            style={{
                              color: "#666",
                              fontSize: 15,
                              lineHeight: 22,
                            }}
                          >
                            {(meal.description || "-")
                              .split("\n")
                              .map((line, i) => (
                                <Text key={i} style={{ color: "#666" }}>
                                  {line}
                                  {"\n"}
                                </Text>
                              ))}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>

            {/* Drawers */}
            <Modal
              visible={searchDrawerVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setSearchDrawerVisible(false)}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.18)",
                  justifyContent: "flex-end",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    padding: 24,
                    minHeight: 180,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        color: "#333",
                      }}
                    >
                      Buscar
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSearchDrawerVisible(false)}
                    >
                      <Ionicons name="close" size={28} color="#6C584C" />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={{
                      backgroundColor: "#F8F9FA",
                      borderRadius: 10,
                      padding: 12,
                      fontSize: 16,
                      color: "#333",
                    }}
                    placeholder="Digite para buscar..."
                    placeholderTextColor="#888"
                    value={searchText}
                    onChangeText={setSearchText}
                    autoFocus
                  />
                  {/* Aqui pode-se adicionar lógica de busca futuramente */}
                </View>
              </View>
            </Modal>
            <Modal
              visible={notificationDrawerVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setNotificationDrawerVisible(false)}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.18)",
                  justifyContent: "flex-end",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    padding: 24,
                    minHeight: 220,
                    maxHeight: 400,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        color: "#333",
                      }}
                    >
                      Notificações
                    </Text>
                    <TouchableOpacity
                      onPress={() => setNotificationDrawerVisible(false)}
                    >
                      <Ionicons name="close" size={28} color="#6C584C" />
                    </TouchableOpacity>
                  </View>
                  {/* Lista mockada de notificações */}
                  <View style={{ gap: 16 }}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#ADC178"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{ color: "#333", fontSize: 15 }}>
                        Você tem uma consulta agendada para amanhã.
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons
                        name="water-outline"
                        size={20}
                        color="#ADC178"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{ color: "#333", fontSize: 15 }}>
                        Não esqueça de beber água hoje!
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Modal>

            <View style={styles.chatSectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Dúvidas Rápidas?</Text>
              </View>
              <TouchableOpacity
                style={styles.chatCard}
                onPress={() => setChatBotOpen(true)}
              >
                <View style={styles.chatCardContent}>
                  <Ionicons
                    name="chatbubbles-outline"
                    size={40}
                    color="#ADC178"
                  />
                  <View style={styles.chatCardInfo}>
                    <Text style={styles.chatCardTitle}>
                      Fale com sua nutricionista
                    </Text>
                    <Text style={styles.chatCardDescription}>
                      Tire suas dúvidas sobre alimentação, porções e seu plano
                      alimentar.
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#ADC178" />
              </TouchableOpacity>
            </View>

            <View style={styles.footer} />
          </ScrollView>
        </View>
      </View>
      <ChatBot open={chatBotOpen} onClose={() => setChatBotOpen(false)} />
    </View>
  );
}

const STATUSBAR_HEIGHT = StatusBar.currentHeight || 44;

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
  headerLeft: {
    flexDirection: "column",
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: width > 500 ? 42 : 36,
    height: width > 500 ? 42 : 36,
    borderRadius: width > 500 ? 21 : 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: width > 500 ? 15 : 12,
  },
  notificationButton: {
    width: width > 500 ? 42 : 36,
    height: width > 500 ? 42 : 36,
    borderRadius: width > 500 ? 21 : 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: width > 500 ? 15 : 12,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: width > 500 ? 20 : 18,
    height: width > 500 ? 20 : 18,
    borderRadius: width > 500 ? 10 : 9,
    backgroundColor: "#6C584C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ADC178",
  },
  notificationBadgeText: {
    color: "white",
    fontSize: width > 500 ? 11 : 10,
    fontWeight: "bold",
  },
  avatarContainer: {
    width: width > 500 ? 42 : 36,
    height: width > 500 ? 42 : 36,
    borderRadius: width > 500 ? 21 : 18,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 0,
  },
  avatarContent: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
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
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: width > 500 ? 25 : 20,
    marginBottom: width > 500 ? 25 : 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#ADC178",
    borderRadius: 10,
    paddingVertical: width > 500 ? 18 : 15,
    marginRight: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ADC178",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: width > 500 ? 18 : 16,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: width > 500 ? 18 : 15,
    borderWidth: 1,
    borderColor: "#ADC178",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonText: {
    color: "#ADC178",
    fontWeight: "bold",
    fontSize: width > 500 ? 18 : 16,
  },
  buttonIcon: {
    marginRight: width > 500 ? 10 : 8,
  },
  sectionContainer: {
    marginBottom: width > 500 ? 30 : 25,
    paddingHorizontal: width > 500 ? 25 : 20,
  },
  chatSectionContainer: {
    marginBottom: width > 500 ? 30 : 25,
    paddingHorizontal: width > 500 ? 25 : 20,
    marginTop: width > 500 ? 40 : 30,
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
  seeAllText: {
    color: "#6C584C",
    fontWeight: "500",
    fontSize: width > 500 ? 15 : 14,
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
  appointmentDateTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: width > 500 ? 20 : 15,
    backgroundColor: "#F8F9FA",
    padding: width > 500 ? 15 : 12,
    borderRadius: 10,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  appointmentDate: {
    fontSize: width > 500 ? 15 : 14,
    color: "#444444",
    fontWeight: "500",
  },
  appointmentTime: {
    fontSize: width > 500 ? 15 : 14,
    color: "#444444",
    fontWeight: "500",
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
  },
  statusText: {
    fontSize: width > 500 ? 14 : 13,
    fontWeight: "600",
  },
  actionButton: {
    paddingHorizontal: width > 500 ? 15 : 12,
    paddingVertical: width > 500 ? 8 : 6,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#6C584C",
    fontWeight: "600",
    fontSize: width > 500 ? 14 : 13,
  },
  timeSlotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  timeSlot: {
    width: width > 500 ? "48.5%" : "48%",
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ADC178",
    padding: width > 500 ? 18 : 15,
    marginBottom: width > 500 ? 15 : 10,
    alignItems: "center",
  },
  timeSlotPeriod: {
    color: "#ADC178",
    fontWeight: "500",
    fontSize: width > 500 ? 15 : 14,
  },
  waterTrackerCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: width > 500 ? 20 : 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  waterProgressContainer: {
    marginBottom: width > 500 ? 20 : 15,
  },
  waterProgressBar: {
    height: width > 500 ? 12 : 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    marginBottom: 5,
    overflow: "hidden",
  },
  waterProgressFill: {
    height: "100%",
    borderRadius: 5,
  },
  waterProgressText: {
    textAlign: "center",
    color: "#666666",
    fontSize: width > 500 ? 14 : 12,
  },
  waterGlassesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  waterGlass: {
    width: width > 500 ? "22.5%" : "22%",
    alignItems: "center",
    marginBottom: width > 500 ? 15 : 10,
  },
  waterGlassTime: {
    fontSize: width > 500 ? 13 : 12,
    color: "#666666",
    marginTop: 5,
  },
  mealPlanCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: width > 500 ? 20 : 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mealPlanContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealPlanInfo: {
    flex: 1,
  },
  mealPlanTitle: {
    fontSize: width > 500 ? 18 : 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  mealPlanDescription: {
    fontSize: width > 500 ? 15 : 14,
    color: "#666666",
    lineHeight: width > 500 ? 22 : 20,
  },
  chatCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: width > 500 ? 20 : 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatCardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  chatCardInfo: {
    marginLeft: width > 500 ? 20 : 15,
    flex: 1,
  },
  chatCardTitle: {
    fontSize: width > 500 ? 18 : 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  chatCardDescription: {
    fontSize: width > 500 ? 15 : 14,
    color: "#666666",
    lineHeight: width > 500 ? 22 : 20,
  },
  footer: {
    height: width > 500 ? 40 : 30,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: width > 500 ? 16 : 14,
    color: "#666666",
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
  scheduleButton: {
    backgroundColor: "#ADC178",
    paddingHorizontal: width > 500 ? 25 : 20,
    paddingVertical: width > 500 ? 12 : 10,
    borderRadius: 10,
    shadowColor: "#ADC178",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: width > 500 ? 15 : 13,
  },
});
