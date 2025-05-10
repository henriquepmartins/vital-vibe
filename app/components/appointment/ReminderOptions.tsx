import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { COLORS } from "../../constants/Colors";

// Types
type ReminderTime = "15min" | "30min" | "1hour" | "1day";

// Get reminder options
const getReminderOptions = (): { value: ReminderTime; label: string }[] => {
  return [
    { value: "15min", label: "15 minutos antes" },
    { value: "30min", label: "30 minutos antes" },
    { value: "1hour", label: "1 hora antes" },
    { value: "1day", label: "1 dia antes" },
  ];
};

interface ReminderOptionsProps {
  reminderTime: ReminderTime;
  handleReminderSelect: (reminder: ReminderTime) => void;
}

export const ReminderOptions = ({
  reminderTime,
  handleReminderSelect,
}: ReminderOptionsProps) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Lembrete</Text>
      <View style={styles.reminderContainer}>
        {getReminderOptions().map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.reminderButton,
              reminderTime === option.value && styles.reminderButtonActive,
            ]}
            onPress={() => handleReminderSelect(option.value)}
          >
            <Text
              style={[
                styles.reminderButtonText,
                reminderTime === option.value &&
                  styles.reminderButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
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
  reminderContainer: {
    marginBottom: 15,
  },
  reminderButton: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.lightSage,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  reminderButtonActive: {
    backgroundColor: COLORS.lightSage,
    borderColor: COLORS.sage,
  },
  reminderButtonText: {
    color: COLORS.taupe,
    fontWeight: "500",
  },
  reminderButtonTextActive: {
    color: COLORS.brown,
    fontWeight: "bold",
  },
});

export default ReminderOptions;
export type { ReminderTime };
