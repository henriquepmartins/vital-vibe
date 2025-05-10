"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { type DateData } from "react-native-calendars";

import AppointmentHeader from "../components/appointment/AppointmentHeader";
import AppointmentSteps from "../components/appointment/AppointmentSteps";
import AppointmentCalendar from "../components/appointment/AppointmentCalendar";
import DurationSelector from "../components/appointment/DurationSelector";
import TimeSlots from "../components/appointment/TimeSlots";
import AppointmentSummary from "../components/appointment/AppointmentSummary";
import AppointmentTypes from "../components/appointment/AppointmentTypes";
import ReminderOptions from "../components/appointment/ReminderOptions";
import CancellationPolicy from "../components/appointment/CancellationPolicy";
import StepButtons from "../components/appointment/StepButtons";

// Import types
import type { AppointmentDuration } from "../components/appointment/DurationSelector";
import type { AppointmentType } from "../components/appointment/AppointmentTypes";
import type { ReminderTime } from "../components/appointment/ReminderOptions";
import type { TimeSlot } from "../components/appointment/TimeSlots";

import { COLORS } from "../constants/Colors";
import {
  getAvailableTimeSlots,
  formatDate,
  NUTRITIONIST,
} from "../utils/appointment";
import React from "react";
import { router } from "expo-router";

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
    if (selectedDate) {
      setLoading(true);
      setTimeout(() => {
        setTimeSlots(getAvailableTimeSlots(selectedDate, appointmentDuration));
        setLoading(false);
      }, 500);
    }
  }, [selectedDate, appointmentDuration]);

  const handleDateSelect = (day: DateData) => {
    setSelectedDate(day.dateString);
    setSelectedTimeSlot("");
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

  const handleScheduleAppointment = () => {
    Alert.alert(
      "Consulta Agendada",
      `Sua consulta foi agendada para ${formatDate(selectedDate)} às ${
        getTimeSlotById(selectedTimeSlot)?.time
      }.`,
      [
        {
          text: "OK",
          onPress: () => {
            router.push("/dashboard");
          },
        },
      ]
    );
  };

  // Render step 1: Date and time selection
  const renderStep1 = () => (
    <>
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

  // Render step 2: Appointment details
  const renderStep2 = () => (
    <>
      <AppointmentSummary
        selectedDate={selectedDate}
        appointmentDuration={appointmentDuration}
        selectedTimeSlot={selectedTimeSlot}
        formatDate={formatDate}
        getTimeSlotById={getTimeSlotById}
        nutritionist={NUTRITIONIST}
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
