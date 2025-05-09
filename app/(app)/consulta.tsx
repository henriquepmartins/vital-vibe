"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { type DateData } from "react-native-calendars";
import CustomCalendar from "../components/CustomCalendar";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { router } from "expo-router";
import COLORS from "../../constants/Colors";

type AppointmentDuration = "30min" | "45min" | "60min";
type ReminderTime = "15min" | "30min" | "1hour" | "1day";
type AppointmentType = "initial" | "followup" | "assessment" | "consultation";

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface Nutritionist {
  id: string;
  name: string;
  specialty: string;
  photoUrl: string;
  phone: string;
  email: string;
}

// Mock data
const NUTRITIONIST: Nutritionist = {
  id: "1",
  name: "Dra. Ana Silva",
  specialty: "Nutrição Esportiva",
  photoUrl: "https://via.placeholder.com/150",
  phone: "(11) 98765-4321",
  email: "ana.silva@nutriapp.com",
};

// Mock function to get available time slots
const getAvailableTimeSlots = (
  date: string,
  duration: AppointmentDuration
): TimeSlot[] => {
  // In a real app, this would fetch from an API
  const slots: TimeSlot[] = [
    { id: "1", time: "09:00", available: true },
    { id: "2", time: "09:30", available: false },
    { id: "3", time: "10:00", available: true },
    { id: "4", time: "10:30", available: true },
    { id: "5", time: "11:00", available: true },
    { id: "6", time: "11:30", available: false },
    { id: "7", time: "13:00", available: true },
    { id: "8", time: "13:30", available: true },
    { id: "9", time: "14:00", available: false },
    { id: "10", time: "14:30", available: true },
    { id: "11", time: "15:00", available: true },
    { id: "12", time: "15:30", available: false },
    { id: "13", time: "16:00", available: true },
    { id: "14", time: "16:30", available: true },
    { id: "15", time: "17:00", available: true },
  ];

  // Filter based on duration
  if (duration === "45min" || duration === "60min") {
    // Remove slots that would conflict with longer appointments
    return slots.filter((slot, index) => {
      if (!slot.available) return false;

      // For 45min or 60min appointments, check if next slot is available
      if (duration === "45min" && index < slots.length - 1) {
        return slots[index + 1].available;
      }

      // For 60min appointments, check if next two slots are available
      if (duration === "60min" && index < slots.length - 2) {
        return slots[index + 1].available && slots[index + 2].available;
      }

      return true;
    });
  }

  return slots;
};

// Get appointment types
const getAppointmentTypes = (): {
  id: AppointmentType;
  label: string;
  description: string;
}[] => {
  return [
    {
      id: "initial",
      label: "Avaliação Inicial",
      description:
        "Primeira consulta para avaliação completa e definição de objetivos.",
    },
    {
      id: "followup",
      label: "Consulta de Acompanhamento",
      description: "Acompanhamento de progresso e ajustes no plano alimentar.",
    },
    {
      id: "assessment",
      label: "Avaliação Física",
      description:
        "Medições antropométricas e avaliação de composição corporal.",
    },
    {
      id: "consultation",
      label: "Orientação Nutricional",
      description: "Esclarecimento de dúvidas e orientações específicas.",
    },
  ];
};

// Get reminder options
const getReminderOptions = (): { value: ReminderTime; label: string }[] => {
  return [
    { value: "15min", label: "15 minutos antes" },
    { value: "30min", label: "30 minutos antes" },
    { value: "1hour", label: "1 hora antes" },
    { value: "1day", label: "1 dia antes" },
  ];
};

