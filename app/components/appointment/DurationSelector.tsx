import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { COLORS } from "../../constants/Colors";

// Types
type AppointmentDuration = "30min" | "45min" | "60min";

interface DurationSelectorProps {
  appointmentDuration: AppointmentDuration;
  handleDurationSelect: (duration: AppointmentDuration) => void;
}

export const DurationSelector = ({
  appointmentDuration,
  handleDurationSelect,
}: DurationSelectorProps) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Duração da Consulta</Text>
      <View style={styles.durationContainer}>
        <TouchableOpacity
          style={[
            styles.durationButton,
            appointmentDuration === "30min" && styles.durationButtonActive,
          ]}
          onPress={() => handleDurationSelect("30min")}
        >
          <Text
            style={[
              styles.durationButtonText,
              appointmentDuration === "30min" &&
                styles.durationButtonTextActive,
            ]}
          >
            30 minutos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.durationButton,
            appointmentDuration === "45min" && styles.durationButtonActive,
          ]}
          onPress={() => handleDurationSelect("45min")}
        >
          <Text
            style={[
              styles.durationButtonText,
              appointmentDuration === "45min" &&
                styles.durationButtonTextActive,
            ]}
          >
            45 minutos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.durationButton,
            appointmentDuration === "60min" && styles.durationButtonActive,
          ]}
          onPress={() => handleDurationSelect("60min")}
        >
          <Text
            style={[
              styles.durationButtonText,
              appointmentDuration === "60min" &&
                styles.durationButtonTextActive,
            ]}
          >
            1 hora
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    margin: 20,
    marginTop: 0,
    padding: 15,
    shadowColor: COLORS.brown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.brown,
    marginBottom: 15,
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  durationButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.lightSage,
    paddingVertical: 12,
    marginHorizontal: 5,
    alignItems: "center",
  },
  durationButtonActive: {
    backgroundColor: COLORS.sage,
    borderColor: COLORS.sage,
  },
  durationButtonText: {
    color: COLORS.taupe,
    fontWeight: "500",
  },
  durationButtonTextActive: {
    color: COLORS.white,
  },
});

export default DurationSelector;
export type { AppointmentDuration };
