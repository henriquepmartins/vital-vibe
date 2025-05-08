"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  Image,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { supabase } from "@/lib/supabase";

const upcomingAppointments: Appointment[] = [
  {
    id: "1",
    name: "Maria Silva",
    date: "22/03/2025",
    time: "10:00",
    status: "confirmado",
  },
  {
    id: "2",
    name: "João Santos",
    date: "22/03/2025",
    time: "14:30",
    status: "pendente",
  },
  {
    id: "3",
    name: "Ana Oliveira",
    date: "23/03/2025",
    time: "09:15",
    status: "confirmado",
  },
];

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
  Agendamento: undefined;
  Profile: undefined;
  "Plano Alimentar": undefined;
  Chat: undefined;
};

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

type Appointment = {
  id: string;
  name: string;
  date: string;
  time: string;
  status: "confirmado" | "pendente";
};

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [waterProgress, setWaterProgress] = useState(2);
  const totalWaterGoal = 8;
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

  const renderAppointmentItem = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentInfo}>
        <Text style={styles.appointmentName}>{item.name}</Text>
        <Text style={styles.appointmentDate}>
          {item.date} às {item.time}
        </Text>
      </View>
      <View style={styles.appointmentActions}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "confirmado" ? "#E8F5E9" : "#FFF8E1",
              borderColor: item.status === "confirmado" ? "#ADC178" : "#FFC107",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: item.status === "confirmado" ? "#ADC178" : "#FFC107" },
            ]}
          >
            {item.status === "confirmado" ? "Confirmado" : "Pendente"}
          </Text>
        </View>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>
            {item.status === "confirmado" ? "Reagendar" : "Confirmar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleWaterIntake = (id: string) => {
    const newWaterProgress =
      waterProgress < totalWaterGoal ? waterProgress + 1 : waterProgress;
    setWaterProgress(newWaterProgress);
  };

  return (
    <SafeAreaView style={styles.container}>
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
              <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
                <Ionicons name="search-outline" size={22} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => {}}
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
                onPress={() => navigation.navigate("Profile")}
              >
                <Image
                  source={{ uri: "https://via.placeholder.com/150" }}
                  style={styles.avatar}
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
                  <Ionicons name="calendar-outline" size={18} color="white" />
                </View>
                <View>
                  <Text style={styles.statValue}>3</Text>
                  <Text style={styles.statLabel}>Consultas</Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="water-outline" size={18} color="white" />
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

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Agendamento")}
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
            onPress={() => navigation.navigate("Profile")}
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
            <Text style={styles.sectionTitle}>Próximas Consultas</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Agendamento")}
            >
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={upcomingAppointments}
            renderItem={renderAppointmentItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Horários Disponíveis Hoje</Text>
          </View>
          <View style={styles.timeSlotGrid}>
            {availableSlots.map((slot) => (
              <TouchableOpacity key={slot.id} style={styles.timeSlot}>
                <Text style={styles.timeSlotPeriod}>
                  {slot.period} - {slot.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
              {waterIntake.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.waterGlass,
                    { opacity: index < waterProgress ? 1 : 0.5 },
                  ]}
                  onPress={() => handleWaterIntake(item.id)}
                >
                  <Ionicons
                    name="water"
                    size={24}
                    color={index < waterProgress ? "#ADC178" : "#CCCCCC"}
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
            <TouchableOpacity
              onPress={() => navigation.navigate("Plano Alimentar")}
            >
              <Text style={styles.seeAllText}>Ver completo</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.mealPlanCard}
            onPress={() => navigation.navigate("Plano Alimentar")}
          >
            <View style={styles.mealPlanContent}>
              <View style={styles.mealPlanInfo}>
                <Text style={styles.mealPlanTitle}>Café da Manhã</Text>
                <Text style={styles.mealPlanDescription}>
                  1 fatia de pão integral{"\n"}1 ovo mexido{"\n"}1 xícara de chá
                  verde
                </Text>
              </View>
              <Ionicons name="restaurant-outline" size={40} color="#ADC178" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dúvidas Rápidas?</Text>
          </View>
          <TouchableOpacity
            style={styles.chatCard}
            onPress={() => navigation.navigate("Chat")}
          >
            <View style={styles.chatCardContent}>
              <Ionicons name="chatbubbles-outline" size={40} color="#ADC178" />
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
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");
const STATUSBAR_HEIGHT =
  Platform.OS === "ios" ? 20 : StatusBar.currentHeight || 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerContainer: {
    width: "100%",
    overflow: "hidden",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : STATUSBAR_HEIGHT + 10,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: "relative",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "column",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 32,
    marginTop: -2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#6C584C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ADC178",
  },
  notificationBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "white",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  headerBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 22,
  },
  greetingContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  currentDate: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statsContainer: {
    flexDirection: "column",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 10,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  headerCurve: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollView: {
    flex: 1,
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#ADC178",
    borderRadius: 10,
    paddingVertical: 15,
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
    fontSize: 16,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 15,
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
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  seeAllText: {
    color: "#6C584C",
    fontWeight: "500",
  },
  appointmentCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentInfo: {
    marginBottom: 10,
  },
  appointmentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  appointmentDate: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  appointmentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  actionButtonText: {
    color: "#6C584C",
    fontWeight: "500",
  },
  timeSlotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  timeSlot: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ADC178",
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
  },
  timeSlotPeriod: {
    color: "#ADC178",
    fontWeight: "500",
  },
  waterTrackerCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  waterProgressContainer: {
    marginBottom: 15,
  },
  waterProgressBar: {
    height: 10,
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
  },
  waterGlassesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  waterGlass: {
    width: "22%",
    alignItems: "center",
    marginBottom: 10,
  },
  waterGlassTime: {
    fontSize: 12,
    color: "#666666",
    marginTop: 5,
  },
  mealPlanCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  mealPlanDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  chatCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
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
    marginLeft: 15,
    flex: 1,
  },
  chatCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  chatCardDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  footer: {
    height: 20,
  },
});
