"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  Alert,
  Text,
  Platform,
} from "react-native";
import { type DateData } from "react-native-calendars";
import { Picker } from "@react-native-picker/picker";

import {
  DurationSelector,
  type AppointmentDuration,
} from "../components/appointment/DurationSelector";
import {
  AppointmentTypes,
  type AppointmentType,
} from "../components/appointment/AppointmentTypes";
import {
  ReminderOptions,
  type ReminderTime,
} from "../components/appointment/ReminderOptions";
import { TimeSlots, type TimeSlot } from "../components/appointment/TimeSlots";

import { COLORS } from "../constants/Colors";
import {
  getAvailableTimeSlots,
  formatDate,
  NUTRITIONIST,
} from "../utils/appointment";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import React from "react";
import AppointmentCalendar from "../components/appointment/AppointmentCalendar";
import StepButtons from "../components/appointment/StepButtons";
import AppointmentSummary from "../components/appointment/AppointmentSummary";
import CancellationPolicy from "../components/appointment/CancellationPolicy";
import AppointmentHeader from "../components/appointment/AppointmentHeader";
import AppointmentSteps from "../components/appointment/AppointmentSteps";
import { useChat } from "../contexts/ChatContext";
import { useAppointment } from "../contexts/AppointmentContext";
import NutritionistSelector from "../components/appointment/NutritionistSelector";

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
  const { updateAppointmentInfo } = useChat();
  const { refreshAppointmentCount } = useAppointment();
  const [nutricionistas, setNutricionistas] = useState<any[]>([]);
  const [selectedNutri, setSelectedNutri] = useState<string>("");

  const today = new Date().toISOString().split("T")[0];

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

  useEffect(() => {
    const fetchAndSetTimeSlots = async () => {
      if (selectedDate) {
        setLoading(true);
        console.log(
          "[DEBUG] fetchAndSetTimeSlots - selectedDate:",
          selectedDate
        );
        const { data: appointments, error } = await supabase
          .from("appointments")
          .select("start_time, date")
          .eq("date", selectedDate);
        if (error) {
          setLoading(false);
          Alert.alert("Erro", "Erro ao buscar horários agendados.");
          return;
        }
        console.log(
          "[DEBUG] fetchAndSetTimeSlots - appointments retornados:",
          appointments
        );
        const bookedTimes = (appointments || []).map((a) => {
          return a.start_time && a.start_time.length === 5
            ? a.start_time + ":00"
            : a.start_time;
        });
        const slots = getAvailableTimeSlots(
          selectedDate,
          appointmentDuration
        ).map((slot) => ({
          ...slot,
          available: !bookedTimes.includes(
            slot.time.length === 5 ? slot.time + ":00" : slot.time
          ),
        }));
        setTimeSlots(slots);
        setLoading(false);
      }
    };
    fetchAndSetTimeSlots();
  }, [selectedDate, appointmentDuration]);

  useEffect(() => {
    // Buscar todos os nutricionistas
    const fetchNutricionistas = async () => {
      const { data, error } = await supabase
        .from("nutricionistas")
        .select("id, nome");
      if (!error && data) {
        setNutricionistas(data);
        if (data.length > 0 && !selectedNutri) {
          setSelectedNutri(data[0].id);
        }
      }
    };
    fetchNutricionistas();
  }, []);

  const handleDateSelect = (day: DateData) => {
    setSelectedDate(day.dateString);
    setSelectedTimeSlot("");
    console.log("[DEBUG] handleDateSelect - selectedDate:", day.dateString);
    console.log(
      "[DEBUG] Device timezone offset (min):",
      new Date().getTimezoneOffset()
    );
  };

  const handleDurationSelect = (duration: AppointmentDuration) => {
    setAppointmentDuration(duration);
    setSelectedTimeSlot("");
  };

  const handleTimeSlotSelect = (slotId: string) => {
    setSelectedTimeSlot(slotId);
  };

  const handleAppointmentTypeSelect = (type: AppointmentType) => {
    setAppointmentType(type);
  };

  const handleReminderSelect = (reminder: ReminderTime) => {
    setReminderTime(reminder);
  };

  const getTimeSlotById = (id: string): TimeSlot | undefined => {
    return timeSlots.find((slot) => slot.id === id);
  };

  const handleScheduleAppointment = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }
    if (!selectedNutri) {
      Alert.alert("Selecione um nutricionista.");
      return;
    }
    const slot = getTimeSlotById(selectedTimeSlot);
    const durationNumber = Number(
      String(appointmentDuration).replace(/\D/g, "")
    );
    let startTime = slot?.time || null;
    if (startTime && startTime.length === 5) {
      startTime = startTime + ":00";
    }
    const { data: existingAppointments, error: fetchError } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", userId)
      .eq("date", selectedDate)
      .eq("start_time", startTime);
    if (fetchError) {
      Alert.alert("Erro", "Erro ao verificar agendamentos existentes.");
      return;
    }
    if (existingAppointments && existingAppointments.length > 0) {
      Alert.alert(
        "Horário indisponível",
        "Você já possui uma consulta agendada nesse horário."
      );
      return;
    }
    const appointmentData = {
      user_id: userId,
      appointment_type: appointmentType,
      date: selectedDate,
      start_time: startTime,
      duration: durationNumber,
      status: "scheduled",
      reminder_type: "push",
      reminder_time: new Date(selectedDate + "T" + startTime).toISOString(),
      nutricionista_id: selectedNutri,
    };
    console.log(
      "[DEBUG] handleScheduleAppointment - appointmentData:",
      appointmentData
    );
    try {
      const { data, error } = await supabase
        .from("appointments")
        .insert([appointmentData])
        .select();
      if (error) {
        console.error("Erro ao agendar:", error);
        Alert.alert(
          "Erro ao agendar",
          error.message + (error.details ? `\n${error.details}` : "")
        );
        return;
      }
      console.log("Consulta agendada com sucesso:", data);

      // Atualiza o contexto do chat com as informações do agendamento
      updateAppointmentInfo({
        appointmentType:
          appointmentType === "initial"
            ? "avaliação"
            : appointmentType === "followup"
            ? "retorno"
            : appointmentType === "consultation"
            ? "orientação alimentar"
            : "avaliação",
        appointmentDate: new Date(selectedDate),
        appointmentTime: startTime?.substring(0, 5) || "",
      });

      // Atualiza o contador de consultas
      await refreshAppointmentCount();

      router.push("/ConsultaAgendada");
    } catch (err) {
      console.error("Erro inesperado:", err);
      Alert.alert("Erro", "Ocorreu um erro inesperado ao agendar a consulta.");
    }
  };

  const renderStep1 = () => (
    <>
      <NutritionistSelector
        nutricionistas={nutricionistas}
        selectedNutri={selectedNutri}
        setSelectedNutri={setSelectedNutri}
      />
      <AppointmentCalendar
        selectedDate={selectedDate}
        handleDateSelect={handleDateSelect}
        markedDates={markedDates}
      />
      {selectedDate && (
        <>
          <DurationSelector
            appointmentDuration={appointmentDuration}
            handleDurationSelect={handleDurationSelect}
          />
          <TimeSlots
            selectedDate={selectedDate}
            selectedTimeSlot={selectedTimeSlot}
            timeSlots={timeSlots}
            handleTimeSlotSelect={handleTimeSlotSelect}
            loading={loading}
            formatDate={formatDate}
          />
        </>
      )}
      <StepButtons
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        disableNext={!selectedDate || !selectedTimeSlot}
      />
    </>
  );

  const renderStep2 = () => {
    const selectedNutritionist = nutricionistas.find(
      (n) => n.id === selectedNutri
    );
    return (
      <>
        <AppointmentSummary
          selectedDate={selectedDate}
          appointmentDuration={appointmentDuration}
          selectedTimeSlot={selectedTimeSlot}
          formatDate={formatDate}
          getTimeSlotById={getTimeSlotById}
          nutritionist={{
            id: selectedNutritionist?.id || "",
            name: selectedNutritionist?.nome || "",
            specialty: "",
            photoUrl: "",
            phone: "",
            email: "",
          }}
        />
        <AppointmentTypes
          appointmentType={appointmentType}
          handleAppointmentTypeSelect={handleAppointmentTypeSelect}
        />
        <ReminderOptions
          reminderTime={reminderTime}
          handleReminderSelect={handleReminderSelect}
        />
        <CancellationPolicy />
        <StepButtons
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onConfirm={handleScheduleAppointment}
        />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppointmentHeader
        goBack={() => router.push("/dashboard")}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />
      <AppointmentSteps currentStep={currentStep} />
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
  scrollView: {
    flex: 1,
  },
  footer: {
    height: 20,
  },
});

export default AppointmentScreen;
