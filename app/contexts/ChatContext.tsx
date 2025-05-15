import React, { createContext, useContext, useState, ReactNode } from "react";

interface AppointmentInfo {
  patientName?: string;
  appointmentType?: "avaliação" | "retorno" | "orientação alimentar";
  appointmentDate?: Date;
  appointmentTime?: string;
  phoneNumber?: string;
}

interface ChatContextData {
  appointmentInfo: AppointmentInfo;
  updateAppointmentInfo: (info: Partial<AppointmentInfo>) => void;
  clearAppointmentInfo: () => void;
}

const ChatContext = createContext<ChatContextData>({} as ChatContextData);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [appointmentInfo, setAppointmentInfo] = useState<AppointmentInfo>({});

  const updateAppointmentInfo = (info: Partial<AppointmentInfo>) => {
    setAppointmentInfo((prev) => ({
      ...prev,
      ...info,
    }));
  };

  const clearAppointmentInfo = () => {
    setAppointmentInfo({});
  };

  return (
    <ChatContext.Provider
      value={{ appointmentInfo, updateAppointmentInfo, clearAppointmentInfo }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }

  return context;
}
