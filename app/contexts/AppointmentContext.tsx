import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface AppointmentContextType {
  appointmentCount: number;
  refreshAppointmentCount: () => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(
  undefined
);

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [appointmentCount, setAppointmentCount] = useState<number>(0);

  const fetchAppointmentCount = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        console.error("Usuário não autenticado");
        setAppointmentCount(0);
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("appointments")
        .select("id")
        .eq("user_id", userId)
        .gte("date", today)
        .order("date", { ascending: true });

      if (error) {
        console.error("Erro ao buscar consultas:", error);
        setAppointmentCount(0);
        return;
      }

      setAppointmentCount(data?.length || 0);
    } catch (error) {
      console.error("Erro ao buscar consultas:", error);
      setAppointmentCount(0);
    }
  };

  useEffect(() => {
    fetchAppointmentCount();
  }, []);

  const refreshAppointmentCount = async () => {
    await fetchAppointmentCount();
  };

  return (
    <AppointmentContext.Provider
      value={{ appointmentCount, refreshAppointmentCount }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointment = () => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error(
      "useAppointment must be used within an AppointmentProvider"
    );
  }
  return context;
};