const AppointmentScreen = ({ navigation }: any) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [appointmentDuration, setAppointmentDuration] =
    useState<AppointmentDuration>("30min");
  const [appointmentType, setAppointmentType] =
    useState<AppointmentType>("followup");
  const [reminderTime, setReminderTime] = useState<ReminderTime>("30min");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Marked dates for the calendar
  const markedDates: any = {
    [today]: { marked: true, dotColor: COLORS.sage },
  };

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: COLORS.sage,
    };
  }

  // Update time slots when date or duration changes
  useEffect(() => {
    if (selectedDate) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setTimeSlots(getAvailableTimeSlots(selectedDate, appointmentDuration));
        setLoading(false);
      }, 500);
    }
  }, [selectedDate, appointmentDuration]);

  // Handle date selection
  const handleDateSelect = (day: DateData) => {
    setSelectedDate(day.dateString);
    setSelectedTimeSlot("");
  };

  // Handle duration selection
  const handleDurationSelect = (duration: AppointmentDuration) => {
    setAppointmentDuration(duration);
    setSelectedTimeSlot("");
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slotId: string) => {
    setSelectedTimeSlot(slotId);
  };

  // Handle appointment type selection
  const handleAppointmentTypeSelect = (type: AppointmentType) => {
    setAppointmentType(type);
  };

  // Handle reminder selection
  const handleReminderSelect = (reminder: ReminderTime) => {
    setReminderTime(reminder);
  };

  // Handle appointment scheduling
  const handleScheduleAppointment = () => {
    // In a real app, this would send data to an API
    Alert.alert(
      "Consulta Agendada",
      `Sua consulta foi agendada para ${formatDate(selectedDate)} às ${
        getTimeSlotById(selectedTimeSlot)?.time
      }.`,
      [
        {
          text: "OK",
          onPress: () => {
            // Navigate back or to appointments list
            navigation.goBack();
          },
        },
      ]
    );
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get time slot by ID
  const getTimeSlotById = (id: string): TimeSlot | undefined => {
    return timeSlots.find((slot) => slot.id === id);
  };

  // Render step 1: Date and time selection
  const renderStep1 = () => (
    <>
      <View style={styles.calendarContainer}>
        <Text style={styles.sectionTitle}>Selecione uma data</Text>
        <CustomCalendar
          minDate={today}
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

      {selectedDate && (
        <>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Duração da Consulta</Text>
            <View style={styles.durationContainer}>
              <TouchableOpacity
                style={[
                  styles.durationButton,
                  appointmentDuration === "30min" &&
                    styles.durationButtonActive,
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
                  appointmentDuration === "45min" &&
                    styles.durationButtonActive,
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
                  appointmentDuration === "60min" &&
                    styles.durationButtonActive,
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
                    onPress={() =>
                      slot.available && handleTimeSlotSelect(slot.id)
                    }
                    disabled={!slot.available}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        selectedTimeSlot === slot.id &&
                          styles.timeSlotTextSelected,
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
        </>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!selectedDate || !selectedTimeSlot) && styles.nextButtonDisabled,
          ]}
          onPress={() => setCurrentStep(2)}
          disabled={!selectedDate || !selectedTimeSlot}
        >
          <Text style={styles.nextButtonText}>Continuar</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </>
  );

  // Render step 2: Appointment details
  const renderStep2 = () => (
    <>
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
                {NUTRITIONIST.name}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Tipo de Consulta</Text>
        <View style={styles.appointmentTypeContainer}>
          {getAppointmentTypes().map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.appointmentTypeButton,
                appointmentType === type.id &&
                  styles.appointmentTypeButtonActive,
              ]}
              onPress={() => handleAppointmentTypeSelect(type.id)}
            >
              <Text
                style={[
                  styles.appointmentTypeButtonText,
                  appointmentType === type.id &&
                    styles.appointmentTypeButtonTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.appointmentTypeDescription}>
          {
            getAppointmentTypes().find((type) => type.id === appointmentType)
              ?.description
          }
        </Text>
      </View>

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

      <View style={styles.cancellationPolicyContainer}>
        <Ionicons name="information-circle" size={20} color={COLORS.taupe} />
        <Text style={styles.cancellationPolicyText}>
          Política de cancelamento: Cancelamentos devem ser feitos com pelo
          menos 24 horas de antecedência para evitar cobranças.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(1)}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.taupe} />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleScheduleAppointment}
        >
          <Text style={styles.confirmButtonText}>Confirmar Agendamento</Text>
          <Ionicons name="checkmark" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={() => {
            if (currentStep > 1) {
              setCurrentStep(currentStep - 1);
            } else {
              router.push("/dashboard");
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.taupe} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendar Consulta</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.stepIndicatorContainer}>
        <View
          style={[
            styles.stepIndicator,
            currentStep >= 1 && styles.stepIndicatorActive,
          ]}
        >
          <Text
            style={[
              styles.stepIndicatorText,
              currentStep >= 1 && styles.stepIndicatorTextActive,
            ]}
          >
            1
          </Text>
        </View>
        <View style={styles.stepIndicatorLine} />
        <View
          style={[
            styles.stepIndicator,
            currentStep >= 2 && styles.stepIndicatorActive,
          ]}
        >
          <Text
            style={[
              styles.stepIndicatorText,
              currentStep >= 2 && styles.stepIndicatorTextActive,
            ]}
          >
            2
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 1 ? renderStep1() : renderStep2()}
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightSage,
  },
  backButtonHeader: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.brown,
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightSage,
  },
  stepIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.lightSage,
    justifyContent: "center",
    alignItems: "center",
  },
  stepIndicatorActive: {
    backgroundColor: COLORS.sage,
  },
  stepIndicatorText: {
    color: COLORS.taupe,
    fontWeight: "bold",
  },
  stepIndicatorTextActive: {
    color: COLORS.white,
  },
  stepIndicatorLine: {
    flex: 0.2,
    height: 2,
    backgroundColor: COLORS.lightSage,
    marginHorizontal: 10,
  },
  scrollView: {
    flex: 1,
  },
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: COLORS.sage,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    shadowColor: COLORS.taupe,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  nextButtonDisabled: {
    backgroundColor: "#CCCCCC",
    shadowOpacity: 0,
  },
  nextButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 10,
  },
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
  appointmentTypeContainer: {
    marginBottom: 15,
  },
  appointmentTypeButton: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.lightSage,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  appointmentTypeButtonActive: {
    backgroundColor: COLORS.lightSage,
    borderColor: COLORS.sage,
  },
  appointmentTypeButtonText: {
    color: COLORS.taupe,
    fontWeight: "500",
  },
  appointmentTypeButtonTextActive: {
    color: COLORS.brown,
    fontWeight: "bold",
  },
  appointmentTypeDescription: {
    fontSize: 14,
    color: COLORS.taupe,
    fontStyle: "italic",
    marginTop: 5,
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
  cancellationPolicyContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF8E1",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  cancellationPolicyText: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.taupe,
    fontSize: 14,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.taupe,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    flex: 0.4,
  },
  backButtonText: {
    color: COLORS.taupe,
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  confirmButton: {
    backgroundColor: COLORS.sage,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flex: 0.6,
    shadowColor: COLORS.taupe,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 10,
  },
  footer: {
    height: 20,
  },
});

export default AppointmentScreen;
