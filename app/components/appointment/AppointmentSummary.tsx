import { StyleSheet, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/Colors";
import { TimeSlot } from "./TimeSlots";
import { AppointmentDuration } from "./DurationSelector";

interface Nutritionist {
  id: string;
  name: string;
  specialty: string;
  photoUrl: string;
  phone: string;
  email: string;
}

interface AppointmentSummaryProps {
  selectedDate: string;
  appointmentDuration: AppointmentDuration;
  selectedTimeSlot: string;
  formatDate: (dateString: string) => string;
  getTimeSlotById: (id: string) => TimeSlot | undefined;
  nutritionist: Nutritionist;
}

export const AppointmentSummary = ({
  selectedDate,
  appointmentDuration,
  selectedTimeSlot,
  formatDate,
  getTimeSlotById,
  nutritionist,
}: AppointmentSummaryProps) => {
  return (
    <View style={styles.appointmentSummaryContainer}>
      <LinearGradient
        colors={[COLORS.sage, COLORS.taupe]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.appointmentSummaryHeader}
      >
        <Text style={styles.appointmentSummaryTitle}>Resumo da Consulta</Text>
      </LinearGradient>

      <View style={styles.appointmentSummaryContent}>
        <View style={styles.appointmentSummaryRow}>
          <View style={styles.appointmentSummaryIconContainer}>
            <Ionicons name="calendar" size={20} color={COLORS.taupe} />
          </View>
          <View style={styles.appointmentSummaryTextContainer}>
            <Text style={styles.appointmentSummaryLabel}>Data</Text>
            <Text style={styles.appointmentSummaryValue}>
              {formatDate(selectedDate)}
            </Text>
          </View>
        </View>

        <View style={styles.appointmentSummaryRow}>
          <View style={styles.appointmentSummaryIconContainer}>
            <Ionicons name="time" size={20} color={COLORS.taupe} />
          </View>
          <View style={styles.appointmentSummaryTextContainer}>
            <Text style={styles.appointmentSummaryLabel}>Horário</Text>
            <Text style={styles.appointmentSummaryValue}>
              {getTimeSlotById(selectedTimeSlot)?.time || ""} - Duração:{" "}
              {appointmentDuration === "30min"
                ? "30 minutos"
                : appointmentDuration === "45min"
                ? "45 minutos"
                : "1 hora"}
            </Text>
          </View>
        </View>

        <View style={styles.appointmentSummaryRow}>
          <View style={styles.appointmentSummaryIconContainer}>
            <Ionicons name="person" size={20} color={COLORS.taupe} />
          </View>
          <View style={styles.appointmentSummaryTextContainer}>
            <Text style={styles.appointmentSummaryLabel}>Nutricionista</Text>
            <Text style={styles.appointmentSummaryValue}>
              {nutritionist.name}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appointmentSummaryContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    margin: 20,
    shadowColor: COLORS.brown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  appointmentSummaryHeader: {
    padding: 15,
  },
  appointmentSummaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
  },
  appointmentSummaryContent: {
    padding: 15,
  },
  appointmentSummaryRow: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  appointmentSummaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightSage,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  appointmentSummaryTextContainer: {
    flex: 1,
  },
  appointmentSummaryLabel: {
    fontSize: 14,
    color: COLORS.taupe,
  },
  appointmentSummaryValue: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.brown,
  },
});

export default AppointmentSummary;
export type { Nutritionist };
