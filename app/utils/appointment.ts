import { AppointmentDuration } from "../components/appointment/DurationSelector";
import { TimeSlot } from "../components/appointment/TimeSlots";
import { Nutritionist } from "../components/appointment/AppointmentSummary";

// Mock data for the nutritionist
export const NUTRITIONIST: Nutritionist = {
  id: "1",
  name: "Dra. Ana Silva",
  specialty: "Nutrição Esportiva",
  photoUrl: "https://via.placeholder.com/150",
  phone: "(11) 98765-4321",
  email: "ana.silva@nutriapp.com",
};

// Mock function to get available time slots
export const getAvailableTimeSlots = (
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

// Format date for display
export const formatDate = (dateString: string): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const appointmentUtils = {
  getAvailableTimeSlots,
  formatDate,
  NUTRITIONIST,
};

export default appointmentUtils;
