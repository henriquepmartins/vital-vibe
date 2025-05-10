import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/Colors";

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface TimeSlotsProps {
  selectedDate: string;
  selectedTimeSlot: string;
  timeSlots: TimeSlot[];
  handleTimeSlotSelect: (slotId: string) => void;
  loading: boolean;
  formatDate: (dateString: string) => string;
}

export const TimeSlots = ({
  selectedDate,
  selectedTimeSlot,
  timeSlots,
  handleTimeSlotSelect,
  loading,
  formatDate,
}: TimeSlotsProps) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Horários Disponíveis</Text>
      <Text style={styles.dateSelected}>{formatDate(selectedDate)}</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.sage} />
          <Text style={styles.loadingText}>
            Carregando horários disponíveis...
          </Text>
        </View>
      ) : timeSlots.length > 0 ? (
        <View style={styles.timeSlotsGrid}>
          {timeSlots.map((slot) => (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.timeSlot,
                selectedTimeSlot === slot.id && styles.timeSlotSelected,
                !slot.available && styles.timeSlotUnavailable,
              ]}
              onPress={() => slot.available && handleTimeSlotSelect(slot.id)}
              disabled={!slot.available}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  selectedTimeSlot === slot.id && styles.timeSlotTextSelected,
                  !slot.available && styles.timeSlotTextUnavailable,
                ]}
              >
                {slot.time}
              </Text>
              {!slot.available && (
                <Text style={styles.unavailableText}>Indisponível</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.noTimeSlotsContainer}>
          <Ionicons name="calendar-outline" size={48} color="#CCCCCC" />
          <Text style={styles.noTimeSlotsText}>
            Não há horários disponíveis para esta data.
          </Text>
        </View>
      )}
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
  dateSelected: {
    fontSize: 16,
    color: COLORS.taupe,
    marginBottom: 15,
    fontStyle: "italic",
  },
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  timeSlot: {
    width: "31%",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.lightSage,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  timeSlotSelected: {
    backgroundColor: COLORS.sage,
    borderColor: COLORS.sage,
  },
  timeSlotUnavailable: {
    backgroundColor: COLORS.cream,
    borderColor: COLORS.lightSage,
  },
  timeSlotText: {
    color: COLORS.taupe,
    fontWeight: "500",
    fontSize: 16,
  },
  timeSlotTextSelected: {
    color: COLORS.white,
  },
  timeSlotTextUnavailable: {
    color: COLORS.taupe,
    opacity: 0.5,
  },
  unavailableText: {
    fontSize: 10,
    color: COLORS.taupe,
    opacity: 0.7,
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.taupe,
  },
  noTimeSlotsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  noTimeSlotsText: {
    marginTop: 10,
    color: COLORS.taupe,
    textAlign: "center",
  },
});

export default TimeSlots;
export type { TimeSlot };
