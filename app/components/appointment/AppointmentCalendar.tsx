import { StyleSheet, View, Text } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { COLORS } from "../../constants/Colors";

interface AppointmentCalendarProps {
  selectedDate: string;
  handleDateSelect: (day: DateData) => void;
  markedDates: any;
}

export const AppointmentCalendar = ({
  selectedDate,
  handleDateSelect,
  markedDates,
}: AppointmentCalendarProps) => {
  return (
    <View style={styles.calendarContainer}>
      <Text style={styles.sectionTitle}>Selecione uma data</Text>
      <Calendar
        minDate={new Date().toISOString().split("T")[0]}
        onDayPress={handleDateSelect}
        markedDates={markedDates}
        theme={{
          calendarBackground: COLORS.white,
          textSectionTitleColor: COLORS.taupe,
          selectedDayBackgroundColor: COLORS.sage,
          selectedDayTextColor: COLORS.white,
          todayTextColor: COLORS.sage,
          dayTextColor: COLORS.brown,
          textDisabledColor: "#d9e1e8",
          dotColor: COLORS.sage,
          selectedDotColor: COLORS.white,
          arrowColor: COLORS.taupe,
          monthTextColor: COLORS.brown,
          indicatorColor: COLORS.sage,
          textDayFontWeight: "300",
          textMonthFontWeight: "bold",
          textDayHeaderFontWeight: "500",
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    margin: 20,
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
});

export default AppointmentCalendar;
